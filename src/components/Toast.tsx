"use client";

export default function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return <div className="toast flash">{msg}</div>;
}
