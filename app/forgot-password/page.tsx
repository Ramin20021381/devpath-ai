"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (error) {
        throw error;
      }

      setMessage(
        "If an account exists with this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090f] px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#11111b] p-8 shadow-2xl">

        <Link href="/" className="text-2xl font-bold">
          DevPath<span className="text-violet-400"> AI</span>
        </Link>

        <div className="mb-8 mt-10">
          <h1 className="text-3xl font-bold">
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Enter your email address and we will send you a link
            to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-violet-500"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm leading-6 text-green-400">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-7 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-violet-400 hover:text-violet-300"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}