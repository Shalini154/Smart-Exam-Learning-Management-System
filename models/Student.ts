import mongoose, { Schema, models } from "mongoose";

const StudentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
   
  },
  { timestamps: true }
);

export default models.Student || mongoose.model("Student", StudentSchema);
