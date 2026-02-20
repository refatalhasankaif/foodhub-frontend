"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIsLoading(true)
        setErrorMsg(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (!email || !password) {
            setErrorMsg("Email and password are required")
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
                rememberMe: true,
                callbackURL: "/",
            })

            if (error) {
                console.error("Login error:", error.message)
                setErrorMsg(error.message || "Failed to login")
                setIsLoading(false)
                return
            }

            router.push("/")
        } catch (err) {
            console.error("Unexpected error:", err)
            setErrorMsg("An unexpected error occurred")
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email & password to login
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    name="email"
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    name="password"
                                    id="password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                />
                            </Field>
                            <Field>
                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className={`w-full ${isLoading ? "bg-gray-400 cursor-not-allowed" : ""}`}
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>

                                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                                    Do not have an account? {" "}
                                    <Link href="/register" className="text-blue-600 hover:underline">
                                        Sign up
                                    </Link>
                                </p>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}