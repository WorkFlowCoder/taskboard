import type { Member } from "./member";

export interface Board {
  board_id: number;
  title: string;
  owner_id: number;
  requester_role: string;
  requester_user_id: number;
  members: Member[];
}