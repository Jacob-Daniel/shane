export function createVideoApi({
    endpoint,
    nonce,
    batchSize = 15,
    startPage = 1,
}) {
    let page = startPage;
    let totalPages = null;
    let loading = false;
    let done = false;
    const cache = new Map();

    async function get(p = page) {
        if (cache.has(p)) return cache.get(p);

        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set("page", p);
        url.searchParams.set("per_page", batchSize);

        const res = await fetch(url, {
            headers: { "X-WP-Nonce": nonce },
            credentials: "same-origin",
        });
        if (!res.ok) throw new Error(`Films API ${res.status}`);

        const header = res.headers.get("X-WP-TotalPages");
        if (header !== null) totalPages = parseInt(header, 10);

        const data = await res.json();
        cache.set(p, data);
        return data;
    }

    return {
        get page() {
            return page;
        },
        get done() {
            return done;
        },
        get loading() {
            return loading;
        },

        async next() {
            if (loading || done) return [];
            loading = true;
            const current = page;
            page += 1;
            try {
                const items = await get(current);
                if (totalPages !== null && current >= totalPages) done = true;
                return items;
            } catch (e) {
                page = current;
                throw e;
            } finally {
                loading = false;
            }
        },

        reset() {
            page = startPage;
            totalPages = null;
            done = false;
            cache.clear();
        },
    };
}
