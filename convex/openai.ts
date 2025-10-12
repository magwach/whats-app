import { v } from "convex/values";
import openai from "../utils/open.router";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const chat = action({
  args: {
    message: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const completion = await openai.chat.completions.create({
      model: "x-ai/grok-4-fast",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Keep replies short and concise, maximum 3 sentences.",
        },
        {
          role: "user",
          content: args.message,
        },
      ],
    });

    const response = completion.choices[0].message;

    await ctx.runMutation(api.messages.sendChatGPTMessage, {
      conversationId: args.conversationId,
      content:
        response?.content || "I'm sorry, I couldn't generate a response.",
    });
  },
});
