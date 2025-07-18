"use strict";

module.exports = {
  defaultModel: "gpt-4o",
  defaultTemperature: 0.3,
  modelSettings: {
    "gpt-3.5-turbo": { endpoint: "https://api.openai.com/v1/chat/completions" },
    "gpt-4o": { endpoint: "https://api.openai.com/v1/chat/completions" },
  },
};
