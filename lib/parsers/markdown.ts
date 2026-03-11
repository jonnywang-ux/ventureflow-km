export function parseMarkdown(text: string): string {
  // Strip common markdown syntax to get plain text
  return text
    .replace(/#{1,6}\s+/g, '') // headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^[-*+]\s+/gm, '') // list items
    .replace(/^\d+\.\s+/gm, '') // ordered lists
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/---+/g, '') // horizontal rules
    .trim()
}
