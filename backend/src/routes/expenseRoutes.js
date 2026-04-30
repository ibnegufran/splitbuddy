const express = require("express");
const {
  createExpense,
  getExpenses,
  getBalances,
  getTransactions,
  deleteExpense
} = require("../controllers/expenseController");
const { createSettlement } = require("../controllers/settlementController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

router.use(protect);
router.post("/expenses", createExpense);
router.get("/expenses", getExpenses);
router.delete("/expenses/:expenseId", deleteExpense);
router.get("/balances", getBalances);
router.get("/transactions", getTransactions);
router.post("/settlements", createSettlement);

module.exports = router;
