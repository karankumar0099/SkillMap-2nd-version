const express = require("express");
const { getNotes, getNotesByRoadmap, saveNote, deleteNote } = require("../controllers/noteController");

const router = express.Router();

router.get("/user/:userId", getNotes);
router.get("/user/:userId/roadmap/:roadmapId", getNotesByRoadmap);
router.post("/save", saveNote);
router.delete("/:id", deleteNote);

module.exports = router;
