"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/progress/summary`, {
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch progress");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFB] dark:bg-[#0C0C10] text-[#6B6B76] dark:text-[#A0A0AB] text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
          <span>Loading progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFB] dark:bg-[#0C0C10] p-6 md:p-10 text-[#0B0B0F] dark:text-[#F4F4F8]">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              aria-label="Back to chat"
              className="p-2 rounded-xl border border-[#ECECF1] dark:border-[#282835] bg-white dark:bg-[#171720] hover:bg-gray-100 dark:hover:bg-[#20202A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Progress</h1>
              <p className="text-xs text-[#6B6B76] dark:text-[#A0A0AB]">
                Track solved DSA patterns and identify areas to reinforce
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-xl bg-[#0B0B0F] hover:bg-black/85 text-white dark:bg-[#F4F4F8] dark:hover:bg-white dark:text-[#0B0B0F] text-xs font-semibold tracking-wide transition-all shadow-xs"
          >
            Back to Coach
          </button>
        </div>

        {/* Top Stat Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="rounded-[20px] bg-white dark:bg-[#171720] border-[#ECECF1] dark:border-[#282835] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#A0A0AB]">
                Total Attempts
              </span>
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[#0B0B0F] dark:text-white">
              {data?.total_attempts || 0}
            </p>
          </Card>

          <Card className="rounded-[20px] bg-white dark:bg-[#171720] border-[#ECECF1] dark:border-[#282835] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#A0A0AB]">
                Weak Patterns
              </span>
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            {data?.weak_patterns?.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {data.weak_patterns.map((p: string) => (
                  <li
                    key={p}
                    className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200/60 dark:border-red-900/40 capitalize"
                  >
                    {p.replace("-", " ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#6B6B76] dark:text-[#A0A0AB]">
                No weak patterns identified yet. Keep solving!
              </p>
            )}
          </Card>
        </div>

        {/* Pattern Breakdown Chart */}
        <Card className="rounded-[20px] bg-white dark:bg-[#171720] border-[#ECECF1] dark:border-[#282835] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-semibold text-[#0B0B0F] dark:text-white">
              Pattern Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-80">
            {data?.pattern_breakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pattern_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="pattern" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171720",
                      borderColor: "#2B2B38",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="attempts" fill="#A78BFA" radius={[6, 6, 0, 0]} name="Total Attempts" />
                  <Bar dataKey="solved" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Solved" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#A0A0AB]">
                Not enough data yet to show pattern performance. Practice problems to see your metrics!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
