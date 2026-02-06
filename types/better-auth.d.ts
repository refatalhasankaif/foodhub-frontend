// types/better-auth.d.ts
import { Session, User } from "better-auth/types";

declare module "better-auth/types" {
  interface User {
    role: string;
    status: string;
    phone?: string | null;
    address?: string | null;
  }

  interface Session {
    user: User;
  }
}