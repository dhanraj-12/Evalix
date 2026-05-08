const { GoogleGenerativeAI } = require('@google/generative-ai');
const Attempt = require('../models/Attempt');
const Response = require('../models/Response');
const Question = require('../models/Question');
const Test = require('../models/Test');

// Initialize Gemini
const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

/**
 * AI Grade — grades Text and FileUpload responses using Gemini
 */
exports.aiGradeAttempt = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(400).json({ message: 'Gemini API key not configured. Add GEMINI_API_KEY to .env' });
    }

    const attempt = await Attempt.findById(req.params.attemptId).populate('test');
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const responses = await Response.find({ attempt: attempt._id })
      .populate({ path: 'question', populate: [{ path: 'options' }, { path: 'media' }] });

    const model = getModel();
    let aiScore = 0;
    const gradedResults = [];

    for (const response of responses) {
      const question = response.question;
      if (!question) continue;

      // Only AI-grade Text and FileUpload types that haven't been manually graded
      if ((question.type !== 'Text' && question.type !== 'FileUpload') || response.isManuallyGraded) {
        continue;
      }

      try {
        let result;

        if (question.type === 'Text') {
          result = await gradeTextResponse(model, question, response, attempt.test);
        } else if (question.type === 'FileUpload' && response.fileUrl) {
          result = await gradeDrawingResponse(model, question, response, attempt.test);
        }

        if (result) {
          response.marksAwarded = Math.min(result.marks, question.marks);
          response.aiFeedback = result.feedback;
          response.isAiGraded = true;
          await response.save();
          aiScore += response.marksAwarded;

          gradedResults.push({
            questionId: question._id,
            questionText: question.text,
            marks: response.marksAwarded,
            maxMarks: question.marks,
            feedback: result.feedback
          });
        }
      } catch (aiErr) {
        console.error(`AI grading failed for question ${question._id}:`, aiErr.message);
        gradedResults.push({
          questionId: question._id,
          questionText: question.text,
          error: aiErr.message
        });
      }
    }

    // Update attempt scores
    const allResponses = await Response.find({ attempt: attempt._id });
    let autoTotal = 0, manualTotal = 0, aiTotal = 0;
    for (const r of allResponses) {
      if (r.isAutoGraded) autoTotal += r.marksAwarded;
      else if (r.isManuallyGraded) manualTotal += r.marksAwarded;
      else if (r.isAiGraded) aiTotal += r.marksAwarded;
    }

    attempt.autoScore = autoTotal;
    attempt.manualScore = manualTotal;
    attempt.aiScore = aiTotal;
    attempt.totalScore = autoTotal + manualTotal + aiTotal;

    // Check if all graded
    const allGraded = allResponses.every(r => r.isAutoGraded || r.isManuallyGraded || r.isAiGraded);
    if (allGraded) attempt.status = 'graded';

    await attempt.save();

    res.json({
      aiScore: aiTotal,
      totalScore: attempt.totalScore,
      gradedCount: gradedResults.filter(r => !r.error).length,
      results: gradedResults,
      attempt
    });
  } catch (err) {
    console.error('AI Grading error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * AI Cognitive Summary — generates a clinical summary of the attempt
 */
exports.aiCognitiveSummary = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(400).json({ message: 'Gemini API key not configured.' });
    }

    const attempt = await Attempt.findById(req.params.attemptId).populate('test').populate('user', 'name');
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const responses = await Response.find({ attempt: attempt._id })
      .populate({ path: 'question', populate: [{ path: 'options' }] });

    const model = getModel();
    const testType = attempt.test?.type || 'Custom';
    const testTitle = attempt.test?.title || 'Assessment';

    // Build response summary for context
    const responseSummary = responses.map((r, i) => {
      const q = r.question;
      if (!q) return null;
      let answer = '';
      if (r.selectedOptions?.length > 0) {
        const selected = q.options?.filter(o => r.selectedOptions.map(s => s.toString()).includes(o._id.toString()));
        answer = selected?.map(o => o.text).join(', ') || 'No selection';
      }
      if (r.textAnswer) answer = r.textAnswer;
      if (r.numericalAnswer !== undefined && r.numericalAnswer !== null) answer = String(r.numericalAnswer);
      if (r.fileUrl) answer += ' [Drawing/File uploaded]';

      return `Q${i + 1} (${q.type}, ${r.marksAwarded}/${q.marks}): "${q.text}" → Answer: "${answer}" ${r.aiFeedback ? `| AI Feedback: ${r.aiFeedback}` : ''}`;
    }).filter(Boolean).join('\n');

    const prompt = `You are a clinical neuropsychologist analyzing results from a "${testType}" cognitive screening test titled "${testTitle}".

Patient scored ${attempt.totalScore}/${attempt.maxScore} (${Math.round((attempt.totalScore / attempt.maxScore) * 100)}%).

Response details:
${responseSummary}

Generate a concise clinical cognitive summary (150-200 words) covering:
1. **Overall Performance**: Score interpretation in context of the ${testType} assessment
2. **Cognitive Domains**: Brief assessment of domains tested (orientation, memory, attention, language, visuospatial ability, executive function — as applicable)
3. **Strengths**: Areas of relatively preserved function
4. **Concerns**: Areas showing potential difficulty or decline
5. **Recommendation**: One-line clinical suggestion

Important: Be professional and measured in tone. Use clinical language but keep it accessible. Do not diagnose — only observe and recommend further evaluation where warranted.

Return ONLY the summary text, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    attempt.aiSummary = summary;
    await attempt.save();

    res.json({ summary, attempt });
  } catch (err) {
    console.error('AI Summary error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Internal helpers ───

async function gradeTextResponse(model, question, response, test) {
  const testType = test?.type || 'Custom';

  const prompt = `You are grading a clinical cognitive screening response (${testType} assessment).

Question: "${question.text}"
Patient's Answer: "${response.textAnswer || '(no answer provided)'}"
Maximum Marks: ${question.marks}
${question.correctAnswer ? `Expected/Reference Answer: "${question.correctAnswer}"` : ''}

Grade this response and return a JSON object with exactly these keys:
- "marks": number (0 to ${question.marks}, can be decimal like 0.5)
- "feedback": string (1-2 sentences explaining the grade — clinical, professional tone)

Consider:
- Clinical accuracy and relevance
- Completeness of the response
- In cognitive screening context, partial credit is appropriate
- If no answer was given, award 0 marks

Return ONLY the JSON object, no other text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Parse JSON from response (handle markdown code blocks)
  const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  return {
    marks: Math.max(0, Math.min(parsed.marks || 0, question.marks)),
    feedback: parsed.feedback || 'AI graded.'
  };
}

