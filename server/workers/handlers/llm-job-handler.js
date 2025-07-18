"use strict";

const { callGpt } = require("../../services/gpt/gpt-service.js");

async function handleRecipeGeneration(ingredients) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const result = await callGpt({
    taskType: "recipe",
    data: { ingredients },
  });
  return result;
}

async function handleOCRExtraction(fullText) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const result = await callGpt({
    taskType: "ocr_format",
    data: { fullText: fullText },
    temperature: 0.1,
  });
  return result;
}

module.exports = {
  handleRecipeGeneration,
  handleOCRExtraction,
};
