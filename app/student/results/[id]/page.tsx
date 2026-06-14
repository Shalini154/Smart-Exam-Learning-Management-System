"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import Footer from "@/app/components/Footer";

export default function ResultPage() {
    const { id } = useParams();
    const router = useRouter();

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/results/${id}`, {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                setResult(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
                Loading result...
            </div>
        );
    }

    if (!result || result.message) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
                Result not found or unauthorized.
            </div>
        );
    }

    const percentage = ((result.score / result.total) * 100).toFixed(2);
    const passed = Number(percentage) >= 40;

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <DashboardHeader />

            <section className="flex-1 p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Exam Result
                </h2>

                <div className="space-y-3 text-lg">
                    <p>Total Questions: {result.total}</p>
                    <p>Correct Answers: {result.correct}</p>
                    <p>Wrong Answers: {result.wrong}</p>
                    <p>Score: {result.score}</p>
                    <p>Percentage: {percentage}%</p>
                    <p className={passed ? "text-green-400" : "text-red-400"}>
                        Status: {passed ? "PASS ✅" : "FAIL ❌"}
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push("/student/dashboard")}
                        className="px-6 py-2 bg-blue-600 rounded"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </section>

            <Footer />
        </main>
    );
}