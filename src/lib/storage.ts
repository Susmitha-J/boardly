import type { BoardState } from "./types";

export const LS_KEY = "cutting_board_pinboard_trashzone_v1";

export function loadState(): BoardState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as BoardState) : null;
  } catch {
    return null;
  }
}

export function saveState(state: BoardState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}