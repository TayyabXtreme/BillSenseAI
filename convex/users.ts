import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      ...args,
      onboarded: false,
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    location: v.optional(v.string()),
    avgMonthlyBill: v.optional(v.number()),
    preferredBillType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      name: args.name,
      location: args.location,
      avgMonthlyBill: args.avgMonthlyBill,
      preferredBillType: args.preferredBillType,
      onboarded: true,
    });
  },
});

export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    avgMonthlyBill: v.optional(v.number()),
    preferredBillType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const { clerkId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(user._id, cleanUpdates);
  },
});
