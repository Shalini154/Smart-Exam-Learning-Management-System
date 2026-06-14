"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type QuestionBlock = {
    question: string;
    options: string[];
    correctAnswer: number;
    topic: string;
    subTopic: string;
    difficulty: string;
    tags: string[];
    explanation: string;
    resourceLinks: string[];
    marks: number;
    estimatedTime: number;
    learningObjective: string;
};

type Question = {
    _id: string;
    question: string;
    options: string[];
    correctAnswer: number;
};

export default function AdminQuestionsPage() {
    const { examId } = useParams();

    const [questionsList, setQuestionsList] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [questions, setQuestions] = useState<QuestionBlock[]>([
        {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            topic: "",
            subTopic: "",
            difficulty: "medium",
            tags: [],
            explanation: "",
            resourceLinks: [],
            marks: 1,
            estimatedTime: 60,
            learningObjective: "",
        },
    ]);

    const [saving, setSaving] = useState(false);

    /* ---------------- FETCH QUESTIONS ---------------- */

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`/api/admin/questions/${examId}`);
            const data = await res.json();
            setQuestionsList(data || []);
        } catch {
            setQuestionsList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (examId) fetchQuestions();
    }, [examId]);

    /* ---------------- ADD / REMOVE BLOCK ---------------- */

    const addQuestionBlock = () => {
        setQuestions(prev => [
            ...prev,
            {
                question: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                topic: "",
                subTopic: "",
                difficulty: "medium",
                tags: [],
                explanation: "",
                resourceLinks: [],
                marks: 1,
                estimatedTime: 60,
                learningObjective: "",
            },
        ]);
    };

    const removeQuestionBlock = (index: number) => {
        if (questions.length === 1) {
            alert("At least one question required");
            return;
        }
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    /* ---------------- HANDLE INPUT ---------------- */

    const handleQuestionChange = (index: number, value: string) => {
        const updated = [...questions];
        updated[index].question = value;
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = value;
        setQuestions(updated);
    };

    const handleCorrectAnswer = (qIndex: number, value: number) => {
        const updated = [...questions];
        updated[qIndex].correctAnswer = value;
        setQuestions(updated);
    };

    const handleFieldChange = (index: number, field: keyof QuestionBlock, value: any) => {
        const updated = [...questions];
        (updated[index] as any)[field] = value;
        setQuestions(updated);
    };

    /* ---------------- SUBMIT ALL ---------------- */

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        for (let q of questions) {
            if (!q.question || !q.topic || q.options.some(o => !o)) {
                alert("Question, topic, and all options are required");
                return;
            }
        }

        setSaving(true);

        try {
            const res = await fetch("/api/admin/questions/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ examId, questions }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert("✅ Questions added successfully");

            setQuestions([
                {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0,
                    topic: "",
                    subTopic: "",
                    difficulty: "medium",
                    tags: [],
                    explanation: "",
                    resourceLinks: [],
                    marks: 1,
                    estimatedTime: 60,
                    learningObjective: "",
                },
            ]);

            setShowForm(false);
            fetchQuestions();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-10">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Exam Questions</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                >
                    {showForm ? "Close Form" : "+ Add Question"}
                </button>
            </div>

            {/* -------- QUESTION LIST -------- */}

            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : questionsList.length === 0 ? (
                <p className="text-gray-400">No questions found</p>
            ) : (
                <div className="space-y-4 mb-10">
                    {questionsList.map((q, i) => (
                        <div key={q._id} className="bg-black/60 border border-gray-800 p-5 rounded-xl">
                            <p className="text-white font-semibold">
                                Q{i + 1}. {q.question}
                            </p>
                            <ul className="mt-2 text-gray-400">
                                {q.options.map((opt, idx) => (
                                    <li
                                        key={idx}
                                        className={idx === q.correctAnswer ? "text-green-400 font-semibold" : ""}
                                    >
                                        {String.fromCharCode(65 + idx)}. {opt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* -------- FORM -------- */}

            {showForm && (
                <div className="bg-black/60 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl text-white mb-4">Add Multiple Questions</h2>

                    <form onSubmit={handleSubmit}>
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="mb-6 p-4 bg-gray-900 rounded space-y-3">

                                <p className="text-gray-400 text-sm font-semibold">Question {qIndex + 1}</p>

                                {/* Question */}
                                <textarea
                                    placeholder={`Question ${qIndex + 1}`}
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                {/* Options */}
                                {q.options.map((opt, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                        value={opt}
                                        onChange={(e) => handleOptionChange(qIndex, i, e.target.value)}
                                        className="w-full p-2 bg-black text-white rounded"
                                    />
                                ))}

                                {/* Correct Answer */}
                                <select
                                    value={q.correctAnswer}
                                    onChange={(e) => handleCorrectAnswer(qIndex, Number(e.target.value))}
                                    className="w-full p-2 bg-black text-white rounded"
                                >
                                    <option value={0}>Correct: A</option>
                                    <option value={1}>Correct: B</option>
                                    <option value={2}>Correct: C</option>
                                    <option value={3}>Correct: D</option>
                                </select>

                                {/* Topic */}
                                <input
                                    type="text"
                                    placeholder="Topic *"
                                    value={q.topic}
                                    onChange={(e) => handleFieldChange(qIndex, "topic", e.target.value)}
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                {/* Sub Topic */}
                                <input
                                    type="text"
                                    placeholder="Sub Topic"
                                    value={q.subTopic}
                                    onChange={(e) => handleFieldChange(qIndex, "subTopic", e.target.value)}
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                {/* Difficulty */}
                                <select
                                    value={q.difficulty}
                                    onChange={(e) => handleFieldChange(qIndex, "difficulty", e.target.value)}
                                    className="w-full p-2 bg-black text-white rounded"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>

                                {/* Tags */}
                                <input
                                    type="text"
                                    placeholder="Tags (comma separated)"
                                    value={q.tags.join(", ")}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            qIndex,
                                            "tags",
                                            e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                                        )
                                    }
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                {/* Explanation */}
                                <textarea
                                    placeholder="Explanation"
                                    value={q.explanation}
                                    onChange={(e) => handleFieldChange(qIndex, "explanation", e.target.value)}
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                {/* Resource Links */}
                                <input
                                    type="text"
                                    placeholder="Resource Links (comma separated)"
                                    value={q.resourceLinks.join(", ")}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            qIndex,
                                            "resourceLinks",
                                            e.target.value.split(",").map(l => l.trim()).filter(Boolean)
                                        )
                                    }
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                {/* Marks */}
                                <input
                                    type="number"
                                    placeholder="Marks"
                                    value={q.marks}
                                    onChange={(e) => handleFieldChange(qIndex, "marks", Number(e.target.value))}
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                {/* Estimated Time */}
                                <input
                                    type="number"
                                    placeholder="Estimated Time (seconds)"
                                    value={q.estimatedTime}
                                    onChange={(e) => handleFieldChange(qIndex, "estimatedTime", Number(e.target.value))}
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                {/* Learning Objective */}
                                <textarea
                                    placeholder="Learning Objective"
                                    value={q.learningObjective}
                                    onChange={(e) => handleFieldChange(qIndex, "learningObjective", e.target.value)}
                                    className="w-full p-2 bg-black text-white rounded"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeQuestionBlock(qIndex)}
                                    className="px-3 py-1 bg-red-600 text-white rounded"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        {/* ADD MORE */}
                        <button
                            type="button"
                            onClick={addQuestionBlock}
                            className="w-full py-2 bg-blue-600 text-white rounded mb-4"
                        >
                            + Add More Question
                        </button>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3 bg-green-600 text-white rounded"
                        >
                            {saving ? "Saving..." : "Save All Questions"}
                        </button>
                    </form>
                </div>
            )}
        </main>
    );
}