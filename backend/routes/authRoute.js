const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateProgress,
    saveRoadmap,
    deleteRoadmap,
    trackVisit,
    trackQuiz,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/progress", protect, updateProgress);
router.post("/save-roadmap", protect, saveRoadmap);
router.delete("/roadmap/:id", protect, deleteRoadmap);
router.post("/track-visit", protect, trackVisit);
router.post("/track-quiz", protect, trackQuiz);

module.exports = router;
