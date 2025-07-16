const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const child_Process = require("child_process");
const fs = require("fs")
const { exec } = child_Process

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

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // Save to MongoDB
    const savedFile = await File.create({
      filename: req.file.filename,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    res.status(200).json({
      message: 'File uploaded and saved to DB',
      file: savedFile,
      fileUrl, // ✅ include this in the same response
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// transcriber end-point
router.post("/transcribe", upload.single("audio", (req, res) => {
  const filePath = req.file.path;
  exec(`python 3 transcribe.py ${filePath}`, (error, stdout, stderr) => {
    if(error) return res.status(500).send(stderr)
  })

  res.send(stdout);
  fs.unlinkSync(filePath) //its optional just for code cleanup


}))


module.exports = router;
