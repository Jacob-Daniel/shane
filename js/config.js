const root =
    document.getElementById("films-gallery") ??
    document.getElementById("portfolio-gallery");
const d = root?.dataset ?? {};

export const config = {
    total: Number(d.total) || 0,
    endpoint: d.endpoint,
    nonce: d.nonce,
    firstBatch: parseInt(d.firstBatch, 10) || 15,
    batchSize: parseInt(d.batchSize, 10) || 5,
    breakpoints: { sm: 375, md: 768, lg: 1024, xl: 1440 },
    scrollThreshold: parseInt(d.scrollThreshold, 10) || 1000,
    lazyRootMargin: "200px 0px",
};
