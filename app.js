const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const child_Process = require("child_process")


const app = express();
const { exec } = child_Process


// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// File upload route
const uploadRoute = require('./routes/uploadRoute');
app.use('/api', uploadRoute);

module.exports = app;
