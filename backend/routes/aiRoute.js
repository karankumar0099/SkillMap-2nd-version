const express = require("express");
const router = express.Router();

const SKILLMAP_SYSTEM_PROMPT = `
You are SkillMap AI — the built-in learning assistant for SkillMap, a platform that helps developers and tech professionals build structured learning roadmaps and track their progress.

## About SkillMap
SkillMap offers:
- **Pre-built Roadmaps** for roles like Frontend Developer, Backend Developer, Full Stack, DevOps, Data Analyst, AI/ML Engineer, Android, iOS, Blockchain, Cyber Security, Game Developer, Product Manager, UX Designer, Technical Writer and more.
- **Skill-Based Roadmaps** for technologies like React, Python, Java, JavaScript, TypeScript, Node.js, SQL, Vue, Angular, Go, Rust, C++, Swift, Kotlin, Docker, Kubernetes, AWS, Linux, Git, MongoDB, PostgreSQL, Redis, GraphQL, Flutter, React Native, Next.js, Spring Boot, Django, Laravel, WordPress, PHP, HTML, CSS, DSA, System Design, API Design, Prompt Engineering, and many more.
- **AI-powered quiz generation** per roadmap step
- **Progress tracking** with checkboxes for each step
- **Notes & Bookmarks** on each step
- **Portfolio generation** from your completed steps
- **AI Tutor** (that's you!) for learning guidance and Q&A
- **Custom roadmap generation** via the "Generate Roadmap" page

## Your Responsibilities
1. **Answer any learning or career question** clearly and helpfully. Always recommend relevant SkillMap roadmaps when applicable.
2. **Generate roadmaps on demand**: If a user asks "generate a roadmap for X" or "what should I learn to become X", output a clean, numbered, step-by-step roadmap in markdown. Include brief descriptions for each step.
3. **Give resource recommendations**: Suggest documentation, courses, books, or projects.
4. **Career guidance**: Help users decide which tech path suits them based on their interests and goals.
5. **Project recommendations**: Suggest practical projects at the right difficulty level.

## Roadmap Generation Format
When generating a roadmap, always use this format:
\`\`\`
# [Title] Roadmap

**Estimated Time:** X months

## Step 1: [Step Name]
Brief description of what to learn and why.

## Step 2: [Step Name]
...
\`\`\`

## Rules
- Always respond in clean, well-structured **markdown** with headers, bullet points, and code blocks when relevant.
- Keep answers focused and practical. Avoid vague answers.
- When a user asks about a topic, always offer to link it to a SkillMap roadmap.
- Be friendly, encouraging, and concise.
`;

const buildRoadmapContextPrompt = (roadmapContext) => {
    if (!roadmapContext || !roadmapContext.title) return "";

    const stepsList = (roadmapContext.nodes || [])
        .map((n, i) => `  ${i + 1}. **${n.title}** — ${n.description || ""}`)
        .join("\n");

    return `
---
## Current Roadmap Context
The user is currently viewing the **${roadmapContext.title}** roadmap on SkillMap.

The roadmap has the following steps:
${stepsList}

When answering questions, prioritize information relevant to **${roadmapContext.title}**. Suggest resources, projects, and tips that are specific to this roadmap. If the user asks "what should I learn first?", refer to the first steps above.
`;
};

router.post("/chat", async (req, res) => {
    const { message, roadmapContext } = req.body;
    console.log("AI Chat:", message, roadmapContext ? `[Context: ${roadmapContext.title}]` : "");

    const systemContent = SKILLMAP_SYSTEM_PROMPT + buildRoadmapContextPrompt(roadmapContext);

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: systemContent
                        },
                        { role: "user", content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || "Groq API Error");
        }

        res.json({
            reply: data.choices?.[0]?.message?.content || "No response from AI."
        });
    } catch (err) {
        console.error("GROQ ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/generate-roadmap", async (req, res) => {
    const { targetRole, knownSkills } = req.body;
    
    const prompt = `You are an expert curriculum designer. Generate a learning roadmap for: ${targetRole}. 
The user already knows: ${(knownSkills || []).join(", ") || "Nothing"}. 
Avoid making the known skills a major learning step unless it requires advanced focus.
Return ONLY a valid JSON object. Do not wrap it in markdown block like \`\`\`json. The JSON must exactly follow this structure:
{
  "id": "${targetRole.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-ai",
  "title": "${targetRole}",
  "description": "Custom AI-generated roadmap for ${targetRole}",
  "nodes": [
    {
      "id": "step-1",
      "title": "Topic Name",
      "description": "Short description of what to learn",
      "whyImportant": "Why this topic is important for the goal",
      "website": "https://google.com/search?q=Topic"
    }
  ]
}
Include 5 to 8 steps in the nodes array in a logical learning progression. Respond with raw JSON ONLY.`;

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    max_tokens: 1536
                })
            }
        );

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "Groq Error");
        
        let rawText = data.choices?.[0]?.message?.content?.trim() || "{}";
        
        if (rawText.startsWith("\`\`\`json")) rawText = rawText.slice(7);
        else if (rawText.startsWith("\`\`\`")) rawText = rawText.slice(3);
        if (rawText.endsWith("\`\`\`")) rawText = rawText.slice(0, -3);
        
        rawText = rawText.trim();
        const generatedRoadmap = JSON.parse(rawText);
        
        res.json(generatedRoadmap);
    } catch (err) {
        console.error("GROQ ROADMAP GEN ERROR:", err);
        res.status(500).json({ error: "Failed to generate roadmap. " + err.message });
    }
});

module.exports = router;
