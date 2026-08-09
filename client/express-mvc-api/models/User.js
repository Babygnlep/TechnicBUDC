import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "กรุณาระบุชื่อ"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "กรุณาระบุอีเมล"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "กรุณาระบุรหัสผ่าน"],
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
