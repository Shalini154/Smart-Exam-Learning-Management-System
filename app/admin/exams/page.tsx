"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* -------- Type -------- */
type Exam = {
    _id: string;
    title: string;
    duration: number;
    totalQuestions: number;
    recommendationVideo?: string;
    status: "active" | "inactive";
};

export default function AdminExamsPage() {
    const router = useRouter();

    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    /* -------- Fetch Exams -------- */
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch("/api/admin/exams");
                const data = await res.json();

                setExams(data || []);
            } catch (error) {
                console.error("Failed to fetch exams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    /* -------- Toggle Status -------- */
    const toggleExamStatus = async (
        id: string,
        currentStatus: "active" | "inactive"
    ) => {
        try {
            const newStatus =
                currentStatus === "active" ? "inactive" : "active";

            const res = await fetch(`/api/admin/exams/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            const updatedExam = await res.json();

            setExams((prev) =>
                prev.map((exam) =>
                    exam._id === id
                        ? { ...exam, status: updatedExam.status }
                        : exam
                )
            );
        } catch (error) {
            console.error("Failed to update exam status:", error);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-white">
                    Manage Exams
                </h1>

                <button
                    onClick={() => router.push("/admin/exams/create")}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold"
                >
                    + Create Exam
                </button>
            </div>

            {/* Loading */}
            {loading ? (
                <p className="text-gray-400">Loading exams...</p>
            ) : exams.length === 0 ? (
                <p className="text-gray-400">No exams found</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <div
                            key={exam._id}
                            className="bg-black/60 border border-gray-800 rounded-xl p-6 shadow-lg"
                        >
                            {/* Title */}
                            <h2 className="text-xl font-semibold text-white">
                                {exam.title}
                            </h2>

                            {/* Info */}
                            <p className="text-gray-400 mt-2 text-sm">
                                {exam.totalQuestions} Questions •{" "}
                                {exam.duration} Minutes
                            </p>

                            {/* Recommendation Video */}
                            {exam.recommendationVideo && (
                                <a
                                    href={exam.recommendationVideo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-3 text-blue-400 hover:text-blue-300 text-sm underline"
                                >
                                    📺 Watch Recommendation Video
                                </a>
                            )}

                            {/* Status Badge */}
                            <div className="mt-3">
                                <span
                                    className={`inline-block px-3 py-1 text-xs rounded-full ${
                                        exam.status === "active"
                                            ? "bg-green-600/20 text-green-400"
                                            : "bg-red-600/20 text-red-400"
                                    }`}
                                >
                                    {exam.status.toUpperCase()}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="mt-5 flex flex-col gap-3">
                                <div className="grid grid-cols-3 gap-2">
                                    {/* View */}
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/admin/exams/${exam._id}`
                                            )
                                        }
                                        className="py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                                    >
                                        View
                                    </button>

                                    {/* Questions */}
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/admin/exams/${exam._id}/questions`
                                            )
                                        }
                                        className="py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm"
                                    >
                                        Questions
                                    </button>

                                    {/* Edit */}
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/admin/exams/${exam._id}/edit`
                                            )
                                        }
                                        className="py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Activate / Deactivate */}
                                <button
                                    onClick={() =>
                                        toggleExamStatus(
                                            exam._id,
                                            exam.status
                                        )
                                    }
                                    className={`py-2 rounded text-white text-sm font-semibold ${
                                        exam.status === "active"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {exam.status === "active"
                                        ? "Deactivate Exam"
                                        : "Activate Exam"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}