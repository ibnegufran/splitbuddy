const mongoose = require("mongoose");

const expenseParticipantSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    share: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    splitType: {
      type: String,
      enum: ["equal", "custom"],
      required: true
    },
    participants: {
      type: [expenseParticipantSchema],
      validate: {
        validator(value) {
          return value.length > 0;
        },
        message: "Participants are required."
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
