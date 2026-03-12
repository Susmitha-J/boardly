"use client";

import dynamic from "next/dynamic";

const BoardlyApp = dynamic(() => import("./BoardlyApp"), { ssr: false });

export default function BoardlyAppClient() {
  return <BoardlyApp />;
}
