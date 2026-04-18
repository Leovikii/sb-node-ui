export interface Env {
  SESSIONS: KVNamespace;
  COOKIE_NAME: string;
}

export interface SessionData {
  owner: string;
  repo: string;
  createdAt: number;
}

export interface UserIndex {
  sessionIds: string[];
  pat: string;
  gistId: string;
  userLogin: string;
  userAvatar: string;
}

export interface ResolvedSession {
  owner: string;
  repo: string;
  pat: string;
  gistId: string;
  userLogin: string;
  userAvatar: string;
}
