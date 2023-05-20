export interface User {
  isCurrentUser: boolean;
  user_id: number;
  username: string;
  name: string;
  password: string;
  active: number;
  email: string;
  created_at: string;
  last_login: string;
  level: number;
  access_token?: string;
  filtered?: boolean;
}
