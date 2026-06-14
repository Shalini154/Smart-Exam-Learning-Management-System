"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditExamPage() {
    const router = useRouter();
    const params = useParams();

    const examId = params.examId as string;

    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [recommendationVideo, setRecommendationVideo] =
        useState("");
    const [duration, setDuration] = useState("");
    const [totalQuestions, setTotalQuestions] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    /* ---------------- FETCH EXAM ---------------- */

    useEffect(() => {
        if (!examId) return;

        const fetchExam = async () => {
            try {
                const res = await fetch(
                    `/api/admin/exams/${examId}`
                );

                const data = await res.json();

                setTitle(data.title || "");
                setSubject(data.subject || "");
                setRecommendationVideo(
                    data.recommendationVideo || ""
                );
                setDuration(
                    data.duration?.toString() || ""
                );
                setTotalQuestions(
                    data.totalQuestions?.toString() || ""
                );
            } catch (error) {
                console.error(
                    "Failed to fetch exam",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId]);

    /* ---------------- UPDATE EXAM ---------------- */

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (
            !title ||
            !subject ||
            !duration ||
            !totalQuestions
        ) {
            alert("All fields are required");
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(
                `/api/admin/exams/${examId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        subject,
                        recommendationVideo,
                        duration: Number(duration),
                        totalQuestions:
                            Number(totalQuestions),
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update exam"
                );
            }

            alert("✅ Exam Updated Successfully");

            router.push("/admin/exams");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    /* ---------------- LOADING ---------------- */

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                Loading Exam...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-10 flex justify-center">
            <div className="w-full max-w-xl bg-black/60 border border-gray-800 rounded-xl p-8 shadow-lg">

                {/* Header */}

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">
                        Edit Exam
                    </h1>

                    <button
                        onClick={() =>
                            router.push(
                                "/admin/exams"
                            )
                        }
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg text-white"
                    >
                        Back
                    </button>
                </div>

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Title */}

                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">
                            Exam Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    {/* Subject */}

                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">
                            Subject
                        </label>

                        <input
                            type="text"
                            value={subject}
                            onChange={(e) =>
                                setSubject(
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    {/* Recommendation Video */}

                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">
                            Recommendation Video URL
                        </label>

                        <input
                            type="url"
                            value={
                                recommendationVideo
                            }
                            onChange={(e) =>
                                setRecommendationVideo(
                                    e.target.value
                                )
                            }
                            placeholder="https://youtube.com/..."
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    {/* Duration */}

                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">
                            Duration (Minutes)
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(e) =>
                                setDuration(
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    {/* Total Questions */}

                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">
                            Total Questions
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={totalQuestions}
                            onChange={(e) =>
                                setTotalQuestions(
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    {/* Preview Video */}

                    {recommendationVideo && (
                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                            <p className="text-gray-400 text-sm mb-2">
                                Current Video Link
                            </p>

                            <a
                                href={
                                    recommendationVideo
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline break-all"
                            >
                                {recommendationVideo}
                            </a>
                        </div>
                    )}

                    {/* Save Button */}

                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full py-3 rounded-lg font-semibold transition ${
                            saving
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-yellow-600 hover:bg-yellow-700"
                        } text-white`}
                    >
                        {saving
                            ? "Updating..."
                            : "Update Exam"}
                    </button>
                </form>
            </div>
        </main>
    );
}