import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendTextMessage = mutation({
  args: {
    sender: v.string(),
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .first();
    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }
    if (!conversation.participants.includes(user._id)) {
      throw new ConvexError("You are not a participant of this conversation");
    }

    await ctx.db.insert("messages", {
      conversation: args.conversationId,
      sender: args.sender,
      content: args.content,
      messageType: "text",
    });
  },
});

export const getConversationMessages = query({
  args: {
    conversation: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversation", args.conversation)
      )
      .collect();

    const userProfileCache = new Map();

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        if (message.sender === "ChatGPT") {
          const image =
            message.messageType === "text" ? "/gpt.png" : "dall-e.png";
          return { ...message, sender: { name: "ChatGPT", image } };
        }
        let sender;
        // Check if sender profile is in cache
        if (userProfileCache.has(message.sender)) {
          sender = userProfileCache.get(message.sender);
        } else {
          // Fetch sender profile from the database
          sender = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), message.sender))
            .first();
          // Cache the sender profile
          userProfileCache.set(message.sender, sender);
        }

        return { ...message, sender };
      })
    );

    return messagesWithSender;
  },
});
