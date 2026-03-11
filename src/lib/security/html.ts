const EVENT_HANDLER_PATTERN = /\son[a-z]+\s*=\s*(['"]).*?\1/gi
const JAVASCRIPT_URL_PATTERN = /\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi
const UNSAFE_BLOCK_PATTERN = /<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi
const UNSAFE_TAG_PATTERN = /<\/?(script|style|iframe|object|embed)[^>]*>/gi

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function sanitizeRenderedHtml(html: string) {
  return html
    .replace(UNSAFE_BLOCK_PATTERN, '')
    .replace(UNSAFE_TAG_PATTERN, '')
    .replace(EVENT_HANDLER_PATTERN, '')
    .replace(JAVASCRIPT_URL_PATTERN, '')
}
