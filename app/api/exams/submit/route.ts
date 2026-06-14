import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import Attempt from "@/models/Attempt";

export async function POST(req: Request) {
  try {
    await connectDB();

    /* ---------------- GET TOKEN FROM COOKIE ---------------- */

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    const userId = decoded.id;

    /* ---------------- GET REQUEST BODY ---------------- */

    const { examId, answers } = await req.json();

    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        { message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { message: "Invalid answers data" },
        { status: 400 }
      );
    }

    /* ---------------- FETCH QUESTIONS ---------------- */

    const questions = await Question.find({
      examId: new mongoose.Types.ObjectId(examId),
    });

    if (!questions.length) {
      return NextResponse.json(
        { message: "No questions found for this exam" },
        { status: 404 }
      );
    }

    /* ---------------- CALCULATE RESULT ---------------- */

    let correct = 0;
    let wrong   = 0;
    let score   = 0;

    const questionOutcomes: any[]                                                      = [];
    const topicMap: Record<string, { correct: number; wrong: number; score: number }> = {};
    const difficultyMap: Record<string, { correct: number; wrong: number }>           = {};

    questions.forEach((q) => {
      const selected  = answers[q._id.toString()];
      const isCorrect = selected === q.correctAnswer;

      // overall
      if (isCorrect) {
        correct++;
        score += q.marks;
      } else {
        wrong++;
      }

      // per-question outcome
      questionOutcomes.push({
        questionId:  q._id,
        topic:       q.topic      || "Unknown",
        subTopic:    q.subTopic   || "",
        difficulty:  q.difficulty || "medium",
        isCorrect,
        marksEarned: isCorrect ? q.marks : 0,
        marksTotal:  q.marks,
      });

      // topic wise
      const topic = q.topic || "Unknown";
      if (!topicMap[topic]) {
        topicMap[topic] = { correct: 0, wrong: 0, score: 0 };
      }
      if (isCorrect) {
        topicMap[topic].correct++;
        topicMap[topic].score += q.marks;
      } else {
        topicMap[topic].wrong++;
      }

      // difficulty wise
      const difficulty = q.difficulty || "medium";
      if (!difficultyMap[difficulty]) {
        difficultyMap[difficulty] = { correct: 0, wrong: 0 };
      }
      if (isCorrect) {
        difficultyMap[difficulty].correct++;
      } else {
        difficultyMap[difficulty].wrong++;
      }
    });

    const total = questions.length;

    /* ---------------- BUILD ANALYTICS ---------------- */

    const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      correct: data.correct,
      wrong:   data.wrong,
      score:   data.score,
    }));

    const difficultyPerformance = Object.entries(difficultyMap).map(([difficulty, data]) => ({
      difficulty,
      correct: data.correct,
      wrong:   data.wrong,
    }));

    const recommendations = topicPerformance
      .filter((t) => t.wrong > t.correct)
      .sort((a, b) => b.wrong - a.wrong)
      .map((t, index) => ({
        topic:    t.topic,
        priority: index + 1,
      }));

    /* ---------------- SAVE ATTEMPT ---------------- */

    const attempt = await Attempt.create({
      userId:  new mongoose.Types.ObjectId(userId),
      examId:  new mongoose.Types.ObjectId(examId),
      answers,
      questionOutcomes,
      correct,
      wrong,
      total,
      score,
      topicPerformance,
      difficultyPerformance,
      recommendations,
    });

    return NextResponse.json({
      message: "Exam submitted successfully",
      attemptId: attempt._id,
      correct,
      wrong,
      total,
      score,
      topicPerformance,
      difficultyPerformance,
      recommendations,
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);

    return NextResponse.json(
      { message: "Exam submission failed" },
      { status: 500 }
    );
  }
}