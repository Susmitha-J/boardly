"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  body: string;
  setTitle: (v: string) => void;
  setBody: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function EditModal({
  open,
  title,
  body,
  setTitle,
  setBody,
  onCancel,
  onSave,
}: Props) {
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) titleRef.current?.focus();
  }, [open]);

  return (
    <div className={"modalBack" + (open ? " show" : "")} role="dialog" aria-modal="true" onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <div className="modal">
        <h2>Edit Card</h2>
        <div className="row">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            maxLength={60}
          />
        </div>
        <div className="row">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="modalActions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}