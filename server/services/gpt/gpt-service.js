const axios = require("axios");
const { buildPrompt } = require("./prompt-builder");
const {
  defaultModel,
  defaultTemperature,
  modelSettings,
} = require("./gpt-config");
require("dotenv").config();

async function callGpt({
  taskType,
  data,
  model = defaultModel,
  temperature = defaultTemperature,
}) {
  const messages = buildPrompt(taskType, data);
  const endpoint = modelSettings[model]?.endpoint;

  if (!endpoint)
    throw new Error(`Unknown model or missing endpoint for: ${model}`);
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OpenAI API key");
  }
  try {
    const headers = {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      endpoint,
      {
        model,
        messages,
        temperature,
      },
      { headers }
    );

    const content = response.data.choices[0].message.content;
    // const content = "Sample response from GPT"; // Simulated response for testing
    return content;
  } catch (err) {
    console.error(
      "Error during GPT API call:",
      err.response?.data || err.message
    );
    throw new Error(
      "Failed to call GPT API: " +
        (err.response?.data?.error?.message || err.message)
    );
  }
}

module.exports = {
  callGpt,
};
