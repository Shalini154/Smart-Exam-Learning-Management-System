"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateExamPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [recommendationVideo, setRecommendationVideo] = useState("");
    const [duration, setDuration] = useState("");
    const [totalQuestions, setTotalQuestions] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !title ||
            !subject ||
            !recommendationVideo ||
            !duration ||
            !totalQuestions
        ) {
            alert("All fields are required");
            return;
        }

        if (Number(duration) <= 0 || Number(totalQuestions) <= 0) {
            alert("Duration and Questions must be greater than 0");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/admin/exams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    subject,
                    recommendationVideo,
                    duration: Number(duration),
                    totalQuestions: Number(totalQuestions),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create exam");
            }

            alert("✅ Exam created successfully");
            router.push("/admin/exams");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-10 flex justify-center">
            <div className="w-full max-w-xl bg-black/60 border border-gray-800 rounded-xl p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    Create New Exam
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Exam Title */}
                    <input
                        type="text"
                        placeholder="Exam Title (e.g. C Programming Test)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                    />

                    {/* Subject */}
                    <input
                        type="text"
                        placeholder="Subject (e.g. C, DS, OS)"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                    />

                    {/* Recommendation Video URL */}
                    <input
                        type="url"
                        placeholder="Recommendation Video URL (YouTube)"
                        value={recommendationVideo}
                        onChange={(e) => setRecommendationVideo(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                    />

                    {/* Duration */}
                    <input
                        type="number"
                        placeholder="Duration (in minutes)"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                    />

                    {/* Total Questions */}
                    <input
                        type="number"
                        placeholder="Total Questions"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(e.target.value)}
                        min="1"
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold transition ${
                            loading
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                        } text-white`}
                    >
                        {loading ? "Creating..." : "Create Exam"}
                    </button>
                </form>
            </div>
        </main>
    );
}