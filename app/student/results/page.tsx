"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";
import Footer from "@/app/components/Footer";

export default function ResultsListPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/results", {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                setResults(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setResults([]);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
                Loading results...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <DashboardHeader />

            <section className="flex-1 p-8 max-w-4xl mx-auto w-full">
                <h2 className="text-2xl font-bold mb-6">My Results</h2>

                {results.length === 0 ? (
                    <p className="text-gray-400">No exam attempts found.</p>
                ) : (
                    <div className="space-y-4">
                        {results.map((r) => (
                            <div
                                key={r._id}
                                className="p-5 border border-gray-700 rounded-xl flex justify-between items-center bg-black/60"
                            >
                                {/* LEFT SIDE */}
                                <div className="space-y-1">

                                    {/* 🔥 EXAM NAME */}
                                    <p className="text-lg font-semibold text-white">
                                        {r.examId?.title || "Exam"}
                                    </p>

                                    {/* 🔥 SUBJECT */}
                                    <p className="text-sm text-gray-400">
                                        Subject: {r.examId?.subject || "-"}
                                    </p>

                                    {/* SCORE DETAILS */}
                                    <p className="text-sm text-gray-300">
                                        Total Questions: {r.total}
                                    </p>

                                    <p className="text-sm text-gray-300">
                                        Score: {r.score}
                                    </p>

                                    <p className="text-sm text-green-400 font-semibold">
                                        Percentage:{" "}
                                        {r.total > 0
                                            ? ((r.score / r.total) * 100).toFixed(2)
                                            : 0}%
                                    </p>

                                    {/* 🔥 DATE */}
                                    <p className="text-xs text-gray-500">
                                        Attempted on:{" "}
                                        {r.createdAt
                                            ? new Date(r.createdAt).toLocaleString()
                                            : "-"}
                                    </p>
                                </div>

                                {/* RIGHT SIDE BUTTON */}
                                <Link
                                    href={`/student/results/${r._id}`}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold"
                                >
                                    View Result
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}