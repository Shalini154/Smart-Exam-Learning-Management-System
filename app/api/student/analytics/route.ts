import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";

export async function GET(req: Request) {
  try {
    await connectDB();

    /* ---------------- AUTH ---------------- */

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

    /* ---------------- FETCH ALL ATTEMPTS ---------------- */

    const attempts = await Attempt.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!attempts.length) {
      return NextResponse.json(
        { message: "No attempts found" },
        { status: 404 }
      );
    }

    /* ---------------- OVERALL SCORE ---------------- */

    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const averageScore = parseFloat((totalScore / attempts.length).toFixed(2));
    const overallScore = totalScore;

    /* ---------------- AGGREGATE TOPIC PERFORMANCE ---------------- */

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

    const topicList = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      correct: data.correct,
      wrong: data.wrong,
      score: data.score,
      total: data.correct + data.wrong,
      accuracy: parseFloat(
        ((data.correct / (data.correct + data.wrong)) * 100).toFixed(1)
      ),
    }));

    // strongest = highest accuracy, at least 1 correct
    const strongestTopics = [...topicList]
      .filter((t) => t.correct > 0)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    // weakest = lowest accuracy, at least 1 wrong
    const weakestTopics = [...topicList]
      .filter((t) => t.wrong > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    /* ---------------- AGGREGATE DIFFICULTY BREAKDOWN ---------------- */

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

    const difficultyBreakdown = Object.entries(difficultyMap).map(
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

    /* ---------------- AGGREGATE RECOMMENDATIONS ---------------- */

    const recommendationMap: Record<string, number> = {};

    attempts.forEach((attempt) => {
      (attempt.recommendations || []).forEach((r: any) => {
        if (!recommendationMap[r.topic]) {
          recommendationMap[r.topic] = 0;
        }
        // accumulate priority scores (lower priority number = more urgent)
        recommendationMap[r.topic] += 1;
      });
    });

    const recommendations = Object.entries(recommendationMap)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count], index) => ({
        topic,
        appearedInAttempts: count,
        priority: index + 1,
      }));

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      overallScore,
      averageScore,
      strongestTopics,
      weakestTopics,
      difficultyBreakdown,
      recommendations,
    });

  } catch (err) {
    console.error("ANALYTICS ERROR:", err);

    return NextResponse.json(
      { message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}