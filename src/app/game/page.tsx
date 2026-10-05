"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GameRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectOrCreate() {
      try {
        const res = await fetch("/api/builds");
        if (res.ok) {
          const data = await res.json();
          if (data.builds && data.builds.length > 0) {
            // Find active in progress build or latest
            const active = data.builds.find((b: { status: string }) => b.status === "IN_PROGRESS") || data.builds[0];
            router.push(`/game/${active.id}`);
            return;
          }

          // Create new default build
          const createRes = await fetch("/api/builds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Gaming PC #001" }),
          });

          if (createRes.ok) {
            const created = await createRes.json();
            router.push(`/game/${created.build.id}`);
            return;
          }
        }
        router.push("/menu");
      } catch {
        router.push("/menu");
      }
    }

    redirectOrCreate();
  }, [router]);

  return (
    <div className="min-h-screen bg-cyber-dark text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-cyber-cyan animate-pulse">
          Menyiapkan sesi meja kerja...
        </p>
      </div>
    </div>
  );
}
