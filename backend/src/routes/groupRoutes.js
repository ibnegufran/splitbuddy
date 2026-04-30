const express = require("express");
const {
  createGroup,
  getGroups,
  getGroupById,
  addMemberToGroup,
  deleteGroup,
  deleteMemberFromGroup
} = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:groupId", getGroupById);
router.post("/:groupId/members", addMemberToGroup);
router.delete("/:groupId", deleteGroup);
router.delete("/:groupId/members/:memberId", deleteMemberFromGroup);

module.exports = router;