async function gradeDrawingResponse(model, question, response, test) {
  const testType = test?.type || 'Custom';

  // For FileUpload with image — use vision capabilities
  const isImage = response.fileUrl && response.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  let prompt, parts;

  if (isImage) {
    // Fetch image for multimodal analysis
    try {
      const imageResponse = await fetch(response.fileUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      const mimeMatch = response.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      const mimeType = mimeMatch ? `image/${mimeMatch[1] === 'jpg' ? 'jpeg' : mimeMatch[1]}` : 'image/png';

      parts = [
        {
          inlineData: {
            data: base64,
            mimeType: mimeType
          }
        },
        {
          text: `You are a clinical neuropsychologist grading a drawing task from a ${testType} cognitive screening assessment.

Question/Task: "${question.text}"
Maximum Marks: ${question.marks}

Evaluate the drawing image above and return a JSON object with exactly:
- "marks": number (0 to ${question.marks}, can be decimal)
- "feedback": string (2-3 sentences — assess accuracy, completeness, spatial organization, line quality)

Grading criteria for clinical drawing tasks:
- Correct shape/structure reproduction
- Appropriate proportions and spatial relationships
- Line quality and steadiness
- Completeness of all required elements
- For clock drawing: number placement, hand positions, circle shape
- For geometric copies: angle accuracy, intersection points, relative sizes

Return ONLY the JSON object.`
        }
      ];

      const result = await model.generateContent(parts);
      const text = result.response.text().trim();
      const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      return {
        marks: Math.max(0, Math.min(parsed.marks || 0, question.marks)),
        feedback: parsed.feedback || 'AI evaluated drawing.'
      };
    } catch (imgErr) {
      console.error('Image analysis failed, falling back to text-only:', imgErr.message);
    }
  }

  // Fallback: text-only grading for non-image files
  prompt = `You are grading a file upload response for a clinical cognitive screening question.

Question: "${question.text}"
File was uploaded: ${response.fileUrl ? 'Yes' : 'No'}
Maximum Marks: ${question.marks}

Since the file content cannot be directly analyzed, award partial marks (${Math.round(question.marks * 0.5)}) for completing the task.

Return a JSON object: {"marks": number, "feedback": "string"}
Return ONLY the JSON object.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  return {
    marks: Math.max(0, Math.min(parsed.marks || 0, question.marks)),
    feedback: parsed.feedback || 'File submitted and evaluated.'
  };
}
