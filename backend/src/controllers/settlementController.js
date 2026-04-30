const Group = require("../models/Group");
const Transaction = require("../models/Transaction");

const createSettlement = async (req, res) => {
  try {
    const { from, to, amount, note } = req.body;

    if (!from || !to) {
      return res.status(400).json({ message: "Both payer and receiver are required." });
    }

    if (from.toString() === to.toString()) {
      return res.status(400).json({ message: "Settlement members cannot be the same." });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Settlement amount must be greater than 0." });
    }

    const group = await Group.findOne({
      _id: req.params.groupId,
      owner: req.user._id
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const memberSet = new Set(group.members.map((member) => member._id.toString()));
    if (!memberSet.has(from.toString()) || !memberSet.has(to.toString())) {
      return res.status(400).json({ message: "Settlement members must belong to this group." });
    }

    const transaction = await Transaction.create({
      group: group._id,
      type: "settlement",
      from,
      to,
      amount: Number(parsedAmount.toFixed(2)),
      note: note?.trim() || "Settlement payment"
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSettlement
};
