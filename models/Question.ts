import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
    },

    correctAnswer: {
      type: Number,
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },

    subTopic: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    tags: [{ type: String }],

    explanation: {
      type: String,
      default: "",
    },

    resourceLinks: [{ type: String }],

    marks: {
      type: Number,
      default: 1,
    },

    estimatedTime: {
      type: Number,
      default: 60,
    },

    learningObjective: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Question ||
  mongoose.model("Question", QuestionSchema);