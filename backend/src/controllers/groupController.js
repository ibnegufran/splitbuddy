const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Transaction = require("../models/Transaction");

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Group name is required." });
    }

    const group = await Group.create({
      owner: req.user._id,
      name: name.trim(),
      members: []
    });

    return res.status(201).json(group);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getGroups = async (_req, res) => {
  try {
    const groups = await Group.find({ owner: _req.user._id }).sort({ createdAt: -1 });
    return res.json(groups);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.groupId,
      owner: req.user._id
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }
    return res.json(group);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addMemberToGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Member name is required." });
    }

    const group = await Group.findOne({
      _id: req.params.groupId,
      owner: req.user._id
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const isDuplicate = group.members.some(
      (member) => member.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ message: "Member already exists in this group." });
    }

    group.members.push({ name: name.trim() });
    await group.save();

    return res.status(201).json(group);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({
      _id: req.params.groupId,
      owner: req.user._id
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    await Promise.all([
      Expense.deleteMany({ group: group._id }),
      Transaction.deleteMany({ group: group._id })
    ]);

    return res.json({ message: "Group deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const group = await Group.findOne({
      _id: groupId,
      owner: req.user._id
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const memberExists = group.members.some((member) => member._id.toString() === memberId.toString());
    if (!memberExists) {
      return res.status(404).json({ message: "Member not found in this group." });
    }

    const expensesToDelete = await Expense.find(
      {
        group: group._id,
        $or: [{ paidBy: memberId }, { "participants.member": memberId }]
      },
      { _id: 1 }
    );

    const expenseIds = expensesToDelete.map((expense) => expense._id);

    await Promise.all([
      Expense.deleteMany({
        group: group._id,
        $or: [{ paidBy: memberId }, { "participants.member": memberId }]
      }),
      Transaction.deleteMany({
        group: group._id,
        $or: [{ from: memberId }, { to: memberId }, { expense: { $in: expenseIds } }]
      })
    ]);

    group.members = group.members.filter((member) => member._id.toString() !== memberId.toString());
    await group.save();

    return res.json(group);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  addMemberToGroup,
  deleteGroup,
  deleteMemberFromGroup
};
