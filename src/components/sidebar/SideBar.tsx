"use client";

type Props = {
  itemCount: number;
  cardCount: number;
  stickerCount: number;
  pinnedCount: number;

  title: string;
  body: string;
  sticker: string;

  setTitle: (v: string) => void;
  setBody: (v: string) => void;
  setSticker: (v: string) => void;

  onAddCard: () => void;
  onAddSticker: () => void;
  onUseSticker: () => void;
  onShuffle: () => void;
  onClearAll: () => void;
};

export default function Sidebar({
  itemCount,
  cardCount,
  stickerCount,
  pinnedCount,
  title,
  body,
  sticker,
  setTitle,
  setBody,
  setSticker,
  onAddCard,
  onAddSticker,
  onUseSticker,
  onShuffle,
  onClearAll,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="headerRow">
        <h1>Cutting Board Pinboard</h1>
        <div className="tiny">{itemCount} ITEMS</div>
      </div>

      <p>
        Create cards. Add stickers. Drag to rearrange.
        Right-click an item to pin/unpin (pinned = locked).
        Double-click a card to edit.
        Drag an item onto the trash can to delete.
      </p>

      <div className="row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Card title…" maxLength={60} />
      </div>
      <div className="row">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Card text… (optional)" />
      </div>

      <div className="row">
        <button style={{ flex: 1 }} onClick={onAddCard}>Add Card</button>
        <button style={{ flex: 1 }} onClick={onAddSticker}>Add Sticker</button>
      </div>

      <div className="row">
        <input value={sticker} onChange={(e) => setSticker(e.target.value)} type="text" placeholder="Sticker emoji (e.g. ⭐)" maxLength={2} />
        <button onClick={onUseSticker}>Use</button>
      </div>

      <div className="row">
        <button style={{ flex: 1 }} onClick={onShuffle}>Shuffle</button>
        <button className="btnDanger" style={{ flex: 1 }} onClick={onClearAll}>Clear All</button>
      </div>

      <div className="stats">
        <div className="statLine"><span>Cards</span><strong>{cardCount}</strong></div>
        <div className="statLine"><span>Stickers</span><strong>{stickerCount}</strong></div>
        <div className="statLine"><span>Pinned</span><strong>{pinnedCount}</strong></div>
      </div>
    </aside>
  );
}
