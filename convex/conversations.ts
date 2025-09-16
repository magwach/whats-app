import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const createConversation = mutation({
  args: {
    participants: v.array(v.string()),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.id("_storage")),
    admin: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participants"), args.participants),
          q.eq(q.field("participants"), args.participants.reverse())
        )
      )
      .first();

    if (existingConversation) return existingConversation._id;

    let groupImage;

    if (args.groupImage) {
    }

    const conversationsId = await ctx.db.insert("conversations", {
      participants: args.participants,
      isGroup: args.isGroup,
      groupImage: args.groupImage,
      groupName: args.groupName,
      admin: args.admin,
    });

    return conversationsId;
  },
});
