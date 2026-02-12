import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setBudget = mutation({
  args: {
    userId: v.string(),
    billType: v.string(),
    monthlyLimit: v.number(),
  },
  handler: async (ctx, args) => {
    // Upsert: if budget for this type exists, update it
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("billType", args.billType)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { monthlyLimit: args.monthlyLimit });
      return existing._id;
    }

    return await ctx.db.insert("budgets", {
      userId: args.userId,
      billType: args.billType,
      monthlyLimit: args.monthlyLimit,
    });
  },
});

export const getUserBudgets = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const deleteBudget = mutation({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.budgetId);
  },
});
