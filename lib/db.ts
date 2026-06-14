import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI is not defined");
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  (global as any).mongoose = cached;

  return cached.conn;
}