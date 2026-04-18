export interface BoardStats {
  board_id: number;
  board_title: string;
  total_cards: number;
  total_comments: number;
  avg_comments_per_card: number;
  last_activity: Date | null;
  cards_over_time: { 
    date: string;
    count: number 
  }[];
  cards_per_list: {
    list_id: number;
    list_title: string;
    card_count: number;
    percentage: number;
  }[];
}