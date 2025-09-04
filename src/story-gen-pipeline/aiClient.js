

import { safeJsonParse } from "./utils/json.js";
import { fetchWithRetry } from "./utils/retry.js";
import {API_BASE_URL, API_MODEL, API_TOKEN} from "../config.js";

export async function chatJson(messages, opts = {}) {
    // const payload = {
    //     model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    //     max_tokens: 8192,
    //     stream: false,
    //     temperature: attempt === 0 ? 0.3 : 0.5 + (attempt * 0.1),
    //     messages: [
    //         {role: 'system', content: system},
    //         {role: 'user', content: user}
    //     ]
    // };


    const body = {
        model: API_MODEL,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 8192,
        stream: false,
        response_format: { type: "json_object" }
    };

    // console.log("[aiClient::chatJson] Request Body:", JSON.stringify(body));

    const res = await fetchWithRetry(`${API_BASE_URL}/llm`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(body),
        signal: opts.signal,
        maxAttempts: 3
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`AI request failed: ${res.status} ${res.statusText} ${text}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI response missing content");
    // console.log("[aiClient::chatJson] content:", JSON.stringify(content));

    return safeJsonParse(content);
}
