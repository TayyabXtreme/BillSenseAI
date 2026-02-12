import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for bills due within 3 days — runs every 24 hours
crons.interval(
  "check due bill reminders",
  { hours: 24 },
  internal.bills.checkDueReminders
);

export default crons;
