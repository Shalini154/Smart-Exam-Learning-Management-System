import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Question from "@/models/Question";
import Exam from "@/models/Exam";

import { matchResourcesForTopics } from "@/lib/resourceMatcher";
import { recommendQuestions } from "@/lib/recommendation";

export async function GET() {
  try {
    await connectDB();

    /* ---------------- AUTH ---------------- */

    const cookieStore = await cookies();
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

    /* ---------------- FETCH ATTEMPTS ---------------- */

    const attempts = await Attempt.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!attempts.length) {
      const videos = await Exam.find({
        recommendationVideo: {
          $exists: true,
          $ne: "",
        },
        status: "active",
      })
        .select("subject recommendationVideo")
        .lean();

      return NextResponse.json({
        weakTopics: [],
        videos: videos.map((exam: any) => ({
          topic: exam.subject,
          links: [exam.recommendationVideo],
        })),
        resources: [],
        suggestedQuestions: [],
      });
    }

    /* ---------------- WEAK TOPICS ---------------- */

    const topicMap: Record<
      string,
      {
        correct: number;
        wrong: number;
        score: number;
      }
    > = {};

    attempts.forEach((attempt: any) => {
      (attempt.topicPerformance || []).forEach(
        (tp: any) => {
          if (!topicMap[tp.topic]) {
            topicMap[tp.topic] = {
              correct: 0,
              wrong: 0,
              score: 0,
            };
          }

          topicMap[tp.topic].correct += tp.correct;
          topicMap[tp.topic].wrong += tp.wrong;
          topicMap[tp.topic].score += tp.score;
        }
      );
    });

    const weakTopics = Object.entries(topicMap)
      .filter(([_, data]) => data.wrong > data.correct)
      .sort((a, b) => b[1].wrong - a[1].wrong)
      .map(([topic, data], index) => ({
        topic,
        correct: data.correct,
        wrong: data.wrong,
        score: data.score,
        priority: index + 1,
      }));

    const weakTopicNames = weakTopics.map(
      (t) => t.topic
    );

    /* ---------------- QUESTIONS ---------------- */

    const questions = await Question.find({
      topic: {
        $in: weakTopicNames,
      },
    });

    /* ---------------- RESOURCES ---------------- */

    const matched = matchResourcesForTopics(
      questions,
      weakTopicNames
    );

    const resources: {
      topic: string;
      links: string[];
    }[] = [];

    matched.forEach((m) => {
      const links = m.resources.flatMap((r: any) =>
        r.links.filter(
          (link: string) =>
            !link.includes("youtube.com") &&
            !link.includes("youtu.be")
        )
      );

      if (links.length > 0) {
        resources.push({
          topic: m.topic,
          links,
        });
      }
    });

    /* ---------------- ADMIN VIDEOS ---------------- */

    const videos = await Exam.find({
      recommendationVideo: {
        $exists: true,
        $ne: "",
      },
      status: "active",
    })
      .select("subject recommendationVideo")
      .lean();

    const formattedVideos = videos.map(
      (exam: any) => ({
        topic: exam.subject,
        links: [exam.recommendationVideo],
      })
    );

    console.log(
      "Recommendation Videos:",
      formattedVideos
    );

    /* ---------------- SUGGESTED QUESTIONS ---------------- */

    const suggestedQuestions =
      recommendQuestions(
        questions.map((q: any) => ({
          _id: q._id.toString(),
          topic: q.topic,
          subTopic: q.subTopic || "",
          difficulty: q.difficulty,
          marks: q.marks,
          correctAnswer: q.correctAnswer,
          tags: q.tags || [],
          explanation:
            q.explanation || "",
          resourceLinks:
            q.resourceLinks || [],
          learningObjective:
            q.learningObjective || "",
        })),
        weakTopicNames
      );

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      weakTopics,
      videos: formattedVideos,
      resources,
      suggestedQuestions,
    });
  } catch (error) {
    console.error(
      "RECOMMENDATIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch recommendations",
      },
      { status: 500 }
    );
  }
}