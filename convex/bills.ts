import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBill = mutation({
  args: {
    userId: v.string(),
    billType: v.string(),
    unitsConsumed: v.number(),
    tariffRate: v.number(),
    extraCharges: v.number(),
    taxes: v.number(),
    totalAmount: v.number(),
    baseAmount: v.number(),
    billDate: v.string(),
    month: v.string(),
    ocrRawText: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bills", args);
  },
});

export const getUserBills = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getBillById = query({
  args: { billId: v.id("bills") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.billId);
  },
});

export const updateBillExplanation = mutation({
  args: {
    billId: v.id("bills"),
    aiExplanation: v.string(),
    aiTips: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.billId, {
      aiExplanation: args.aiExplanation,
      aiTips: args.aiTips,
      status: "analyzed",
    });
  },
});

export const deleteBill = mutation({
  args: { billId: v.id("bills") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.billId);
  },
});

export const getRecentBills = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;
    return await ctx.db
      .query("bills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});
