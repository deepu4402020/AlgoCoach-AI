"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch("http://localhost:8000/progress/summary", {
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
    return <div className="flex h-screen items-center justify-center">Loading progress...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Progress</h1>
          <Button onClick={() => router.push("/")} variant="outline">Back to Coach</Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{data?.total_attempts || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Weak Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.weak_patterns?.length > 0 ? (
                <ul className="list-disc pl-5">
                  {data.weak_patterns.map((p: string) => (
                    <li key={p} className="text-red-500 font-medium capitalize">{p.replace("-", " ")}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No weak patterns identified yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Pattern Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {data?.pattern_breakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pattern_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pattern" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attempts" fill="#8884d8" name="Total Attempts" />
                  <Bar dataKey="solved" fill="#82ca9d" name="Solved" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Not enough data yet to show pattern performance.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
