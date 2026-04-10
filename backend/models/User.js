const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    
    completedSteps: [
        {
            roadmapId: { type: String, required: true },
            stepId: { type: String, required: true }
        }
    ],
    
    customRoadmaps: [
        {
            id: { type: String, required: true },
            title: { type: String, required: true },
            description: String,
            nodes: [mongoose.Schema.Types.Mixed]
        }
    ],

    visitedLinks: [
        {
            roadmapId: { type: String, required: true },
            stepId: { type: String, required: true }
        }
    ],

    quizAttempts: [
        {
            roadmapId: { type: String, required: true },
            stepId: { type: String, required: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
