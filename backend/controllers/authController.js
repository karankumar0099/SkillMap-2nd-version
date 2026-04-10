const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please add all fields" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        completedSteps: []
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            completedSteps: user.completedSteps,
            customRoadmaps: user.customRoadmaps,
            visitedLinks: user.visitedLinks,
            quizAttempts: user.quizAttempts,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            completedSteps: user.completedSteps,
            customRoadmaps: user.customRoadmaps,
            visitedLinks: user.visitedLinks,
            quizAttempts: user.quizAttempts,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: "Invalid credentials" });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json(user);
};

// @desc    Update user progress (completed steps)
// @route   PUT /api/auth/progress
// @access  Private
const updateProgress = async (req, res) => {
    const { roadmapId, stepId, isCompleted } = req.body;

    if (!roadmapId || !stepId) {
        return res.status(400).json({ message: "Missing roadmapId or stepId" });
    }

    const user = await User.findById(req.user.id);

    if (user) {
        if (isCompleted) {
            // Add if not exists
            const exists = user.completedSteps.some(step => step.roadmapId === roadmapId && step.stepId === stepId);
            if (!exists) {
                user.completedSteps.push({ roadmapId, stepId });
            }
        } else {
            // Remove if exists
            user.completedSteps = user.completedSteps.filter(step => !(step.roadmapId === roadmapId && step.stepId === stepId));
        }

        await user.save();
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

// @desc    Save custom AI roadmap
// @route   POST /api/auth/save-roadmap
// @access  Private
const saveRoadmap = async (req, res) => {
    const { roadmap } = req.body;
    if (!roadmap || !roadmap.id) {
        return res.status(400).json({ message: "Invalid roadmap data" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if roadmap ID already exists in customRoadmaps
    const exists = user.customRoadmaps.find(r => r.id === roadmap.id);
    if (!exists) {
        user.customRoadmaps.push(roadmap);
        await user.save();
    }

    res.status(200).json(user.customRoadmaps);
};

// @desc    Delete a roadmap (custom or clear progress for standard)
// @route   DELETE /api/auth/roadmap/:id
// @access  Private
const deleteRoadmap = async (req, res) => {
    const roadmapId = req.params.id;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove from customRoadmaps
    user.customRoadmaps = user.customRoadmaps.filter(r => r.id !== roadmapId);
    
    // Clear progress for this roadmapId
    user.completedSteps = user.completedSteps.filter(s => s.roadmapId !== roadmapId);
    user.visitedLinks = user.visitedLinks.filter(s => s.roadmapId !== roadmapId);
    user.quizAttempts = user.quizAttempts.filter(s => s.roadmapId !== roadmapId);

    await user.save();
    res.status(200).json(user);
};

// @desc    Track link visit
// @route   POST /api/auth/track-visit
// @access  Private
const trackVisit = async (req, res) => {
    const { roadmapId, stepId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.visitedLinks.some(s => s.roadmapId === roadmapId && s.stepId === stepId);
    if (!exists) {
        user.visitedLinks.push({ roadmapId, stepId });
        await user.save();
    }
    res.status(200).json(user.visitedLinks);
};

// @desc    Track quiz attempt
// @route   POST /api/auth/track-quiz
// @access  Private
const trackQuiz = async (req, res) => {
    const { roadmapId, stepId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.quizAttempts.some(s => s.roadmapId === roadmapId && s.stepId === stepId);
    if (!exists) {
        user.quizAttempts.push({ roadmapId, stepId });
        await user.save();
    }
    res.status(200).json(user.quizAttempts);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProgress,
    saveRoadmap,
    deleteRoadmap,
    trackVisit,
    trackQuiz,
};
