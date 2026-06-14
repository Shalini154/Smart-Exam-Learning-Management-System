"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Exam = {
    _id: string;
    title: string;
    subject: string;
    recommendationVideo?: string;
    duration: number;
    totalQuestions: number;
    status: string;
    createdAt: string;
};

export default function AdminExamDetailsPage() {
    const { examId } = useParams();
    const router = useRouter();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);

    /* -------- FETCH SINGLE EXAM -------- */
    useEffect(() => {
        if (!examId) return;

        const fetchExam = async () => {
            try {
                const res = await fetch(`/api/admin/exams/${examId}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch exam");
                }

                const data = await res.json();
                setExam(data);
            } catch (error) {
                console.error("Error fetching exam:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId]);

    /* -------- LOADING -------- */
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
                Loading exam...
            </div>
        );
    }

    /* -------- NOT FOUND -------- */
    if (!exam) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
                Exam not found
            </div>
        );
    }

    /* -------- UI -------- */
    return (
        <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-white">
                    Exam Details
                </h1>

                <button
                    onClick={() => router.push("/admin/exams")}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded text-white"
                >
                    ← Back
                </button>
            </div>

            {/* Card */}
            <div className="max-w-3xl mx-auto bg-black/60 border border-gray-800 rounded-xl p-8 shadow-lg space-y-6">
                {/* Title */}
                <div>
                    <p className="text-gray-400 text-sm">Title</p>
                    <h2 className="text-xl text-white font-semibold">
                        {exam.title}
                    </h2>
                </div>

                {/* Subject */}
                <div>
                    <p className="text-gray-400 text-sm">Subject</p>
                    <h2 className="text-white">{exam.subject}</h2>
                </div>

                {/* Duration & Questions */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-400 text-sm">Duration</p>
                        <p className="text-white">
                            {exam.duration} Minutes
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-400 text-sm">
                            Total Questions
                        </p>
                        <p className="text-white">
                            {exam.totalQuestions}
                        </p>
                    </div>
                </div>

                {/* Status */}
                <div>
                    <p className="text-gray-400 text-sm">Status</p>

                    <p
                        className={`font-semibold ${
                            exam.status === "active"
                                ? "text-green-400"
                                : "text-red-400"
                        }`}
                    >
                        {exam.status.toUpperCase()}
                    </p>
                </div>

                {/* Recommendation Video */}
                <div>
                    <p className="text-gray-400 text-sm">
                        Recommendation Video
                    </p>

                    {exam.recommendationVideo ? (
                        <a
                            href={exam.recommendationVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1 text-blue-400 hover:text-blue-300 underline"
                        >
                            📺 Watch Recommendation Video
                        </a>
                    ) : (
                        <p className="text-gray-500">
                            No recommendation video available
                        </p>
                    )}
                </div>

                {/* Created Date */}
                <div>
                    <p className="text-gray-400 text-sm">Created On</p>
                    <p className="text-white">
                        {new Date(exam.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-800 flex gap-3">
                    <button
                        onClick={() =>
                            router.push(`/admin/exams/${exam._id}/edit`)
                        }
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white"
                    >
                        Edit Exam
                    </button>

                    <button
                        onClick={() =>
                            router.push(
                                `/admin/exams/${exam._id}/questions`
                            )
                        }
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
                    >
                        Manage Questions
                    </button>
                </div>
            </div>
        </main>
    );
}