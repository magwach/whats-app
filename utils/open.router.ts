import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer":
      "https://whats-jqpt8x8kw-emmanuel-magothes-projects.vercel.app/",
    "X-Title": "whats-app",
  },
});

export default openai;
