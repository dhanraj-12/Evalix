const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const sectionRoutes = require('./routes/sections');
const questionRoutes = require('./routes/questions');
const optionRoutes = require('./routes/options');
const mediaRoutes = require('./routes/media');
const attemptRoutes = require('./routes/attempts');
const responseRoutes = require('./routes/responses');
const gradingRoutes = require('./routes/grading');
const userRoutes = require('./routes/users');
const aiGradingRoutes = require('./routes/aiGrading');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/options', optionRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiGradingRoutes);

app.get('/', (req, res) => res.json({ message: 'Evalix API running' }));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
