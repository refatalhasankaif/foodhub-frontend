import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { cookies } from "next/headers";

export const getSession = async () => {
  const cookieStore = await cookies();
  
  return await betterFetch<Session>("/api/auth/get-session", {
    baseURL: "https://foodhub-backend-3poi.onrender.com", // Same as your backend
    headers: {
      cookie: cookieStore.toString(),
    },
  });
};