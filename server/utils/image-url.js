const getImageUrl = (relativePath) => {
  if (!relativePath) {
    return null;
  }
  const base = process.env.BASE_IMAGE_URL || "http://localhost:3000/uploads";
  return `${base}/${relativePath}`;
};
module.exports = getImageUrl;
