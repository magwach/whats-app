import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.string(),
    isOnline: v.boolean(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    participants: v.array(v.string()),
    admin: v.optional(v.id("users")),
  }),

  messages: defineTable({
    conversation: v.id("conversations"),
    sender: v.string(),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
      v.literal("audio")
    ),
  }).index("by_conversation", ["conversation"]),
});
