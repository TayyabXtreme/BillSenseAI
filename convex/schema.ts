import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    onboarded: v.boolean(),
    location: v.optional(v.string()),
    avgMonthlyBill: v.optional(v.number()),
    preferredBillType: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  bills: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
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
    aiExplanation: v.optional(v.string()),
    aiTips: v.optional(v.array(v.string())),
    status: v.string(),
    // Payment tracking
    dueDate: v.optional(v.string()),
    isPaid: v.optional(v.boolean()),
    paidDate: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "billDate"]),

  budgets: defineTable({
    userId: v.string(),
    billType: v.string(),
    monthlyLimit: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "billType"]),

  reminders: defineTable({
    userId: v.string(),
    billId: v.id("bills"),
    message: v.string(),
    reminderDate: v.string(),
    isTriggered: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["reminderDate"]),
});
