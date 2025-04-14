const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up Multer for file upload
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max file size
  fileFilter(req, file, cb) {
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (fileExt === '.pdf' || fileExt === '.png' || fileExt === '.jpg' || fileExt === '.jpeg' || fileExt === '.xlsx' || fileExt === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).single('file');

// Upload File
exports.uploadFile = (req, res) => {
  upload(req, res, (error) => {
    if (error) return res.status(400).json({ message: error.message });

    res.json({ message: 'File uploaded successfully', file: req.file, req: req.body });
  });
};

// Get All Files
exports.getAllFiles = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({ files: [] });
    }

    // Read all files from the uploads directory
    const files = fs.readdirSync(uploadsDir)
      .map(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename,
          path: `/uploads/${filename}`,
          size: stats.size,
          type: path.extname(filename).substring(1),
          createdAt: stats.birthtime,
          lastModified: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date, newest first

    res.status(200).json({ files });
  } catch (error) {
    console.error('Get all files error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get File by ID
exports.getFileById = async (req, res) => {
  const { fileId } = req.params;

  try {
    const filePath = path.join(__dirname, '..', 'uploads', fileId);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete File
exports.deleteFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const filePath = path.join(__dirname, '..', 'uploads', fileId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
