"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import Footer from "@/app/components/Footer";
import ExamCamera from "@/app/components/ExamCamera";

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
  const [answers, setAnswers] = useState<{
    [key: string]: number;
  }>({});

  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] =
    useState<number | null>(null);
  const [submitted, setSubmitted] =
    useState(false);

  // NEW
  const [violations, setViolations] =
    useState<string[]>([]);

  /* ---------------- CAMERA VIOLATIONS ---------------- */

  const handleViolation = (
    type: string
  ) => {
    setViolations((prev) => [
      ...prev,
      type,
    ]);
  };

  /* ---------------- FETCH QUESTIONS + EXAM ---------------- */

  useEffect(() => {
    if (!examId) return;

    Promise.all([
      fetch(`/api/questions/${examId}`).then(
        (res) => res.json()
      ),
      fetch(`/api/exams/${examId}`).then(
        (res) => res.json()
      ),
    ])
      .then(
        ([questionsData, examData]) => {
          setQuestions(
            questionsData || []
          );

          setTimeLeft(
            (examData?.duration || 10) *
              60
          );

          setLoading(false);
        }
      )
      .catch(() =>
        setLoading(false)
      );
  }, [examId]);

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (
      loading ||
      timeLeft === null ||
      submitted
    )
      return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) =>
        t !== null ? t - 1 : t
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    timeLeft,
    loading,
    submitted,
  ]);

  /* ---------------- SELECT OPTION ---------------- */

  const handleSelect = (
    optionIndex: number
  ) => {
    const questionId =
      questions[current]._id;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  /* ---------------- SUBMIT EXAM ---------------- */

  const handleSubmit = async (
    auto = false
  ) => {
    if (submitted) return;

    try {
      setSubmitted(true);

      if (auto) {
        alert(
          "Time over! Exam submitted automatically."
        );
      }

      const res = await fetch(
        "/api/exams/submit",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            examId,
            answers,

            // NEW
            violations,
            totalViolations:
              violations.length,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Submission failed"
        );
      }

      router.push(
        `/student/results/${data.attemptId}`
      );
    } catch (error: any) {
      alert(
        error.message ||
          "Submit failed"
      );

      setSubmitted(false);
    }
  };

  /* ---------------- SAFETY ---------------- */

  if (
    loading ||
    timeLeft === null
  ) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
      <DashboardHeader />

      <section className="flex-1 px-4 py-10">
        <div className="max-w-4xl mx-auto bg-black/60 border border-gray-800 p-8 rounded-xl">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-400">
              Question {current + 1} of{" "}
              {questions.length}
            </p>

            <div className="text-right">
              <p className="text-sm font-semibold text-red-400">
                Time Left:{" "}
                {Math.floor(
                  timeLeft / 60
                )}
                :
                {String(
                  timeLeft % 60
                ).padStart(2, "0")}
              </p>

              {/* NEW */}
              <p className="text-xs text-yellow-400 mt-1">
                Violations:{" "}
                {violations.length}
              </p>
            </div>
          </div>

          {/* QUESTION */}
          <h2 className="text-lg font-semibold text-white mb-6">
            {q.question}
          </h2>

          {/* OPTIONS */}
          <div className="space-y-3">
            {q.options.map(
              (opt, index) => (
                <label
                  key={index}
                  className={`block p-3 rounded cursor-pointer border ${
                    answers[q._id] ===
                    index
                      ? "border-blue-600 bg-blue-600/20"
                      : "border-gray-700 bg-gray-900"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={
                      answers[q._id] ===
                      index
                    }
                    onChange={() =>
                      handleSelect(
                        index
                      )
                    }
                  />

                  <span className="text-gray-300">
                    {opt}
                  </span>
                </label>
              )
            )}
          </div>

          {/* NAVIGATION */}
          <div className="flex justify-between mt-8">
            <button
              disabled={
                current === 0
              }
              onClick={() =>
                setCurrent(
                  current - 1
                )
              }
              className="px-6 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
            >
              Previous
            </button>

            {current ===
            questions.length - 1 ? (
              <button
                onClick={() =>
                  handleSubmit(
                    false
                  )
                }
                disabled={
                  submitted
                }
                className="px-6 py-2 rounded bg-green-600 text-white font-semibold"
              >
                {submitted
                  ? "Submitting..."
                  : "Submit Exam"}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrent(
                    current + 1
                  )
                }
                className="px-6 py-2 rounded bg-blue-600 text-white"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CAMERA */}
      <ExamCamera
        onViolation={
          handleViolation
        }
      />

      <Footer />
    </main>
  );
}