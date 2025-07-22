const path = require("path");

const fileNameFormatter = (file) => {
  const ext = path.extname(file.originalname);
  const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${unique}${ext}`;
};

module.exports = {
  fileNameFormatter,
};