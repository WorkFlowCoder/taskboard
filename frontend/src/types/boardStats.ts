import type { CardsPerList } from "./cardPerList";

export interface BoardStats {
  board_id: number;
  board_title: string;
  total_cards: number;
  cards_per_list: CardsPerList[];
}