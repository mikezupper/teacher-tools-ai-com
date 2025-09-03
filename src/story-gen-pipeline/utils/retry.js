export async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

export function expoBackoff(attempt, base = 200, cap = 2000) {
    const jitter = Math.random() * 100;
    return Math.min(cap, base * 2 ** (attempt - 1)) + jitter;
}

export function defaultShouldRetry(res, err) {
    if (err) return true;                 // network error/throw
    if (!res) return true;
    if (res.status >= 500) return true;   // server errors
    if (res.status === 429) return true;  // rate limit
    return false;
}

export async function fetchWithRetry(input, init = {}) {
    const max = init.maxAttempts ?? 3;
    const shouldRetry = init.shouldRetry ?? defaultShouldRetry;

    let lastErr = null;
    let lastRes = null;

    for (let attempt = 1; attempt <= max; attempt++) {
        try {
            const res = await fetch(input, init);
            lastRes = res;

            if (!shouldRetry(res, null)) {
                return res; // Success case
            }

            // If this was the final attempt and we should retry, throw an error
            if (attempt === max) {
                const text = await res.text().catch(() => "");
                throw new Error(`Request failed after ${max} attempts: ${res.status} ${res.statusText} ${text}`);
            }
        } catch (err) {
            lastErr = err;

            // CRITICAL FIX: Don't retry on AbortError
            if (err.name === 'AbortError') {
                throw err; // Immediately re-throw abort errors
            }

            if (attempt === max) throw err;
        }

        await sleep(expoBackoff(attempt));
    }

    // Fallback - should not reach here
    if (lastErr) throw lastErr;
    if (lastRes) {
        const text = await lastRes.text().catch(() => "");
        throw new Error(`Request failed after ${max} attempts: ${lastRes.status} ${lastRes.statusText} ${text}`);
    }
    throw new Error("fetchWithRetry: exhausted without response");
}
