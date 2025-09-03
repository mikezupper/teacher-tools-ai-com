// api/generateImage.js

/**
 * Turn a story paragraph into a concise, vivid image-generation prompt.
 * @param {string} storyText
 * @returns {Promise<string>}
 */
export async function generateImagePrompt(storyText) {
    try {
        console.log('✨ Engineering image prompt from story text');
        const llmPayload = {
            model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
            stream: false,
            max_tokens: 8192,
            messages: [
                {
                    role: 'system',
                    content: [
                        'You are an expert prompt engineer.',
                        'Given a story, reply with ONE vivid, concise image-generation prompt,',
                        'focusing on scene, characters, mood, and style.'
                    ].join(' ')
                },
                { role: 'user', content: storyText }
            ]
        };

        const res = await fetch('https://dream-gateway-us-west.livepeer.cloud/llm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ai-teachers-tool'
            },
            body: JSON.stringify(llmPayload)
        });
        if (!res.ok) throw new Error(`Prompt LLM error: ${res.status}`);

        const data = await res.json();
        let raw = data.choices[0].message.content;
        // strip header markers and assistant label
        raw = raw
            .replace(/<\|start_header_id\|>assistant<\|end_header_id\|>/g, '')
            .replace(/^assistant\s*/i, '')
            .replace(/^['"]|['"]$/g, '');
        const prompt = raw.trim();
        console.log('🖼️ Prompt engineered:', prompt);
        return prompt;
    } catch (err) {
        console.error('❌ Prompt engineering failed', err);
        // fallback
        return 'A charming illustration of a fox and a bear by a river';
    }
}

/**
 * Generate one or more images for a story.
 * @param {string} storyText
 * @param {number} imageCount
 * @returns {Promise<Array<{url:string, seed?:number, nsfw?:boolean}>>}
 */
// api/generateImage.js

export async function generateImage(storyText, imageCount = 1) {
    if (imageCount <= 0) return null;

    try {
        // 1) Engineer the prompt
        const prompt = await generateImagePrompt(storyText);

        // 2) Build the real payload
        const payload = {
            prompt,
            model_id: 'black-forest-labs/FLUX.1-dev',
            negative_prompt: '',
            width: 1024,
            height: 576,
            num_images_per_prompt: 1,
            num_inference_steps: 10,
            guidance_scale: 4,
            safety_check: false
        };

        console.log('🚀 Calling text‐to‐image with payload:', payload);

        // 3) Fire the request
        const res = await fetch(
            'https://dream-gateway-us-west.livepeer.cloud/text-to-image',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ai-teachers-tool'
                },
                body: JSON.stringify(payload)
            }
        );
        if (!res.ok) {
            throw new Error(`Image API error: ${res.status}`);
        }

        // 4) Parse & return images
        const data = await res.json();
        console.log('✅ Images generated via real API', data.images);

        const imageUrl = data.images[0]?.url;
        if (imageUrl) {
            // Download and convert to blob
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();

            return {imageBlob: imageBlob,seed: data.images[0]?.seed, nsfw: data.images[0]?.nsfw };
        }

        return {};
        // return data.images;
    } catch (err) {
        console.error('❌ Image generation failed', err);
        return null;
    }
}
