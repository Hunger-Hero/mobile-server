import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: String,
  email: String,
  password: String,
  profilePicture: String,
  userName: String,
  bio: String,
  token: String,
  phoneVerified: Boolean,
  role: String,
});

export default mongoose.model("User", userSchema);
