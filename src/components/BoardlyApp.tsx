"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Landing from "./landing/Landing";
import Sidebar from "./sidebar/SideBar";
import Board from "./board/Board";
import EditModal from "./modal/EditModal";


import type { BoardItem, BoardState } from "@/lib/types";
import { uid, randomPinColor, clamp } from "@/lib/utils";
import { loadState, saveState } from "@/lib/storage";

function makeSeededState(): BoardState {
  const seeded: BoardItem[] = [
    {
      id: uid(),
      type: "card",
      title: "Welcome",
      body: "Drag an item onto the trash can to delete.\nRight-click an item to pin/unpin.\nDouble-click a card to edit.",
      x: 90,
      y: 100,
      rot: -2,
      pinned: false,
      pinColor: randomPinColor(),
      z: 11,
    },
    {
      id: uid(),
      type: "sticker",
      emoji: "📌",
      scale: 1,
      x: 420,
      y: 130,
      rot: 6,
      pinned: false,
      z: 12,
    },
    {
      id: uid(),
      type: "sticker",
      emoji: "✨",
      scale: 1,
      x: 540,
      y: 230,
      rot: -4,
      pinned: false,
      z: 13,
    },
  ];

  return { items: seeded, z: 13 };
}

function getInitialState(): BoardState {
  if (typeof window !== "undefined") {
    const loaded = loadState();
    if (loaded?.items?.length) {
      return { items: loaded.items, z: loaded.z || 10 };
    }
  }

  return makeSeededState();
}

export default function BoardlyApp() {
  const [initialBoard] = useState<BoardState>(() => getInitialState());
  const [items, setItems] = useState<BoardItem[]>(initialBoard.items);
  const [z, setZ] = useState(initialBoard.z);
  const [trashHot, setTrashHot] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastTick, setToastTick] = useState(0);
  const zRef = useRef(initialBoard.z);

  // Sidebar inputs
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sticker, setSticker] = useState("⭐");

  // Modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const counts = useMemo(() => {
    const cardCount = items.filter((i) => i.type === "card").length;
    const stickerCount = items.filter((i) => i.type === "sticker").length;
    const pinnedCount = items.filter((i) => i.pinned).length;
    return { cardCount, stickerCount, pinnedCount };
  }, [items]);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setToastTick((prev) => prev + 1);
  };

  // save
  useEffect(() => {
    const state: BoardState = { items, z };
    saveState(state);
  }, [items, z]);

  const setZValue = (nextZ: number) => {
    zRef.current = nextZ;
    setZ(nextZ);
  };

  const takeNextZ = () => {
    const nextZ = zRef.current + 1;
    setZValue(nextZ);
    return nextZ;
  };

  // z management (stable)
  const bumpZ = (id: string) => {
    const nextZ = takeNextZ();
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, z: nextZ } : it)));
  };

  const boardApprox = () => {
    if (typeof window !== "undefined") {
      const boardEl = document.getElementById("board");
      if (boardEl) {
        return {
          w: boardEl.clientWidth,
          h: boardEl.clientHeight,
        };
      }
    }
    return { w: 980, h: 720 };
  };

  const addCard = () => {
    const r = boardApprox();
    const x = clamp(Math.round(r.w * 0.40 + (Math.random() * 160 - 80)), 10, r.w - 290);
    const y = clamp(Math.round(r.h * 0.25 + (Math.random() * 160 - 80)), 10, r.h - 240);
    const rot = Math.round((Math.random() * 10 - 5) * 10) / 10;
    const nextZ = takeNextZ();
    const item: BoardItem = {
      id: uid(),
      type: "card",
      title: title.trim() || "Untitled",
      body: body.trim() || "",
      x,
      y,
      rot,
      pinned: false,
      pinColor: randomPinColor(),
      z: nextZ,
    };
    setItems((prev) => [...prev, item]);

    setTitle("");
    setBody("");
    toast("Card added.");
  };

  const addSticker = (emoji?: string) => {
    const r = boardApprox();
    const x = clamp(Math.round(r.w * 0.62 + (Math.random() * 200 - 100)), 10, r.w - 100);
    const y = clamp(Math.round(r.h * 0.30 + (Math.random() * 200 - 100)), 10, r.h - 100);
    const rot = Math.round((Math.random() * 20 - 10) * 10) / 10;
    const nextZ = takeNextZ();
    const item: BoardItem = {
      id: uid(),
      type: "sticker",
      emoji: (emoji || sticker || "⭐").slice(0, 2),
      scale: 1,
      x,
      y,
      rot,
      pinned: false,
      z: nextZ,
    };
    setItems((prev) => [...prev, item]);

    toast("Sticker added.");
  };

  const shuffle = () => {
    const r = boardApprox();
    setItems((prev) =>
      prev.map((it) => {
        if (it.pinned) return it;
        const nx = clamp(Math.round(Math.random() * (r.w - 290)) + 10, 10, r.w - 120);
        const ny = clamp(Math.round(Math.random() * (r.h - 240)) + 10, 10, r.h - 120);
        const rot = Math.round((Math.random() * 20 - 10) * 10) / 10;
        return { ...it, x: nx, y: ny, rot, z: it.z };
      })
    );
    toast("Shuffled.");
  };

  const clearAll = () => {
    if (!confirm("Clear everything?")) return;
    setItems([]);
    setZValue(10);
    toast("Cleared.");
  };

  const onDelete = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    toast("Deleted.");
  };

  const onTogglePin = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, pinned: !it.pinned }
          : it
      )
    );
    toast("Pin toggled.");
  };

  const onToggleStickerScale = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id || it.type !== "sticker") return it;
        const s = it.scale === 1 ? 1.25 : it.scale === 1.25 ? 0.9 : 1;
        return { ...it, scale: s };
      })
    );
  };

  const onOpenEditor = (id: string) => {
    const it = items.find((x) => x.id === id && x.type === "card");
    if (!it || it.type !== "card") return;
    setEditingId(id);
    setEditTitle(it.title);
    setEditBody(it.body);
  };

  const onCancelEdit = () => {
    setEditingId(null);
  };

  const onSaveEdit = () => {
    if (!editingId) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== editingId || it.type !== "card") return it;
        return { ...it, title: editTitle.trim() || "Untitled", body: editBody.trim() || "" };
      })
    );
    setEditingId(null);
    toast("Saved.");
  };

  return (
    <div className="mat">
      <Landing scrollTargetId="canvas" />

      <main className="main" id="canvas">
        <Sidebar
          itemCount={items.length}
          cardCount={counts.cardCount}
          stickerCount={counts.stickerCount}
          pinnedCount={counts.pinnedCount}
          title={title}
          body={body}
          sticker={sticker}
          setTitle={setTitle}
          setBody={setBody}
          setSticker={setSticker}
          onAddCard={addCard}
          onAddSticker={() => addSticker()}
          onUseSticker={() => addSticker(sticker)}
          onShuffle={shuffle}
          onClearAll={clearAll}
        />

        <Board
          items={items}
          setItems={setItems}
          bumpZ={bumpZ}
          trashHot={trashHot}
          setTrashHot={setTrashHot}
          toastMsg={toastMsg}
          toastTick={toastTick}
          onDelete={onDelete}
          onOpenEditor={onOpenEditor}
          onTogglePin={onTogglePin}
          onToggleStickerScale={onToggleStickerScale}
        />
      </main>

      <EditModal
        open={!!editingId}
        title={editTitle}
        body={editBody}
        setTitle={setEditTitle}
        setBody={setEditBody}
        onCancel={onCancelEdit}
        onSave={onSaveEdit}
      />
    </div>
  );
}
