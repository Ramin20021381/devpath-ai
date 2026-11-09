"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [level, setLevel] = useState("Beginner");
  const [goal, setGoal] = useState("Get a job");
  const [skills, setSkills] = useState("");
  const [interest, setInterest] = useState("Web Development");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("level, goal, skills, interest")
        .eq("id", user.id)
        .single();

      if (error) {
        setError("Could not load your profile.");
      } else if (data) {
        setLevel(data.level || "Beginner");
        setGoal(data.goal || "Get a job");
        setSkills(data.skills || "");
        setInterest(data.interest || "Web Development");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        level,
        goal,
        skills,
        interest,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setError("Could not save your changes. Please try again.");
    } else {
      setMessage("Your profile has been updated successfully!");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090f] text-white">
        <p className="text-gray-400">Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090f] px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm text-violet-400 hover:text-violet-300">
          ← Back to Dashboard
        </Link>

        <div className="mb-8 mt-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="mt-2 text-gray-400">
            Update your learning preferences and development goals.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-3xl border border-white/10 bg-[#11111b] p-6 sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Current Level
            </label>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-violet-500"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Main Goal
            </label>

            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-violet-500"
            >
              <option>Get a job</option>
              <option>Improve my skills</option>
              <option>Build projects</option>
              <option>Learn a new technology</option>
              <option>Freelancing</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Your Skills
            </label>

            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={4}
              placeholder="JavaScript, React, Python..."
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-violet-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Separate your skills with commas.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Area of Interest
            </label>

            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-violet-500"
            >
              <option>Web Development</option>
              <option>Frontend Development</option>
              <option>Backend Development</option>
              <option>AI</option>
              <option>Game Development</option>
              <option>Mobile Development</option>
              <option>Cybersecurity</option>
            </select>
          </div>

          {message && (
            <p className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold transition hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}