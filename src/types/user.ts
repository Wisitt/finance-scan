export interface User {
  [x: string]: string | undefined | null | Date;
  id: string;
  name: string;
  email?: string;
  google_id?: string;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}
