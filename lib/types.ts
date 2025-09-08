// Reusable app types (no runtime deps)
export type Username = string;
export type RoomName = string;

export interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

export interface VerifyAgeBody {
  userId: string;
}

export interface ChatPostBody {
  room: RoomName;
  username: Username;
  text: string;
}

export interface ChatSendBody {
  room: RoomName;
  username: Username;
  text: string;
}

export interface HeartbeatBody {
  room: RoomName;
  username: Username;
}

export interface RoomStatsResponse {
  room: RoomName;
  broadcasters: number;
  users: number;
}

export interface PresenceEvent {
  type: "join" | "leave" | "heartbeat";
  room: RoomName;
  username: Username;
  at: number; // epoch ms
}

export interface ChatMessage {
  id: string;
  room: RoomName;
  username: Username;
  text: string;
  createdAt: number; // epoch ms
}
