const root = document.getElementById("films-gallery");

export const config = {
    scrollThreshold: 400,
    total: Number(root?.dataset.total) || 0,
    endpoint: root?.dataset.endpoint,
    nonce: root?.dataset.nonce,
    firstBatch: parseInt(root.dataset.firstBatch, 10) || 10,
    batchSize: parseInt(root.dataset.batchSize, 10) || 5,
    breakpoints: { sm: 375, md: 768, lg: 1024, xl: 1440 },
};
