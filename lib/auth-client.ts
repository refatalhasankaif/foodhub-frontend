import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    baseURL: "https://foodhub-backend-3poi.onrender.com",  
    fetchOptions: {
        credentials: "include" // This is critical!
    }
})