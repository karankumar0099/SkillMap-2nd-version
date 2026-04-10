const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    roadmapId: {
        type: String,
        required: true,
    },
    stepId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: "",
    },
    isBookmarked: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

// A user can only have one note/bookmark status per step in a roadmap
noteSchema.index({ userId: 1, roadmapId: 1, stepId: 1 }, { unique: true });

module.exports = mongoose.model("Note", noteSchema);
