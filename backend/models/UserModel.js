import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    avatar: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["manual", "google", "github"],
      default: "manual",
    },
    githubToken: { type: String, select: false }, 
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
