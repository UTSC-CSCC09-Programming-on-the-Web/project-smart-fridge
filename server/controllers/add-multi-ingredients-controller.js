'use strict';

const {cvQueue, addCvJob, CV_JOB_TYPES} = require("../queues/cv-queue.js");
const { CvTask, CvTaskImage } = require("../models");

const postMultiIngredientsImages = async (req, res) => {
  const images = req.files;
  if (!images || images.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }
  const imageData = images.map(image => ({
    original_filename: image.originalname,
    image_url: image.path ? `ingredients/${image.filename}` : null // this is a relative path
  }));

  const fridgeId = req.fridgeId || req.params.fridgeId; 
  const userId = req.user?.id;
  if (!fridgeId || !userId) {
    return res.status(404).json({ error: "Unauthorized: Fridge ID and User ID are required" });
  }
  const jobType = CV_JOB_TYPES.MultiReceiptsOCR;
  const jobData = {
    fridge_id: fridgeId,
    user_id: userId,
    images: imageData
  };
  const { job, cvTaskRecord } = await addCvJob(jobType, jobData);
  console.log(`Job ${job.id} added to the queue for multi-ingredients OCR`);
  console.log(`CvTask record created with ID: ${cvTaskRecord.id}`);
  res.status(202).json({ 
    images: imageData,
    message: "Accepted: Images uploaded successfully",
    count: images.length
  });
};

module.exports = { postMultiIngredientsImages };