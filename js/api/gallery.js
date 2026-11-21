export function createGalleryApi({
    endpoint,
    nonce,
    batchSize,
    startOffset = 0,
    total = 0,
}) {
    let offset = startOffset;
    let loading = false;
    let done = total > 0 && startOffset >= total;
    const cache = new Map();

    async function get(o) {
        if (cache.has(o)) return cache.get(o);

        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set("offset", o);
        url.searchParams.set("per_page", batchSize);

        const res = await fetch(url, {
            headers: { "X-WP-Nonce": nonce },
            credentials: "same-origin",
        });
        if (!res.ok) throw new Error(`Films API ${res.status}`);

        const data = await res.json();
        cache.set(o, data);
        return data;
    }

    return {
        get done() {
            return done;
        },
        get loading() {
            return loading;
        },

        async next() {
            if (loading || done) return [];
            loading = true;
            const current = offset;
            offset += batchSize;
            try {
                const items = await get(current);
                if (items.length < batchSize || (total && offset >= total))
                    done = true;
                return items;
            } catch (e) {
                offset = current;
                throw e;
            } finally {
                loading = false;
            }
        },

        reset() {
            offset = startOffset;
            done = total > 0 && startOffset >= total;
            cache.clear();
        },
    };
}
