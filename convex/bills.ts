import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

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

export const renameBill = mutation({
  args: {
    billId: v.id("bills"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.billId, { name: args.name });
  },
});

export const updateBill = mutation({
  args: {
    billId: v.id("bills"),
    billType: v.optional(v.string()),
    unitsConsumed: v.optional(v.number()),
    tariffRate: v.optional(v.number()),
    extraCharges: v.optional(v.number()),
    taxes: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    baseAmount: v.optional(v.number()),
    billDate: v.optional(v.string()),
    month: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { billId, ...updates } = args;
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(billId, cleanUpdates);
    }
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

// ── Payment Tracking ──

export const markBillAsPaid = mutation({
  args: {
    billId: v.id("bills"),
    isPaid: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.billId, {
      isPaid: args.isPaid,
      paidDate: args.isPaid ? new Date().toISOString().split("T")[0] : undefined,
    });
  },
});

export const setBillDueDate = mutation({
  args: {
    billId: v.id("bills"),
    dueDate: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.billId, { dueDate: args.dueDate });
  },
});

export const getUpcomingBills = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const bills = await ctx.db
      .query("bills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const today = new Date().toISOString().split("T")[0];
    return bills
      .filter((b) => b.dueDate && !b.isPaid && b.dueDate >= today)
      .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1));
  },
});

export const getOverdueBills = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const bills = await ctx.db
      .query("bills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const today = new Date().toISOString().split("T")[0];
    return bills.filter((b) => b.dueDate && !b.isPaid && b.dueDate < today);
  },
});

// ── Cron: check reminders (called daily) ──

export const checkDueReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    const todayStr = today.toISOString().split("T")[0];
    const in3DaysStr = in3Days.toISOString().split("T")[0];

    // Find all bills with due dates in the next 3 days that aren't paid
    const allBills = await ctx.db.query("bills").collect();
    const dueSoon = allBills.filter(
      (b) => b.dueDate && !b.isPaid && b.dueDate >= todayStr && b.dueDate <= in3DaysStr
    );

    // Create reminders for bills that don't already have one
    for (const bill of dueSoon) {
      const existing = await ctx.db
        .query("reminders")
        .withIndex("by_user", (q) => q.eq("userId", bill.userId))
        .collect();
      const alreadyReminded = existing.some(
        (r) => r.billId === bill._id && r.reminderDate === todayStr
      );
      if (!alreadyReminded) {
        await ctx.db.insert("reminders", {
          userId: bill.userId,
          billId: bill._id,
          message: `Your ${bill.billType} bill of ${bill.totalAmount} PKR is due on ${bill.dueDate}!`,
          reminderDate: todayStr,
          isTriggered: true,
        });
      }
    }
  },
});

export const getUserReminders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
  },
});

export const dismissReminder = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.reminderId);
  },
});
