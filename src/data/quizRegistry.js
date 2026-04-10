export const quizRegistry = {
    'frontend': {
        'internet': {
            title: 'How the Internet Works',
            questions: [
                {
                    id: 1,
                    question: "What does DNS stand for?",
                    options: [
                        "Domain Name System",
                        "Dynamic Network Service",
                        "Direct Network Socket",
                        "Domain Network Server"
                    ],
                    correctAnswer: 0
                },
                {
                    id: 2,
                    question: "What is the primary function of an IP address?",
                    options: [
                        "To style web pages",
                        "To identify devices on a network",
                        "To encrypt data",
                        "To store website files"
                    ],
                    correctAnswer: 1
                },
                {
                    id: 3,
                    question: "Which protocol is used for secure communication over a computer network?",
                    options: [
                        "HTTP",
                        "FTP",
                        "HTTPS",
                        "SMTP"
                    ],
                    correctAnswer: 2
                }
            ]
        },
        'html': {
            title: 'HTML Basics',
            questions: [
                {
                    id: 1,
                    question: "What tag is used for the largest heading?",
                    options: ["<head>", "<h6>", "<h1>", "<header>"],
                    correctAnswer: 2
                },
                {
                    id: 2,
                    question: "Which element is used to create a hyperlink?",
                    options: ["<link>", "<a>", "<href>", "<url>"],
                    correctAnswer: 1
                }
            ]
        }
    },
    'backend': {
        'internet': {
            title: 'How the Internet Works',
            questions: [
                {
                    id: 1,
                    question: "What does HTTP stand for?",
                    options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transmission Process", "Hyperlink Text Transfer Protocol"],
                    correctAnswer: 0
                }
            ]
        }
    }
};

export const getQuiz = (roadmapId, nodeId) => {
    if (!quizRegistry[roadmapId]) return null;

    // Normalize nodeId to match registry keys (lowercase)
    const normalizedNodeId = nodeId.toLowerCase();

    // Try exact match
    if (quizRegistry[roadmapId][normalizedNodeId]) {
        return quizRegistry[roadmapId][normalizedNodeId];
    }

    // Try partial match or fallback (simple logic for now)
    // For example if nodeId is 'internet-basic', check if 'internet' exists
    const key = Object.keys(quizRegistry[roadmapId]).find(k => normalizedNodeId.includes(k));
    if (key) return quizRegistry[roadmapId][key];

    return null;
};
