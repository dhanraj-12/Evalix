const Media = require('../models/Media');
const { s3 } = require('../config/s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const media = await Media.create({
      url: req.file.location,
      publicId: req.file.key,
      type: req.body.type || 'image',
      filename: req.file.originalname,
      uploadedBy: req.user._id
    });

    if (req.body.questionId) {
      const Question = require('../models/Question');
      await Question.findByIdAndUpdate(req.body.questionId, { $push: { media: media._id } });
    }

    res.status(201).json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllMedia = async (req, res) => {
  try {
    const media = await Media.find().populate('uploadedBy', 'name').sort('-createdAt');
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    if (media.publicId) {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: media.publicId
      }));
    }
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
