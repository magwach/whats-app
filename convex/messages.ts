import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

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
