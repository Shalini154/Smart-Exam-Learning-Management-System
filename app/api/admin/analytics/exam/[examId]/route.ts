import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Question from "@/models/Question";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    await connectDB();

    const { examId } = params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        { message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    /* ---------------- FETCH ATTEMPTS ---------------- */

    const attempts = await Attempt.find({
      examId: new mongoose.Types.ObjectId(examId),
    });

    if (!attempts.length) {
      return NextResponse.json(
        { message: "No attempts found for this exam" },
        { status: 404 }
      );
    }

    /* ---------------- FETCH QUESTIONS ---------------- */

    const questions = await Question.find({
      examId: new mongoose.Types.ObjectId(examId),
    });

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    /* ---------------- AVERAGE MARKS ---------------- */

    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const averageMarks = parseFloat((totalScore / attempts.length).toFixed(2));

    /* ---------------- PASS PERCENTAGE ---------------- */

    // pass = scored >= 50% of total marks
    const passThreshold = totalMarks * 0.5;
    const passed = attempts.filter((a) => a.score >= passThreshold).length;
    const passPercentage = parseFloat(
      ((passed / attempts.length) * 100).toFixed(1)
    );

    /* ---------------- TOPIC WISE PERFORMANCE ---------------- */

    const topicMap: Record<string, { correct: number; wrong: number; score: number }> = {};

    attempts.forEach((attempt) => {
      (attempt.topicPerformance || []).forEach((tp: any) => {
        if (!topicMap[tp.topic]) {
          topicMap[tp.topic] = { correct: 0, wrong: 0, score: 0 };
        }
        topicMap[tp.topic].correct += tp.correct;
        topicMap[tp.topic].wrong   += tp.wrong;
        topicMap[tp.topic].score   += tp.score;
      });
    });

    const topicWisePerformance = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      correct: data.correct,
      wrong: data.wrong,
      score: data.score,
      accuracy: parseFloat(
        ((data.correct / (data.correct + data.wrong)) * 100).toFixed(1)
      ),
    }));

    /* ---------------- DIFFICULTY WISE PERFORMANCE ---------------- */

    const difficultyMap: Record<string, { correct: number; wrong: number }> = {};

    attempts.forEach((attempt) => {
      (attempt.difficultyPerformance || []).forEach((dp: any) => {
        if (!difficultyMap[dp.difficulty]) {
          difficultyMap[dp.difficulty] = { correct: 0, wrong: 0 };
        }
        difficultyMap[dp.difficulty].correct += dp.correct;
        difficultyMap[dp.difficulty].wrong   += dp.wrong;
      });
    });

    const difficultyWisePerformance = Object.entries(difficultyMap).map(
      ([difficulty, data]) => ({
        difficulty,
        correct: data.correct,
        wrong: data.wrong,
        total: data.correct + data.wrong,
        accuracy: parseFloat(
          ((data.correct / (data.correct + data.wrong)) * 100).toFixed(1)
        ),
      })
    );

    /* ---------------- PER QUESTION STATS ---------------- */

    const questionStats: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      questionStats[q._id.toString()] = { correct: 0, total: 0 };
    });

    attempts.forEach((attempt) => {
      questions.forEach((q) => {
        const qId = q._id.toString();
        const selected = attempt.answers?.[qId];

        if (selected !== undefined) {
          questionStats[qId].total++;
          if (selected === q.correctAnswer) {
            questionStats[qId].correct++;
          }
        }
      });
    });

    const questionAccuracy = questions.map((q) => {
      const qId = q._id.toString();
      const stats = questionStats[qId];
      const accuracy =
        stats.total > 0
          ? parseFloat(((stats.correct / stats.total) * 100).toFixed(1))
          : 0;

      return {
        questionId: qId,
        question: q.question,
        topic: q.topic,
        difficulty: q.difficulty,
        correct: stats.correct,
        total: stats.total,
        accuracy,
      };
    });

    // hardest = lowest accuracy
    const hardestQuestions = [...questionAccuracy]
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // easiest = highest accuracy
    const easiestQuestions = [...questionAccuracy]
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      totalAttempts: attempts.length,
      averageMarks,
      passPercentage,
      topicWisePerformance,
      difficultyWisePerformance,
      hardestQuestions,
      easiestQuestions,
    });

  } catch (err) {
    console.error("EXAM ANALYTICS ERROR:", err);

    return NextResponse.json(
      { message: "Failed to fetch exam analytics" },
      { status: 500 }
    );
  }
}