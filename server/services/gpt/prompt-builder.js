"use strict";

function buildPrompt(taskType, data) {
  switch (taskType) {
    case "recipe": {
      const ingredientList = data.ingredients
        .map((i) => {
          const quantity = i.quantity ?? "";
          const unit = i.unit ?? "";
          return `${i.name}${quantity}${unit}`;
        })
        .join(", ");
      return [
        {
          role: "system",
          content:
            "You are a professional chef. Based on the ingredients available in the fridge, generate a home-style recipe.",
        },
        {
          role: "user",
          content: `Here is the list of ingredients: ${ingredientList}.

Please generate a recipe in JSON format with the following fields:
{
  "title": "Recipe title",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "steps": ["step1", "step2", ...]
}`,
        },
      ];
    }
    case "ocr_format": {
      const rawText =
        typeof data.fullText === "string"
          ? data.fullText
          : JSON.stringify(data.fullText);
      return [
        {
          role: "system",
          content:
            "You are an OCR-to-ingredient extraction assistant. Your task is to parse raw text into a structured list of ingredients.",
        },
        {
          role: "user",
          content: `The following is the raw OCR text extracted from an image:

"${rawText}"

Please extract all ingredient items from the text, and return them in **valid JSON format** as shown below:

[
  { "name": "Egg", "quantity": 2, "unit": "pieces" },
  { "name": "Milk", "quantity": 500, "unit": "ml" },
  ...
]

Instructions:
1. Only return a JSON array. Do **not** include any explanations or descriptions.
2. If quantity or unit is missing or unclear, use **null**.
3. Make sure the output is valid JSON that can be parsed with JSON.parse().`,
        },
      ];
    }
    default:
      throw new Error(`Unknown GPT task type: ${taskType}`);
  }
}

module.exports = {
  buildPrompt,
};
