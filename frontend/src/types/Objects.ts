export interface Board {
  board_id: number;
  title: string;
  owner_id: number;
  requester_role: string;
  requester_user_id: number;
  members: Member[];
}

export interface Member {
  user_id: number;
  first_name: string;
  last_name: string;
  role: string;
}