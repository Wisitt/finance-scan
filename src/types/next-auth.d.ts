import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      avatar_url?: string;
    } & DefaultSession["user"];
  }
  
  interface User {
    id: string;
    avatar_url?: string;
    name?: string;
    email?: string;
    image?: string;
  }
}