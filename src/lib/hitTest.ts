export function isOverTrash(el: HTMLElement, trashEl: HTMLElement) {
  const tr = trashEl.getBoundingClientRect();
  const er = el.getBoundingClientRect();

  const overlapX = Math.max(0, Math.min(er.right, tr.right) - Math.max(er.left, tr.left));
  const overlapY = Math.max(0, Math.min(er.bottom, tr.bottom) - Math.max(er.top, tr.top));
  const overlapArea = overlapX * overlapY;
  const trashArea = tr.width * tr.height;

  // Require meaningful overlap so casual edge brushing does not delete.
  return overlapArea >= trashArea * 0.35;
}
