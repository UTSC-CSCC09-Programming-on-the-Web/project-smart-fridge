'use strict';



const postMultiIngredientsImages = async (req, res) => {
  const images = req.files;
  if (!images || images.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  res.status(200).json({ 
    images: images.map(image => ({
      filename: image.filename,
    })), 
    message: "Controller:Images uploaded successfully",
    count: images.length
  });
};

module.exports = { postMultiIngredientsImages };