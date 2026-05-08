const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Test = require('./models/Test');
const Section = require('./models/Section');
const Question = require('./models/Question');
const Option = require('./models/Option');
const Media = require('./models/Media');

// Reliable public-domain media URLs
const MEDIA = {
  penImg: { url: 'https://thumbs.dreamstime.com/z/pen-14088050.jpg?ct=jpeg', type: 'image' },
  clockImg: { url: 'https://thumbs.dreamstime.com/b/clock-2506372.jpg?w=992', type: 'image' },
  cubeImg: { url: 'https://thumbs.dreamstime.com/z/rubik-s-cube-9509762.jpg?ct=jpeg', type: 'image' },
  lionImg: { url: 'https://cdn.pixabay.com/photo/2018/07/31/22/08/lion-3576045_640.jpg', type: 'image' },
  rhinoImg: { url: 'https://cdn.pixabay.com/photo/2017/10/20/10/58/elephant-2870777_640.jpg', type: 'image' },
  camelImg: { url: 'https://thumbs.dreamstime.com/z/camel-qatari-desert-31652.jpg?ct=jpeg', type: 'image' },
  shapesImg: { url: 'https://thumbs.dreamstime.com/b/block-shapes-6434470.jpg?w=768', type: 'image' },
  trailImg: { url: 'https://cdn.pixabay.com/photo/2016/06/03/13/57/digital-marketing-1433427_640.jpg', type: 'image' },
  keyImg: { url: 'https://thumbs.dreamstime.com/z/golden-key-14522123.jpg?ct=jpeg', type: 'image' },
  flowerImg: { url: 'https://cdn.pixabay.com/photo/2015/04/19/08/32/marguerite-729510_640.jpg', type: 'image' },
  fruitImg: { url: 'https://thumbs.dreamstime.com/b/citrus-fruit-inclu…-washed-stainless-steel-basket-71380198.jpg?w=992', type: 'image' },
  houseImg: { url: 'https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_640.jpg', type: 'image' },
  audioWord: { url: 'https://translate.google.com/translate_tts?ie=UTF-8&q=apple&tl=en&client=tw-ob', type: 'audio' },
  videoBBB: { url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video' }
};

async function createMediaDocs() {
  const docs = {};
  for (const [key, val] of Object.entries(MEDIA)) {
    docs[key] = await Media.create({ url: val.url, type: val.type, filename: key });
  }
  return docs;
}

async function Q(sectionId, data, mediaIds = []) {
  const q = await Question.create({ section: sectionId, ...data, media: mediaIds });
  await Section.findByIdAndUpdate(sectionId, { $push: { questions: q._id } });
  if (data.opts) {
    for (const o of data.opts) {
      const opt = await Option.create({ question: q._id, ...o });
      await Question.findByIdAndUpdate(q._id, { $push: { options: opt._id } });
    }
  }
  return q;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany({}), Test.deleteMany({}), Section.deleteMany({}), Question.deleteMany({}), Option.deleteMany({}), Media.deleteMany({})]);

  const pw = await bcrypt.hash('admin123', 10);
  await User.create([
    { name: 'Admin', email: 'admin@evalix.com', password: pw, role: 'admin' },
    { name: 'Tester', email: 'tester@evalix.com', password: pw, role: 'tester' },
    { name: 'Participant', email: 'user@evalix.com', password: pw, role: 'participant' }
  ]);
  console.log('Users created');

  const m = await createMediaDocs();
  console.log('Media created');

  // ======================== MMSE (12 questions) ========================
  const mmse = await Test.create({ title: 'Mini-Mental State Examination (MMSE)', titleMr: 'मिनी-मेंटल स्टेट परीक्षा (MMSE)', description: 'Standard 30-point cognitive screening for orientation, memory, attention, language and visual construction', descriptionMr: 'अभिमुखता, स्मरणशक्ती, लक्ष, भाषा आणि दृश्य-बांधकामासाठी मानक ३०-गुण संज्ञानात्मक तपासणी', type: 'MMSE', duration: 15, totalMarks: 30, isPublished: true });
  const ms1 = await Section.create({ test: mmse._id, title: 'Orientation', titleMr: 'अभिमुखता', order: 0 });
  const ms2 = await Section.create({ test: mmse._id, title: 'Registration & Recall', titleMr: 'नोंदणी आणि स्मरण', order: 1 });
  const ms3 = await Section.create({ test: mmse._id, title: 'Attention & Language', titleMr: 'लक्ष आणि भाषा', order: 2 });
  const ms4 = await Section.create({ test: mmse._id, title: 'Visual Construction', titleMr: 'दृश्य बांधकाम', order: 3 });
  await Test.findByIdAndUpdate(mmse._id, { sections: [ms1._id, ms2._id, ms3._id, ms4._id] });

  await Q(ms1._id, { text: 'What year is it currently?', textMr: 'सध्या कोणते वर्ष चालू आहे?', type: 'Numerical', marks: 1, correctAnswer: '2026', order: 0 });
  await Q(ms1._id, { text: 'What season is it right now?', textMr: 'आत्ता कोणता ऋतू आहे?', type: 'SCMCQ', marks: 1, order: 1, opts: [{ text: 'Summer', textMr: 'उन्हाळा', isCorrect: true }, { text: 'Winter', textMr: 'हिवाळा' }, { text: 'Monsoon', textMr: 'पावसाळा' }, { text: 'Spring', textMr: 'वसंत' }] });
  await Q(ms1._id, { text: 'Which country are you currently in?', textMr: 'तुम्ही सध्या कोणत्या देशात आहात?', type: 'SCMCQ', marks: 1, order: 2, opts: [{ text: 'India', textMr: 'भारत', isCorrect: true }, { text: 'USA', textMr: 'अमेरिका' }, { text: 'UK', textMr: 'ब्रिटन' }, { text: 'Japan', textMr: 'जपान' }] });
  await Q(ms2._id, { text: 'Remember these three words: Apple, Table, Penny. Now write them below.', textMr: 'हे तीन शब्द लक्षात ठेवा: सफरचंद, टेबल, नाणे. आता ते खाली लिहा.', type: 'Text', marks: 3, order: 0 });
  await Q(ms2._id, { text: 'Recall the three words from earlier (Apple, Table, Penny)', textMr: 'आधी सांगितलेले तीन शब्द पुन्हा लिहा (सफरचंद, टेबल, नाणे)', type: 'Text', marks: 3, order: 1 });
  await Q(ms3._id, { text: 'Subtract 7 from 100. Keep subtracting 7. What is the final result after 5 subtractions?', textMr: '१०० मधून ७ वजा करा. ७ वजा करत राहा. ५ वेळा वजा केल्यावर अंतिम उत्तर काय?', type: 'Numerical', marks: 5, correctAnswer: '65', order: 0 });
  await Q(ms3._id, { text: 'What is this object? Look at the image carefully.', textMr: 'ही वस्तू काय आहे? चित्र नीट पहा.', type: 'SCMCQ', marks: 1, order: 1, opts: [{ text: 'Pen', textMr: 'पेन', isCorrect: true }, { text: 'Pencil', textMr: 'पेन्सिल' }, { text: 'Marker', textMr: 'मार्कर' }, { text: 'Brush', textMr: 'ब्रश' }] }, [m.penImg._id]);
  await Q(ms3._id, { text: 'What is this object? Identify it from the image.', textMr: 'ही वस्तू काय आहे? चित्रावरून ओळखा.', type: 'SCMCQ', marks: 1, order: 2, opts: [{ text: 'Key', textMr: 'चावी', isCorrect: true }, { text: 'Lock', textMr: 'कुलूप' }, { text: 'Ring', textMr: 'अंगठी' }] }, [m.keyImg._id]);
  await Q(ms3._id, { text: 'Repeat this sentence: "No ifs, ands, or buts"', textMr: 'हे वाक्य पुन्हा सांगा: "जर, आणि, पण नाही"', type: 'Text', marks: 1, order: 3 });
  await Q(ms3._id, { text: 'Write a complete sentence of your choice', textMr: 'तुमच्या आवडीचे एक पूर्ण वाक्य लिहा', type: 'Text', marks: 1, order: 4 });
  await Q(ms4._id, { text: 'Look at the overlapping shapes and draw them on paper. Upload your drawing.', textMr: 'एकमेकांवर आच्छादित आकार पहा आणि कागदावर काढा. तुमचे चित्र अपलोड करा.', type: 'FileUpload', marks: 1, order: 0 }, [m.shapesImg._id]);
  await Q(ms4._id, { text: 'Follow the three-step command: Take a paper, fold it in half, and place it on the table. Describe what you did.', textMr: 'तीन-चरणांची सूचना पाळा: कागद घ्या, अर्ध्यावर दुमडा आणि टेबलवर ठेवा. तुम्ही काय केले ते सांगा.', type: 'Text', marks: 3, order: 1 });

  // ======================== MoCA (13 questions) ========================
  const moca = await Test.create({ title: 'Montreal Cognitive Assessment (MoCA)', titleMr: 'मॉन्ट्रियल संज्ञानात्मक मूल्यांकन (MoCA)', description: 'Sensitive screening tool for mild cognitive impairment covering visuospatial, naming, memory, attention, language, abstraction and orientation', descriptionMr: 'दृश्य-स्थान, नामकरण, स्मरणशक्ती, लक्ष, भाषा, अमूर्तता आणि अभिमुखता यांसाठी सौम्य संज्ञानात्मक कमतरता तपासणी', type: 'MoCA', duration: 15, totalMarks: 30, isPublished: true });
  const mc1 = await Section.create({ test: moca._id, title: 'Visuospatial / Executive', titleMr: 'दृष्य-स्थान / कार्यकारी', order: 0 });
  const mc2 = await Section.create({ test: moca._id, title: 'Naming', titleMr: 'नामकरण', order: 1 });
  const mc3 = await Section.create({ test: moca._id, title: 'Attention & Memory', titleMr: 'लक्ष आणि स्मरण', order: 2 });
  const mc4 = await Section.create({ test: moca._id, title: 'Language & Abstraction', titleMr: 'भाषा आणि अमूर्तता', order: 3 });
  const mc5 = await Section.create({ test: moca._id, title: 'Orientation', titleMr: 'अभिमुखता', order: 4 });
  await Test.findByIdAndUpdate(moca._id, { sections: [mc1._id, mc2._id, mc3._id, mc4._id, mc5._id] });

  await Q(mc1._id, { text: 'Copy this 3D cube drawing on paper and upload your image.', textMr: 'हे त्रिमितीय घन कागदावर काढा आणि चित्र अपलोड करा.', type: 'FileUpload', marks: 1, order: 0 }, [m.cubeImg._id]);
  await Q(mc1._id, { text: 'Draw a clock face showing the time 11:10 on paper and upload it.', textMr: 'कागदावर ११:१० वेळ दाखवणारे घड्याळ काढा आणि अपलोड करा.', type: 'FileUpload', marks: 3, order: 1 }, [m.clockImg._id]);
  await Q(mc2._id, { text: 'Name this animal shown in the image.', textMr: 'चित्रात दाखवलेल्या प्राण्याचे नाव सांगा.', type: 'SCMCQ', marks: 1, order: 0, opts: [{ text: 'Lion', textMr: 'सिंह', isCorrect: true }, { text: 'Tiger', textMr: 'वाघ' }, { text: 'Bear', textMr: 'अस्वल' }] }, [m.lionImg._id]);
  await Q(mc2._id, { text: 'Identify the animal in this picture.', textMr: 'या चित्रातील प्राणी ओळखा.', type: 'SCMCQ', marks: 1, order: 1, opts: [{ text: 'Elephant', textMr: 'हत्ती', isCorrect: true }, { text: 'Rhino', textMr: 'गेंडा' }, { text: 'Hippo', textMr: 'पाणघोडा' }] }, [m.rhinoImg._id]);
  await Q(mc2._id, { text: 'What animal is shown here?', textMr: 'येथे कोणता प्राणी दाखवला आहे?', type: 'SCMCQ', marks: 1, order: 2, opts: [{ text: 'Camel', textMr: 'उंट', isCorrect: true }, { text: 'Horse', textMr: 'घोडा' }, { text: 'Donkey', textMr: 'गाढव' }] }, [m.camelImg._id]);
  await Q(mc3._id, { text: 'Repeat this sentence exactly: "I only know that John is the one to help today."', textMr: 'हे वाक्य तंतोतंत पुन्हा सांगा: "मला फक्त माहित आहे की जॉन आज मदत करणारा आहे."', type: 'Text', marks: 2, order: 0 });
  await Q(mc3._id, { text: 'Starting from 100, subtract 7 five times. What is the final answer?', textMr: '१०० पासून सुरू करून ५ वेळा ७ वजा करा. अंतिम उत्तर काय?', type: 'Numerical', marks: 3, correctAnswer: '65', order: 1 });
  await Q(mc3._id, { text: 'Select ALL animals from this list:', textMr: 'या यादीतून सर्व प्राणी निवडा:', type: 'MCMCQ', marks: 2, order: 2, opts: [{ text: 'Cat', textMr: 'मांजर', isCorrect: true }, { text: 'Table', textMr: 'टेबल' }, { text: 'Dog', textMr: 'कुत्रा', isCorrect: true }, { text: 'Lamp', textMr: 'दिवा' }, { text: 'Fish', textMr: 'मासा', isCorrect: true }] });
  await Q(mc4._id, { text: 'What do a train and a bicycle have in common?', textMr: 'ट्रेन आणि सायकलमध्ये काय समान आहे?', type: 'Text', marks: 2, order: 0 });
  await Q(mc4._id, { text: 'How are a ruler and a watch similar?', textMr: 'पट्टी आणि घड्याळ कसे सारखे आहेत?', type: 'Text', marks: 2, order: 1 });
  await Q(mc4._id, { text: 'Name as many words starting with "F" as you can in one minute.', textMr: 'एका मिनिटात "F" ने सुरू होणारे शक्य तितके शब्द लिहा.', type: 'Text', marks: 1, order: 2 });
  await Q(mc5._id, { text: 'What is today\'s date (day of month)?', textMr: 'आजची तारीख काय आहे (महिन्याचा दिवस)?', type: 'Numerical', marks: 1, correctAnswer: '27', order: 0 });
  await Q(mc5._id, { text: 'What day of the week is it today?', textMr: 'आज आठवड्याचा कोणता दिवस आहे?', type: 'SCMCQ', marks: 1, order: 1, opts: [{ text: 'Sunday', textMr: 'रविवार', isCorrect: true }, { text: 'Monday', textMr: 'सोमवार' }, { text: 'Saturday', textMr: 'शनिवार' }, { text: 'Friday', textMr: 'शुक्रवार' }] });

  // ======================== ACE-III (12 questions) ========================
  const ace = await Test.create({ title: "Addenbrooke's Cognitive Examination III (ACE-III)", titleMr: 'ॲडनब्रुक संज्ञानात्मक परीक्षा III (ACE-III)', description: 'Comprehensive 100-point cognitive battery covering attention, memory, verbal fluency, language, and visuospatial abilities', descriptionMr: 'लक्ष, स्मरणशक्ती, शाब्दिक ओघवता, भाषा, आणि दृश्य-स्थान क्षमतांसाठी व्यापक १००-गुण संज्ञानात्मक चाचणी', type: 'ACE-III', duration: 25, totalMarks: 40, isPublished: true });
  const ac1 = await Section.create({ test: ace._id, title: 'Attention & Orientation', titleMr: 'लक्ष आणि अभिमुखता', order: 0 });
  const ac2 = await Section.create({ test: ace._id, title: 'Memory', titleMr: 'स्मरणशक्ती', order: 1 });
  const ac3 = await Section.create({ test: ace._id, title: 'Verbal Fluency', titleMr: 'शाब्दिक ओघवता', order: 2 });
  const ac4 = await Section.create({ test: ace._id, title: 'Language', titleMr: 'भाषा', order: 3 });
  const ac5 = await Section.create({ test: ace._id, title: 'Visuospatial', titleMr: 'दृश्य-स्थान', order: 4 });
  await Test.findByIdAndUpdate(ace._id, { sections: [ac1._id, ac2._id, ac3._id, ac4._id, ac5._id] });

  await Q(ac1._id, { text: 'What day of the week is it today?', textMr: 'आज आठवड्याचा कोणता दिवस आहे?', type: 'SCMCQ', marks: 1, order: 0, opts: [{ text: 'Monday', textMr: 'सोमवार' }, { text: 'Sunday', textMr: 'रविवार', isCorrect: true }, { text: 'Wednesday', textMr: 'बुधवार' }, { text: 'Friday', textMr: 'शुक्रवार' }] });
  await Q(ac1._id, { text: 'What is 93 minus 7?', textMr: '९३ वजा ७ किती?', type: 'Numerical', marks: 2, correctAnswer: '86', order: 1 });
  await Q(ac1._id, { text: 'Spell the word "WORLD" backwards.', textMr: '"WORLD" शब्द उलटा लिहा.', type: 'Text', marks: 2, order: 2 });
  await Q(ac2._id, { text: 'Memorize these words: Lemon, Key, Ball. Now write them below.', textMr: 'हे शब्द लक्षात ठेवा: लिंबू, चावी, चेंडू. आता ते खाली लिहा.', type: 'Text', marks: 3, order: 0 });
  await Q(ac2._id, { text: 'Look at this image for 30 seconds. Then describe what you see.', textMr: '३० सेकंद हे चित्र पहा. नंतर तुम्हाला काय दिसते ते सांगा.', type: 'Text', marks: 3, order: 1 }, [m.houseImg._id]);
  await Q(ac3._id, { text: 'Name as many animals as you can think of. Type them all.', textMr: 'तुम्हाला आठवतील तितक्या प्राण्यांची नावे लिहा.', type: 'Text', marks: 4, order: 0 });
  await Q(ac3._id, { text: 'Name as many words starting with the letter "S" as you can.', textMr: '"S" अक्षराने सुरू होणारे शक्य तितके शब्द लिहा.', type: 'Text', marks: 4, order: 1 });
  await Q(ac4._id, { text: 'Describe what you see in this image in one complete sentence.', textMr: 'या चित्रात तुम्हाला काय दिसते ते एका पूर्ण वाक्यात सांगा.', type: 'Text', marks: 3, order: 0 }, [m.flowerImg._id]);
  await Q(ac4._id, { text: 'Which of these are fruits? Select all that apply.', textMr: 'यापैकी कोणती फळे आहेत? सर्व लागू निवडा.', type: 'MCMCQ', marks: 3, order: 1, opts: [{ text: 'Apple', textMr: 'सफरचंद', isCorrect: true }, { text: 'Carrot', textMr: 'गाजर' }, { text: 'Banana', textMr: 'केळे', isCorrect: true }, { text: 'Potato', textMr: 'बटाटा' }, { text: 'Grape', textMr: 'द्राक्ष', isCorrect: true }] });
  await Q(ac5._id, { text: 'Copy the overlapping geometric shapes on paper and upload your drawing.', textMr: 'एकमेकांवर आच्छादित भौमितिक आकार कागदावर काढा आणि अपलोड करा.', type: 'FileUpload', marks: 5, order: 0 }, [m.shapesImg._id]);
  await Q(ac5._id, { text: 'Draw a clock showing the time 2:45 and upload it.', textMr: '२:४५ वेळ दाखवणारे घड्याळ काढा आणि अपलोड करा.', type: 'FileUpload', marks: 5, order: 1 }, [m.clockImg._id]);
  await Q(ac5._id, { text: 'Look at the image of grapes and describe the colors and shapes you see.', textMr: 'द्राक्षांचे चित्र पहा आणि तुम्हाला दिसणारे रंग आणि आकार सांगा.', type: 'Text', marks: 5, order: 2 }, [m.fruitImg._id]);

  // ======================== CDR (11 questions) ========================
  const cdr = await Test.create({ title: 'Clinical Dementia Rating (CDR)', titleMr: 'क्लिनिकल स्मृतिभ्रंश रेटिंग (CDR)', description: 'Semi-structured clinical interview assessing memory, orientation, judgment, community affairs, home activities, and personal care', descriptionMr: 'स्मरणशक्ती, अभिमुखता, निर्णय, समुदाय व्यवहार, घरगुती क्रिया, आणि वैयक्तिक काळजी मूल्यांकन', type: 'CDR', duration: 20, totalMarks: 30, isPublished: true });
  const cd1 = await Section.create({ test: cdr._id, title: 'Memory', titleMr: 'स्मरणशक्ती', order: 0 });
  const cd2 = await Section.create({ test: cdr._id, title: 'Orientation', titleMr: 'अभिमुखता', order: 1 });
  const cd3 = await Section.create({ test: cdr._id, title: 'Judgment & Problem Solving', titleMr: 'निर्णय आणि समस्या निराकरण', order: 2 });
  const cd4 = await Section.create({ test: cdr._id, title: 'Personal Care & Community', titleMr: 'वैयक्तिक काळजी आणि समुदाय', order: 3 });
  await Test.findByIdAndUpdate(cdr._id, { sections: [cd1._id, cd2._id, cd3._id, cd4._id] });

  await Q(cd1._id, { text: 'Describe a recent personal event from the past week in detail.', textMr: 'गेल्या आठवड्यातील एक वैयक्तिक घटना तपशीलवार सांगा.', type: 'Text', marks: 3, order: 0 });
  await Q(cd1._id, { text: 'Look at this image for 30 seconds. Then describe what you remember.', textMr: '३० सेकंद हे चित्र पहा. नंतर तुम्हाला काय आठवते ते सांगा.', type: 'Text', marks: 3, order: 1 }, [m.houseImg._id]);
  await Q(cd1._id, { text: 'Record yourself describing your morning routine. Upload the recording.', textMr: 'तुमच्या सकाळच्या दिनचर्येचे वर्णन रेकॉर्ड करा. रेकॉर्डिंग अपलोड करा.', type: 'FileUpload', marks: 2, order: 2 });
  await Q(cd2._id, { text: "What is today's date (day of month)?", textMr: 'आजची तारीख काय आहे (महिन्याचा दिवस)?', type: 'Numerical', marks: 2, correctAnswer: '27', order: 0 });
  await Q(cd2._id, { text: 'What city or town are you currently in?', textMr: 'तुम्ही सध्या कोणत्या शहरात आहात?', type: 'Text', marks: 2, order: 1 });
  await Q(cd3._id, { text: 'You found a stamped, addressed envelope on the street. What would you do?', textMr: 'तुम्हाला रस्त्यावर शिक्केयुक्त, पत्ता लिहिलेले लिफाफा सापडले. तुम्ही काय कराल?', type: 'SCMCQ', marks: 3, order: 0, opts: [{ text: 'Drop it in a mailbox', textMr: 'पोस्ट बॉक्समध्ये टाका', isCorrect: true }, { text: 'Open and read it', textMr: 'उघडून वाचा' }, { text: 'Throw it away', textMr: 'फेकून द्या' }, { text: 'Keep it', textMr: 'ठेवा' }] });
  await Q(cd3._id, { text: 'If there is a fire in your house, what steps would you take? Describe briefly.', textMr: 'तुमच्या घरात आग लागली तर तुम्ही कोणती पावले उचलाल? थोडक्यात सांगा.', type: 'Text', marks: 3, order: 1 });
  await Q(cd4._id, { text: 'Describe your typical daily activities and responsibilities.', textMr: 'तुमच्या सामान्य दैनंदिन क्रिया आणि जबाबदाऱ्यांचे वर्णन करा.', type: 'Text', marks: 5, order: 0 });
  await Q(cd4._id, { text: 'Which of these activities can you do independently? Select all that apply.', textMr: 'यापैकी कोणत्या क्रिया तुम्ही स्वतंत्रपणे करू शकता? सर्व लागू निवडा.', type: 'MCMCQ', marks: 4, order: 1, opts: [{ text: 'Cooking meals', textMr: 'जेवण बनवणे', isCorrect: true }, { text: 'Managing finances', textMr: 'आर्थिक व्यवस्थापन', isCorrect: true }, { text: 'Grocery shopping', textMr: 'किराणा खरेदी', isCorrect: true }, { text: 'None of the above', textMr: 'यापैकी काहीही नाही' }] });
  await Q(cd4._id, { text: 'Do you need help with personal care activities?', textMr: 'तुम्हाला वैयक्तिक काळजीच्या क्रियांमध्ये मदत लागते का?', type: 'SCMCQ', marks: 1, order: 2, opts: [{ text: 'No help needed', textMr: 'मदत लागत नाही', isCorrect: true }, { text: 'Occasional help', textMr: 'कधीकधी मदत' }, { text: 'Frequent help', textMr: 'वारंवार मदत' }, { text: 'Full assistance', textMr: 'पूर्ण मदत' }] });
  await Q(cd4._id, { text: 'Watch this short video clip and describe what you observed.', textMr: 'हा छोटा व्हिडिओ क्लिप पहा आणि तुम्ही काय पाहिले ते सांगा.', type: 'Text', marks: 2, order: 3 }, [m.videoBBB._id]);

  console.log('✅ All 4 clinical tests seeded successfully!');
  console.log('   MMSE: 12 questions | MoCA: 13 questions | ACE-III: 12 questions | CDR: 11 questions');
  console.log('   Users: admin@evalix.com / tester@evalix.com / user@evalix.com (password: admin123)');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
