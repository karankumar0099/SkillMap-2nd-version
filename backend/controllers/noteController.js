const Note = require("../models/Note");

exports.getNotes = async (req, res) => {
    try {
        const { userId } = req.params;
        const notes = await Note.find({ userId });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getNotesByRoadmap = async (req, res) => {
    try {
        const { userId, roadmapId } = req.params;
        const notes = await Note.find({ userId, roadmapId });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.saveNote = async (req, res) => {
    try {
        const { userId, roadmapId, stepId, content, isBookmarked } = req.body;
        
        // Ensure that at least userId, roadmapId, and stepId are provided
        if (!userId || !roadmapId || !stepId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        let note = await Note.findOne({ userId, roadmapId, stepId });
        
        if (note) {
            if (content !== undefined) note.content = content;
            if (isBookmarked !== undefined) note.isBookmarked = isBookmarked;
            
            // If content is empty and it's not bookmarked, we could delete it to save space,
            // but for now let's just save the state
            await note.save();
        } else {
            note = new Note({ 
                userId, 
                roadmapId, 
                stepId, 
                content: content || "", 
                isBookmarked: isBookmarked || false 
            });
            await note.save();
        }
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        await Note.findByIdAndDelete(id);
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
