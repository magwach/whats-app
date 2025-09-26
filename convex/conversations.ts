import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
      groupImage = (await ctx.storage.getUrl(args.groupImage)) as string;
    }

    const conversationsId = await ctx.db.insert("conversations", {
      participants: args.participants,
      isGroup: args.isGroup,
      groupImage,
      groupName: args.groupName,
      admin: args.admin,
    });

    return conversationsId;
  },
});

export const getMyConversations = query({
  args: { conversationId: v.optional(v.id("conversations")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new ConvexError("Unauthorized");

    let myConversation: any[] = [];

    if (args.conversationId) {
      const conversation = await ctx.db
        .query("conversations")
        .filter((q) => q.eq(q.field("_id"), args.conversationId))
        .first();

      if (!myConversation) {
        throw new ConvexError("Conversation not found");
      }

      myConversation = [conversation];
    } else {
      const allConversations = await ctx.db.query("conversations").collect();

      myConversation = allConversations.filter((c) => {
        return c.participants.includes(user._id);
      });
    }

    const conversationsWithDetails = await Promise.all(
      myConversation.map(async (conversation) => {
        let userDetails = {};

        if (!conversation.isGroup) {
          const otherUserId = conversation.participants.find(
            (id: string) => id !== user._id
          );

          const userProfile = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), otherUserId))
            .take(1);

          userDetails = userProfile[0];
        }

        const participantProfile = await Promise.all(
          conversation.participants.map(async (participantId: string) => {
            const userProfile = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("_id"), participantId))
              .unique();

            if (userProfile === null) return null;

            return {
              email: userProfile.email,
              name: userProfile.name,
              image: userProfile.image,
              isOnline: userProfile.isOnline,
              _id: userProfile._id,
            };
          })
        );

        const lastMessage = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("conversation"), conversation._id))
          .order("desc")
          .take(1);

        return {
          ...userDetails,
          ...conversation,
          participants: participantProfile.filter((p) => p !== null),
          lastMessage: lastMessage[0]!,
        };
      })
    );
    return conversationsWithDetails;
  },
});

export const kickUserFromGroup = mutation({
  args: { conversationId: v.id("conversations"), userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new ConvexError("Unauthorized");

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .unique();

    if (!conversation) throw new ConvexError("Conversation not found");

    if (!conversation.isGroup)
      throw new ConvexError("Cannot kick user from a one-on-one conversation");

    if (!conversation.admin)
      throw new ConvexError("Group does not have an admin assigned");

    if (conversation.admin !== user._id)
      throw new ConvexError("Only the group admin can kick users");

    if (!conversation.participants.includes(args.userId))
      throw new ConvexError("User is not a participant of the group");

    const updatedParticipants = conversation.participants.filter(
      (id) => id !== args.userId
    );

    await ctx.db.patch(args.conversationId, {
      participants: updatedParticipants,
    });

    return { success: true };
  },
});

export const updateConversationRoomURL = mutation({
  args: { conversationId: v.id("conversations"), roomUrl: v.string() },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .unique();

    if (!conversation) throw new ConvexError("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      videoRoomUrl: args.roomUrl,
    });

    return { success: true };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
