// api/generatePrompts.js
import {extractStoryContent} from "./util.js";

// Grade-level specific thinking prompt strategies
const GRADE_LEVEL_PROMPT_STRATEGIES = {
    'K': {
        complexity: 'Very simple, concrete, visual',
        language: 'Basic vocabulary, short sentences',
        maxWords: 12,
        examples: [
            "Think about your favorite toy. How do you take care of it?",
            "Have you ever lost something important? How did you feel?",
            "What makes you feel happy when you're sad?"
        ]
    },
    '1': {
        complexity: 'Simple experiences, feelings-focused',
        language: 'Familiar words, clear emotions',
        maxWords: 15,
        examples: [
            "Think about a time you helped someone. How did it make you feel?",
            "Have you ever been scared of something new? What happened?",
            "What do you do when you make a mistake?"
        ]
    },
    '2': {
        complexity: 'Personal connections, simple problem-solving',
        language: 'Everyday situations, basic choices',
        maxWords: 18,
        examples: [
            "Think about a time you had to choose between two things you wanted. How did you decide?",
            "Have you ever had to be brave when you were frightened? What did you do?",
            "What makes a good friend? Think about someone special to you."
        ]
    },
    '3': {
        complexity: 'Social situations, moral reasoning',
        language: 'More complex emotions, relationships',
        maxWords: 20,
        examples: [
            "Think about a time when you had to stand up for what was right, even when it was hard.",
            "Have you ever had to choose between what you wanted and what was best for others?",
            "What would you do if you saw someone being treated unfairly?"
        ]
    },
    '4': {
        complexity: 'Abstract concepts, community connections',
        language: 'Academic vocabulary, complex scenarios',
        maxWords: 22,
        examples: [
            "Think about what it means to show courage. Can you think of different types of courage?",
            "Have you ever had to persevere through something really difficult? What kept you going?",
            "What responsibilities do we have to help others in our community?"
        ]
    },
    '5': {
        complexity: 'Abstract thinking, moral dilemmas',
        language: 'Sophisticated vocabulary, nuanced concepts',
        maxWords: 25,
        examples: [
            "Consider a time when you had to choose between personal loyalty and doing what's right.",
            "Think about how our actions can have consequences we don't expect. Can you think of an example?",
            "What does it mean to you to make a sacrifice for someone else?"
        ]
    },
    '6': {
        complexity: 'Complex moral reasoning, identity exploration',
        language: 'Advanced concepts, philosophical thinking',
        maxWords: 28,
        examples: [
            "Reflect on a time when your perspective on something important changed. What influenced that change.",
            "Consider the difference between conformity and belonging. When might each be important?",
            "Think about how we balance individual desires with collective responsibility."
        ]
    }
};

// Theme-based prompt approaches
const THEME_PROMPT_APPROACHES = {
    'friendship': ['loyalty', 'trust', 'making friends', 'being a good friend', 'peer pressure'],
    'courage': ['fear', 'bravery', 'being scared', 'trying new things', 'speaking up'],
    'family': ['relationships', 'family rules', 'family time', 'feeling loved', 'family changes'],
    'growth': ['learning', 'getting better', 'trying hard', 'not giving up', 'learning from mistakes'],
    'community': ['belonging', 'helping others', 'neighbors', 'making a difference', 'working together'],
    'adventure': ['exploring', 'taking risks', 'curiosity', 'discovering new things', 'facing the unknown'],
    'responsibility': ['taking care of things', 'keeping promises', 'doing the right thing', 'helping family']
};

export async function generatePrompts(story, count, signal) {
    if (count <= 0) return [];

    console.log("generatePrompts called ", count, story);

    // Extract story text from new structured format or fallback to legacy
    const storyText = extractStoryContent(story);
    const title = story?.title || 'Untitled Story';

    // Use new parameter names with fallbacks for legacy data
    const theme = story?.theme || story?.topic || 'General';
    const gradeLevel = story?.gradeLevel || '2';
    const phonicSkill = story?.phonicSkill || story?.skill || 'General reading';
    const lengthKey = story?.length || 'medium';
    const genre = story?.genre || 'realistic-fiction';

    // Get grade-level specific strategy
    const strategy = GRADE_LEVEL_PROMPT_STRATEGIES[gradeLevel] || GRADE_LEVEL_PROMPT_STRATEGIES['2'];
    const themeWords = THEME_PROMPT_APPROACHES[theme.toLowerCase()] || ['experiences', 'feelings', 'choices'];

    const lengthDesc = {
        'short-story': 'Short = 1 paragraph',
        'medium-story': 'Medium = 2–3 paragraphs',
        'long-story': 'Long = 4+ paragraphs'
    }[lengthKey] || `${lengthKey} sentences`;

    // Enhanced prompt with grade-level specific guidance
    const userPrompt = `You are creating PRE-READING thinking prompts for Grade ${gradeLevel} students. These prompts should be used BEFORE students read the story to activate prior knowledge and prepare them mentally.

STORY METADATA (DO NOT reveal plot details in prompts):
- Title: ${title}
- Theme: ${theme}
- Grade Level: ${gradeLevel}
- Reading Skill: ${phonicSkill}
- Genre: ${genre}

GRADE ${gradeLevel} SPECIFIC REQUIREMENTS:
- Complexity Level: ${strategy.complexity}
- Language Style: ${strategy.language}
- Maximum Words per Prompt: ${strategy.maxWords}
- Theme Concepts to Connect: ${themeWords.join(', ')}

EXAMPLE PROMPTS FOR GRADE ${gradeLevel}:
${strategy.examples.map(ex => `• ${ex}`).join('\n')}

Generate exactly ${count} PRE-READING thinking prompts that:

1. **Activate Prior Knowledge**: Connect to students' personal experiences
2. **Build Theme Connections**: Focus on ${theme} without revealing plot
3. **Match Grade Level**: Use ${strategy.language}
4. **Stay Under ${strategy.maxWords} Words**: Keep prompts concise and age-appropriate
5. **Use Activating Language**: Start with "Think about...", "Have you ever...", "Imagine...", etc.

CRITICAL GUIDELINES:
- DO NOT mention specific plot points, character names, or story events
- DO NOT ask about what happens in the story
- DO focus on universal ${theme}-related experiences
- DO keep vocabulary appropriate for Grade ${gradeLevel}
- DO encourage personal connections and emotional readiness

RETURN ONLY valid JSON in this exact format:

{
  "prompts": ["Prompt 1 text", "Prompt 2 text", …]
}

No extra text, markdown, or commentary—just the JSON object.`;

    const payload = {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        messages: [
            {
                role: 'system',
                content: `You are an expert Grade ${gradeLevel} literacy teacher creating pre-reading thinking prompts. You understand developmental appropriateness and the difference between pre-reading activators and post-reading questions. Respond with ONLY valid JSON.`
            },
            { role: 'user', content: userPrompt }
        ],
        max_tokens: 612,
        stream: false
    };

    console.log("generatePrompts llm prompt ", payload);
    const res = await fetch('https://dream-gateway-us-west.livepeer.cloud/llm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ai-teachers-tool'
        },
        body: JSON.stringify(payload),
        signal
    });
    if (!res.ok) throw new Error(`Prompts API error: ${res.status}`);

    const { choices } = await res.json();
    const text = choices[0].message.content;
    const jsonStart = text.indexOf('{');
    const jsonEnd   = text.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < 0) {
        throw new Error('No JSON found in prompts response');
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    return parsed.prompts;
}
