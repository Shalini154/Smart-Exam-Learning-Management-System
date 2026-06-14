"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import Footer from "@/app/components/Footer";

type Question = {
  _id: string;
  question: string;
  options: string[];
};

export default function ExamTestPage() {
  const params = useParams();
  const router = useRouter();

  const examId =
    typeof params.examId === "string"
      ? params.examId
      : Array.isArray(params.examId)
        ? params.examId[0]
        : "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  /* ---------------- FETCH QUESTIONS + EXAM ---------------- */

  useEffect(() => {
    if (!examId) return;

    Promise.all([
      fetch(`/api/questions/${examId}`).then(r => r.json()),
      fetch(`/api/exams/${examId}`).then(r => r.json()),
    ])
      .then(([qData, examData]) => {
        setQuestions(qData || []);
        setTimeLeft((examData?.duration || 0) * 60);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [examId]);

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (loading || timeLeft === null || submitted) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => (t !== null ? t - 1 : t));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, submitted]);

  /* ---------------- ANSWERS ---------------- */

  const handleSelect = (optionIndex: number) => {
    const questionId = questions[current]._id;

    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (auto = false) => {
    if (submitted) return;

    try {
      setSubmitted(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user?._id) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/exams/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId,
          userId: user._id,  // 🔥 FIXED HERE
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Submission failed");
      }

      router.push(`/student/results/${data.attemptId}`);
    } catch (error: any) {
      alert(error.message || "Submit failed");
      setSubmitted(false);
    }
  };

  /* ---------------- UI SAFETY ---------------- */

  if (loading || timeLeft === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading exam...
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        No questions found for this exam.
      </div>
    );
  }

  const q = questions[current];

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
      <DashboardHeader />

      <section className="flex-1 px-4 py-10">
        <div className="max-w-4xl mx-auto bg-black/60 border border-gray-800 p-8 rounded-xl">

          {/* Header */}
          <div className="flex justify-between mb-6">
            <p className="text-sm text-gray-400">
              Question {current + 1} of {questions.length}
            </p>

            <p className="text-sm font-semibold text-red-400">
              Time Left: {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
            </p>
          </div>

          {/* Question */}
          <h2 className="text-lg font-semibold text-white mb-6">
            {q.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, index) => (
              <label
                key={index}
                className={`block p-3 rounded cursor-pointer border ${answers[q._id] === index
                  ? "border-blue-600 bg-blue-600/20"
                  : "border-gray-700 bg-gray-900"
                  }`}
              >
                <input
                  type="radio"
                  className="hidden"
                  checked={answers[q._id] === index}
                  onChange={() => handleSelect(index)}
                />
                <span className="text-gray-300">{opt}</span>
              </label>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent(c => c - 1)}
              className="px-6 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
            >
              Previous
            </button>

            {current === questions.length - 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("🔥 Button clicked");
                  console.log("Exam ID:", examId);
                  console.log("Answers:", answers);
                  handleSubmit(false);
                }}
                disabled={submitted}
                className={`px-6 py-2 rounded font-semibold ${submitted
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
                  } text-white`}
              >
                {submitted ? "Submitting..." : "Submit Exam"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrent((c) => c + 1)}
                className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Next
              </button>
            )}

          </div>

        </div>

      </section>

      <Footer />
    </main>
  );
}