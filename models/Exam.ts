import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    recommendationVideo: {
    type: String,
    default: "",
},
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Exam ||
  mongoose.model("Exam", ExamSchema);
