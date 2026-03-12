export function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br/>");
}

export function randomPinColor(): "red" | "blue" | "yellow" | "green" | "black" {
  const colors = ["red", "blue", "yellow", "green", "black"] as const;
  return colors[Math.floor(Math.random() * colors.length)];
}
