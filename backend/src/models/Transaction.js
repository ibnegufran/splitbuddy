const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    type: {
      type: String,
      enum: ["expense", "settlement"],
      required: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense"
    },
    note: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
