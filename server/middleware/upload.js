const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'photos') {
      cb(null, path.join(__dirname, '../uploads/photos'));
    } else if (file.fieldname === 'audio') {
      cb(null, path.join(__dirname, '../uploads/audio'));
    } else {
      cb(null, path.join(__dirname, '../uploads'));
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'photos') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for photos'), false);
    }
  } else if (file.fieldname === 'audio' || file.fieldname === 'voice_note') {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = upload;
