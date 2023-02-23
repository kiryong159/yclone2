import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatarUrl: { type: String, default: "" },
  socialOnly: { type: Boolean, default: false },
  name: String,
  location: String,
});

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 1);
  }
});

const User = mongoose.model("User", UserSchema);

export default User;
