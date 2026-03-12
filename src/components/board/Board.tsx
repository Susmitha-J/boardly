"use client";

import { useEffect, useRef } from "react";
import type { BoardItem } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { isOverTrash } from "@/lib/hitTest";
import Toast from "@/components/Toast";

type Props = {
  items: BoardItem[];
  setItems: React.Dispatch<React.SetStateAction<BoardItem[]>>;
  bumpZ: (id: string) => void;

  trashHot: boolean;
  setTrashHot: (v: boolean) => void;

  toastMsg: string;
  toastTick: number;

  onDelete: (id: string) => void;
  onOpenEditor: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleStickerScale: (id: string) => void;
};

export default function Board({
  items,
  setItems,
  bumpZ,
  trashHot,
  setTrashHot,
  toastMsg,
  toastTick,
  onDelete,
  onOpenEditor,
  onTogglePin,
  onToggleStickerScale,
}: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const trashRef = useRef<HTMLDivElement | null>(null);
  const stickerDraggedAtRef = useRef<Record<string, number>>({});

  const drag = useRef({
    activeEl: null as HTMLElement | null,
    activeId: null as string | null,
    pointerId: -1,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
    overTrash: false,
  });

  const boardRect = () => boardRef.current!.getBoundingClientRect();

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const onDown = (e: PointerEvent) => {
      // Keep right-click/secondary actions (pin toggle via context menu) out of drag flow.
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;

      const el = target.closest(".item") as HTMLElement | null;
      if (!el) return;

      const id = el.dataset.id;
      if (!id) return;

      if (el.dataset.pinned === "1") return;

      drag.current.activeEl = el;
      drag.current.activeId = id;
      drag.current.pointerId = e.pointerId;
      drag.current.moved = false;
      el.setPointerCapture?.(e.pointerId);

      bumpZ(id);

      const rect = el.getBoundingClientRect();
      const br = boardRect();
      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;
      drag.current.origX = rect.left - br.left;
      drag.current.origY = rect.top - br.top;

      e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      const el = drag.current.activeEl;
      if (!el) return;
      if (e.pointerId !== drag.current.pointerId) return;

      const br = boardRect();
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      if (!drag.current.moved && Math.abs(dx) + Math.abs(dy) > 4) {
        drag.current.moved = true;
      }

      const newX = drag.current.origX + dx;
      const newY = drag.current.origY + dy;

      const w = el.offsetWidth;
      const h = el.offsetHeight;

      const cx = clamp(newX, -w * 0.15, br.width - w * 0.85);
      const cy = clamp(newY, -h * 0.15, br.height - h * 0.85);

      el.style.left = cx + "px";
      el.style.top = cy + "px";

      const trash = trashRef.current;
      if (trash) {
        const over = isOverTrash(el, trash);
        if (over !== drag.current.overTrash) {
          drag.current.overTrash = over;
          setTrashHot(over);
        }
      }
    };

    const end = () => {
      const el = drag.current.activeEl;
      const id = drag.current.activeId;
      if (!el || !id) return;

      const trash = trashRef.current;

      if (trash && isOverTrash(el, trash)) {
        setTrashHot(false);
        onDelete(id);
      } else {
        const x = Math.round(parseFloat(el.style.left || "0"));
        const y = Math.round(parseFloat(el.style.top || "0"));
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, x, y } : it)));
        setTrashHot(false);
      }

      if (drag.current.moved) {
        stickerDraggedAtRef.current[id] = performance.now();
      }

      drag.current.activeEl = null;
      drag.current.activeId = null;
      drag.current.pointerId = -1;
      drag.current.moved = false;
      drag.current.overTrash = false;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== drag.current.pointerId) return;
      end();
    };
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId !== drag.current.pointerId) return;
      setTrashHot(false);
      drag.current.activeEl = null;
      drag.current.activeId = null;
      drag.current.pointerId = -1;
      drag.current.moved = false;
      drag.current.overTrash = false;
    };

    board.addEventListener("pointerdown", onDown);
    board.addEventListener("pointermove", onMove);
    board.addEventListener("pointerup", onUp);
    board.addEventListener("pointercancel", onCancel);

    return () => {
      board.removeEventListener("pointerdown", onDown);
      board.removeEventListener("pointermove", onMove);
      board.removeEventListener("pointerup", onUp);
      board.removeEventListener("pointercancel", onCancel);
    };
  }, [bumpZ, onDelete, setItems, setTrashHot]);

  return (
    <div className="boardWrap">
      <div className="board" ref={boardRef} id="board">
        <Toast key={toastTick} msg={toastMsg} />

        <div className={"boardTrash" + (trashHot ? " hot" : "")} ref={trashRef} id="boardTrash" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm-1 13h12a2 2 0 0 0 2-2V9H4v11a2 2 0 0 0 2 2z"/>
          </svg>
        </div>

        {items.map((it) => {
          if (it.type === "card") {
            return (
              <div
                key={it.id}
                className={"item card" + (it.pinned ? " pinned" : "")}
                data-id={it.id}
                data-pinned={it.pinned ? "1" : "0"}
                style={{
                  left: it.x,
                  top: it.y,
                  zIndex: it.z ?? 3,
                  transform: `rotate(${it.pinned ? 0 : it.rot ?? 0}deg)`,
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  onOpenEditor(it.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onTogglePin(it.id);
                }}
              >
                <div className="cardHead">
                  <div style={{ minWidth: 0 }}>
                    <div className="cardTitle">{it.title}</div>
                    <div className="tiny">{it.pinned ? "PINNED" : "DRAGGABLE"}</div>
                  </div>
                </div>
                <div className="cardBody">{it.body}</div>
              </div>
            );
          }

          return (
            <div
              key={it.id}
              className={"item sticker" + (it.pinned ? " pinned" : "")}
              data-id={it.id}
              data-pinned={it.pinned ? "1" : "0"}
              style={{
                left: it.x,
                top: it.y,
                zIndex: it.z ?? 2,
                transform: `rotate(${it.pinned ? 0 : it.rot ?? 0}deg) scale(${it.scale ?? 1})`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                const draggedAt = stickerDraggedAtRef.current[it.id];
                if (draggedAt && performance.now() - draggedAt < 250) {
                  return;
                }
                onToggleStickerScale(it.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onTogglePin(it.id);
              }}
            >
              {it.emoji}
            </div>
          );
        })}
      </div>
    </div>
  );
}
