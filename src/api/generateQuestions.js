import {extractStoryContent} from "./util.js";

// api/generateQuestions.js
export async function generateQuestions(story, count, signal) {
    if (count <= 0) return [];

    // Extract story text from new structured format or fallback to legacy
    const storyText = extractStoryContent(story);
    const title = story?.title || 'Untitled Story';

    // Use new parameter names with fallbacks for legacy data
    const theme = story?.theme || story?.topic || 'General';
    const gradeLevel = story?.gradeLevel || '2';
    const phonicSkill = story?.phonicSkill || story?.skill || 'General reading';
    const lengthKey = story?.length || 'medium';
    const genre = story?.genre || 'realistic-fiction';
    const questionTypes = story?.questionTypes || [];

    const typeLines = questionTypes.length
        ? questionTypes.map(t => `- ${t}`).join('\n')
        : '- No specific types requested';

    const lengthDesc = {
        'short-story': 'Short = 1 paragraph',
        'medium-story': 'Medium = 2–3 paragraphs',
        'long-story': 'Long = 4+ paragraphs'
    }[lengthKey] || `${lengthKey} sentences`;

    const userPrompt = `Here is the story:

${storyText}

Generate exactly ${count} comprehension questions for this story.
If helpful, focus on these question types:
${typeLines}

STORY METADATA:
- Title: ${title}
- Theme: ${theme}
- Grade Level: ${gradeLevel}
- Reading Skill: ${phonicSkill}
- Story Length: ${lengthDesc}
- Genre: ${genre}

RETURN ONLY valid JSON in this exact format:

{
  "questions": [
    { "text": "Question 1?", "type": "Open-ended" },
    …
  ]
}

No extra text, markdown, or commentary—just the JSON object.`;

    const payload = {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        messages: [
            { role: 'system', content: 'You are a JSON-only assistant. Respond with ONLY valid JSON.' },
            { role: 'user',   content: userPrompt }
        ],
        max_tokens: 8192,
        stream: false
    };

    console.log("generateQuestions prompt ", payload);
    const res = await fetch('https://dream-gateway-us-west.livepeer.cloud/llm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ai-teachers-tool'
        },
        body: JSON.stringify(payload),
        signal
    });
    if (!res.ok) throw new Error(`Questions API error: ${res.status}`);

    const { choices } = await res.json();
    const text = choices[0].message.content;
    const jsonStart = text.indexOf('{');
    const jsonEnd   = text.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < 0) {
        throw new Error('No JSON found in questions response');
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return parsed.questions;
}
