const Expense = require("../models/Expense");
const Group = require("../models/Group");
const Transaction = require("../models/Transaction");
const { computeBalances, buildMemberNameMap } = require("../utils/balance");

const toCents = (value) => Math.round(Number(value) * 100);

const buildEqualParticipants = (memberIds, amount) => {
  const totalCents = toCents(amount);
  const count = memberIds.length;
  const base = Math.floor(totalCents / count);
  const remainder = totalCents % count;

  return memberIds.map((memberId, index) => ({
    member: memberId,
    share: Number(((base + (index < remainder ? 1 : 0)) / 100).toFixed(2))
  }));
};

const createExpense = async (req, res) => {
  try {
    const { description, amount, paidBy, splitType, memberIds, splits } = req.body;

    if (!description?.trim()) {
      return res.status(400).json({ message: "Expense description is required." });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0." });
    }

    if (!paidBy) {
      return res.status(400).json({ message: "Payer is required." });
    }

    if (!["equal", "custom"].includes(splitType)) {
      return res.status(400).json({ message: "splitType must be either equal or custom." });
    }

    const group = await Group.findOne({
      _id: req.params.groupId,
      owner: req.user._id
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const memberSet = new Set(group.members.map((member) => member._id.toString()));
    if (!memberSet.has(paidBy.toString())) {
      return res.status(400).json({ message: "Payer does not belong to this group." });
    }

    let participants = [];

    if (splitType === "equal") {
      const validMembers =
        Array.isArray(memberIds) && memberIds.length > 0
          ? memberIds.filter((id) => memberSet.has(id.toString()))
          : group.members.map((member) => member._id.toString());

      if (validMembers.length === 0) {
        return res.status(400).json({ message: "No valid members for equal split." });
      }

      participants = buildEqualParticipants(validMembers, parsedAmount);
    }

    if (splitType === "custom") {
      if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ message: "Custom splits are required." });
      }

      const sanitized = [];
      const seen = new Set();

      for (const split of splits) {
        const memberId = split.member?.toString();
        const share = Number(split.share);

        if (!memberId || !memberSet.has(memberId)) {
          return res.status(400).json({ message: "Invalid member in custom split." });
        }

        if (seen.has(memberId)) {
          return res.status(400).json({ message: "Duplicate member in custom split." });
        }

        if (!share || share <= 0) {
          return res.status(400).json({ message: "Each custom share must be greater than 0." });
        }

        seen.add(memberId);
        sanitized.push({ member: memberId, share: Number(share.toFixed(2)) });
      }

      const total = sanitized.reduce((sum, item) => sum + item.share, 0);
      const diff = Math.abs(toCents(total) - toCents(parsedAmount));
      if (diff > 0) {
        return res.status(400).json({ message: "Custom splits must match total amount exactly." });
      }

      participants = sanitized;
    }

    const expense = await Expense.create({
      group: group._id,
      description: description.trim(),
      amount: Number(parsedAmount.toFixed(2)),
      paidBy,
      splitType,
      participants
    });

    const transactions = participants
      .filter((participant) => participant.member.toString() !== paidBy.toString())
      .map((participant) => ({
        group: group._id,
        type: "expense",
        from: participant.member,
        to: paidBy,
        amount: participant.share,
        expense: expense._id,
        note: description.trim()
      }));

    if (transactions.length > 0) {
      await Transaction.insertMany(transactions);
    }

    return res.status(201).json(expense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.groupId,
      owner: req.user._id
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const memberNameMap = buildMemberNameMap(group.members);
    const expenses = await Expense.find({ group: group._id }).sort({ createdAt: -1 });

    const hydrated = expenses.map((expense) => ({
      _id: expense._id,
      description: expense.description,
      amount: expense.amount,
      splitType: expense.splitType,
      createdAt: expense.createdAt,
      paidBy: {
        _id: expense.paidBy,
        name: memberNameMap[expense.paidBy.toString()]
      },
      participants: expense.participants.map((participant) => ({
        member: {
          _id: participant.member,
          name: memberNameMap[participant.member.toString()]
        },
        share: participant.share
      }))
    }));

    return res.json(hydrated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBalances = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.groupId,
      owner: req.user._id
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const transactions = await Transaction.find({ group: group._id }).sort({ createdAt: 1 });
    const balances = computeBalances(group.members, transactions);

    return res.json(balances);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.groupId,
      owner: req.user._id
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const memberNameMap = buildMemberNameMap(group.members);
    const transactions = await Transaction.find({ group: group._id }).sort({ createdAt: -1 });

    const hydrated = transactions.map((tx) => ({
      _id: tx._id,
      type: tx.type,
      amount: tx.amount,
      note: tx.note,
      createdAt: tx.createdAt,
      from: {
        _id: tx.from,
        name: memberNameMap[tx.from.toString()]
      },
      to: {
        _id: tx.to,
        name: memberNameMap[tx.to.toString()]
      },
      expense: tx.expense
    }));

    return res.json(hydrated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.groupId,
      owner: req.user._id
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      group: group._id
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    await Promise.all([
      Transaction.deleteMany({ group: group._id, expense: expense._id }),
      Expense.deleteOne({ _id: expense._id })
    ]);

    return res.json({ message: "Expense deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getBalances,
  getTransactions,
  deleteExpense
};
