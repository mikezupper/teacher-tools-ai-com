export function extractFirstJsonObject(text) {
    const start = text.indexOf("{");
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < text.length; i++) {
        const c = text[i];
        if (c === "{") depth++;
        else if (c === "}") {
            depth--;
            if (depth === 0) return text.slice(start, i + 1);
        }
    }
    return null;
}

export function safeJsonParse(text) {
    let cleanText = String(text).trim();

    // Remove common LLM prefixes that interfere with JSON parsing
    if (cleanText.startsWith('assistant\n\n')) {
        cleanText = cleanText.substring('assistant\n\n'.length);
    }

    // Remove markdown-style headers and explanatory text before JSON
    const jsonStart = cleanText.indexOf('{');
    if (jsonStart > 0) {
        // Look for patterns like "**Text**" or other markdown before the JSON
        cleanText = cleanText.substring(jsonStart);
    }

    const maybe = extractFirstJsonObject(cleanText.trim());
    const raw = maybe ?? cleanText;
    return JSON.parse(raw);
}
