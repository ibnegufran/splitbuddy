const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Transaction = require("../models/Transaction");

const getLandingStats = async (_req, res) => {
  try {
    const [groups, expenseCount, settlementCount, totals] = await Promise.all([
      Group.find({}, { name: 1, members: 1 }).sort({ createdAt: -1 }),
      Expense.countDocuments({}),
      Transaction.countDocuments({ type: "settlement" }),
      Expense.aggregate([{ $group: { _id: null, totalSpent: { $sum: "$amount" } } }])
    ]);

    const latestGroup = groups[0] || null;
    const totalMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);
    const totalSpent = Number((totals[0]?.totalSpent || 0).toFixed(2));

    return res.json({
      latestGroupName: latestGroup?.name || "No group yet",
      totalGroups: groups.length,
      totalMembers,
      totalExpenses: expenseCount,
      totalSettlements: settlementCount,
      totalSpent
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load landing stats." });
  }
};

module.exports = {
  getLandingStats
};

