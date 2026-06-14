import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    answers: {
      type: Object,
      required: true,
    },

    questionOutcomes: [
      {
        questionId:  { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        topic:       String,
        subTopic:    String,
        difficulty:  String,
        isCorrect:   Boolean,
        marksEarned: Number,
        marksTotal:  Number,
      },
    ],

    correct: {
      type: Number,
      required: true,
    },

    wrong: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    topicPerformance: [
      {
        topic:   String,
        correct: Number,
        wrong:   Number,
        score:   Number,
      },
    ],

    difficultyPerformance: [
      {
        difficulty: String,
        correct:    Number,
        wrong:      Number,
      },
    ],

    recommendations: [
      {
        topic:    String,
        priority: Number,
      },
    ],

    cheatingProbability: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// prevent multiple attempts
AttemptSchema.index({ userId: 1, examId: 1 }, { unique: true });

export default mongoose.models.Attempt ||
  mongoose.model("Attempt", AttemptSchema);