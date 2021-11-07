const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, path.resolve(__dirname, '..', 'src', 'uploads'));
  },
  
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}.jpeg`);
  },
});

const filefilter = (req, file, cb) => {
  if (file.mimetype !== 'image/jpeg' || file.mimetype !== 'image/jpg') {
    cb(null, false);
  }
  cb(null, true);  
 };

const upload = multer({
  storage,
  filefilter,
});

module.exports = upload;
