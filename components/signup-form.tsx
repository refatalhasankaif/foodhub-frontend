"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

type UserRole = "CUSTOMER" | "PROVIDER"

export function SignupForm() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>("CUSTOMER")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    // Validation
    if (!name || !email || !password || !address) {
      alert("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        role,
        phone: phone || undefined,
        address,
      })

      if (error) {
        console.error("Signup error:", error)
        alert(error.message || "Failed to create account")
        setIsLoading(false)
        return
      }

      console.log("Signup successful:", data)
      router.push("/")
    } catch (err) {
      console.error("Unexpected error:", err)
      alert("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit}>
        {/* Role Selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Account Type *
          </label>
          <div>
            <label style={{ marginRight: "20px" }}>
              <input
                type="radio"
                value="CUSTOMER"
                checked={role === "CUSTOMER"}
                onChange={(e) => setRole(e.target.value as UserRole)}
              />
              {" "}Customer
            </label>
            <label>
              <input
                type="radio"
                value="PROVIDER"
                checked={role === "PROVIDER"}
                onChange={(e) => setRole(e.target.value as UserRole)}
              />
              {" "}Provider
            </label>
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Phone {role === "PROVIDER" && "*"}
          </label>
          <input
            type="tel"
            name="phone"
            required={role === "PROVIDER"}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Address */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Address *
          </label>
          <input
            type="text"
            name="address"
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Password *
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Confirm Password *
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: isLoading ? "#ccc" : "#000",
            color: "#fff",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </form>
    </div>
  )
}