'use strict';



const postMultiIngredientsImages = async (req, res) => {
  res.status(200).json({ message: "Multi-ingredients images uploaded successfully" });
};

module.exports = { postMultiIngredientsImages };