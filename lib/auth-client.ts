import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "", // ← empty or "/" → uses current origin (/api/auth proxy)
  // baseURL: window.location.origin,  // alternative if you have SSR issues

  fetchOptions: {
    credentials: "include",
  },
});