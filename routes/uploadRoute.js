const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const child_Process = require('child_process');
const fs = require('fs');
const { exec } = child_Process;

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // Save to MongoDB
    const savedFile = await File.create({
      filename: req.file.filename,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Transcribe the file using Python script
    exec(python3, transcribe.py, '${filePath}', (error, stdout, stderr) => {
      // Optional: delete the uploaded file after processing
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Failed to delete uploaded file:', unlinkErr);
        }
      });

      if (error) {
        console.error('Transcription error:', stderr);
        return res
          .status(500)
          .json({ error: 'Transcription failed', details: stderr });
      }

      res.status(200).json({
        message: 'File uploaded and saved to DB',
        file: savedFile,
        fileUrl,
        transcript: stdout.trim(),
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
