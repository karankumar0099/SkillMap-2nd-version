const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// @desc    Generate quiz questions for a topic using AI
// @route   POST /api/quiz/generate
// @access  Public
const generateQuiz = async (req, res) => {
    try {
        const { roadmapId, nodeId, nodeTitle, nodeDescription } = req.body;

        if (!nodeTitle) {
            return res.status(400).json({ message: "Node title is required" });
        }

        const prompt = `You are a technical education expert. Generate a quiz with exactly 4 multiple-choice questions about "${nodeTitle}".

Topic description: ${nodeDescription || 'No additional context provided'}

For each question:
1. Make it relevant to ${nodeTitle}
2. Provide 4 options (labeled A, B, C, D)
3. Mark the correct answer (index 0-3)

Return ONLY a valid JSON object. Do not include any preamble, introduction, or markdown code blocks.
The JSON must follow this exact structure:
{
  "title": "${nodeTitle} Quiz",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Respond with raw JSON ONLY.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a quiz generation assistant that responds ONLY with valid JSON."
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.1, // Lower temperature for more consistent JSON
            max_tokens: 1500,
        });

        let aiResponse = chatCompletion.choices[0]?.message?.content || "";
        console.log("AI Quiz Response received for:", nodeTitle);

        // Try to extract JSON from the response
        let quizData;
        try {
            // Clean up the response in case the AI wraps it in markdown blocks
            aiResponse = aiResponse.trim();
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.replace(/^```json/, "").replace(/```$/, "");
            } else if (aiResponse.startsWith("```")) {
                aiResponse = aiResponse.replace(/^```/, "").replace(/```$/, "");
            }
            
            aiResponse = aiResponse.trim();
            
            // Try to find JSON in the response if there's still extra text
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                quizData = JSON.parse(jsonMatch[0]);
            } else {
                quizData = JSON.parse(aiResponse);
            }
        } catch (parseError) {
            console.error("Failed to parse AI response. Raw output:", aiResponse);
            return res.status(500).json({
                message: "Failed to generate valid quiz format",
                error: parseError.message
            });
        }

        // Validate the structure
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            return res.status(500).json({ message: "Invalid quiz structure" });
        }

        res.status(200).json(quizData);
    } catch (error) {
        console.error("Quiz generation error:", error);
        res.status(500).json({ message: "Failed to generate quiz", error: error.message });
    }
};

module.exports = {
    generateQuiz,
};
