export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === "class") node.className = v;
        else if (k === "dataset") Object.assign(node.dataset, v);
        else if (k === "html") node.innerHTML = v;
        else if (k in node) node[k] = v;
        else node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) {
        if (child) node.appendChild(child);
    }
    return node;
}

export const PLAY_ICON =
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true">' +
    '<path d="M15,10.001c0,0.299-0.305,0.514-0.305,0.514l-8.561,5.303C5.51,16.227,5,15.924,5,15.149V4.852' +
    'c0-0.777,0.51-1.078,1.135-0.67l8.561,5.305C14.695,9.487,15,9.702,15,10.001z"/></svg>';
