import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const getTasks = query({
  args: {},
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("task").collect();
    return tasks;
  },
});

export const addTasks = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("task", {
      text: args.text,
      completed: false,
    });
    return taskId;
  },
});
