export interface DirectoryRoomMeta {
  username: string;
  isLive: boolean;
  promoted?: boolean;
  watching?: number;
  avatarDataUrl?: string | null;
  description?: string | null;
  lastSeen: number;
}

export interface DirectoryReport {
  rooms: DirectoryRoomMeta[];
}

export function compileDirectoryReport(input: unknown): DirectoryReport {
  // Treat unknown safely; if you have a source of truth, map it here.
  return { rooms: Array.isArray(input) ? [] : [] };
}
