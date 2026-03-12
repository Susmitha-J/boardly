export type ItemBase = {
  id: string;
  x: number;
  y: number;
  rot: number;
  pinned: boolean;
  z: number;
};

export type ItemCard = ItemBase & {
  type: "card";
  title: string;
  body: string;
  pinColor: "red" | "blue" | "yellow" | "green" | "black";
};

export type ItemSticker = ItemBase & {
  type: "sticker";
  emoji: string;
  scale: number;
};

export type Item = ItemCard | ItemSticker;

export type BoardState = {
  items: Item[];
  z: number;
};

export type BoardItem =  ItemCard | ItemSticker;