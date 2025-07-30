"use strict";
const {  addCvJob, CV_JOB_TYPES } = require("../queues/cv-queue.js");
const { CvTask, CvTaskImage } = require("../models");
const { randomUUID } = require("crypto");
const { addLlmJob, LLM_JOB_TYPES } = require("../queues/llm-queue.js");

async function startOCRReceiptOrchestrator(cvJobData) {
  const traceId = randomUUID();
  const cvJobType = CV_JOB_TYPES.MultiReceiptsOCR;
  const { job, cvTaskRecord } = await addCvJob(cvJobType, cvJobData, traceId);
  return { job, cvTaskRecord };
}

async function onCvOCRJobCompleted(traceId) {
  const cvTask = await CvTask.findOne({ where: { trace_id: traceId } });
  if (!cvTask || cvTask.status !== "done") {
    console.error(
      `CV Task not found or not in done state for traceId ${traceId}`
    );
  }
  const cvTaskImages = await CvTaskImage.findAll({
    where: { cv_task_id: cvTask.id },
  });
  if (!cvTaskImages || cvTaskImages.length === 0) {
    console.error(`No images found for CV Task ${cvTask.id}`);
  }
  const fullText = cvTaskImages
    .map((image) => image.result?.text || "")
    .join(", \n");
  const llmJobData = {
    fullText: fullText,
    user_id: cvTask.user_id,
    fridge_id: cvTask.fridge_id,
    source_cv_task_id: cvTask.id,
  };
  const llmJobType = LLM_JOB_TYPES.OCRextract;
  const { job, llmTaskRecord } = await addLlmJob(
    llmJobType,
    llmJobData,
    traceId
  );
  return { job, llmTaskRecord };
}

module.exports = {
  startOCRReceiptOrchestrator,
  onCvOCRJobCompleted,
};
