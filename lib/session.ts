// lib/session.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL!; // https://foodhub-backend-3poi.onrender.com

export interface SessionUser {
  id: string;
  email: string;
  role: "ADMIN" | "PROVIDER" | "CUSTOMER";
  status: string;
  name: string;
}

export interface Session {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
}

export async function getSession(cookieHeader: string | null): Promise<Session | null> {
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Better Auth returns null or {} when no session
    if (!data || !data.user) return null;

    return data as Session;
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return null;
  }
}