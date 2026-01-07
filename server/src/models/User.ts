// src/models/User.ts
import mongoose from "mongoose";

export interface IUser {
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
  passwordHash: string;
  refreshTokens: string[];
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], required: true },
    passwordHash: { type: String, required: true },
    refreshTokens: { type: [String], default: [] }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

export default mongoose.model<IUser>("User", UserSchema);
