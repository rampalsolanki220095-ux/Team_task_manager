const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/taskmanager';
const mongoUri = process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('your_username') && !process.env.MONGODB_URI.includes('your_password')
  ? process.env.MONGODB_URI
  : DEFAULT_MONGODB_URI;

if (mongoUri === DEFAULT_MONGODB_URI && process.env.MONGODB_URI) {
  console.warn('Using local MongoDB fallback because MONGODB_URI appears to be a placeholder.');
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });