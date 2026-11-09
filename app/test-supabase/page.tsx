"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabase() {
  const [status, setStatus] = useState("Testing connection...");

  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (error) {
        setStatus("Connection failed: " + error.message);
      } else {
        setStatus("Supabase connected successfully!");
      }
    }

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090f] text-white">
      <div className="rounded-2xl border border-white/10 bg-[#11111a] p-10 text-center">
        <h1 className="text-2xl font-bold">DevPath AI</h1>

        <p className="mt-4 text-violet-400">
          {status}
        </p>
      </div>
    </main>
  );
}