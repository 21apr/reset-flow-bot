import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/User.interface";

const UserSchema: Schema = new Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    default: null,
  },
  firstName: {
    type: String,
    default: null,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  totalBreathingSeconds: {
    type: Number,
    default: 0,
  },
  language: {
    type: String,
    default: "en",
  },
});

export default mongoose.model<IUser>("User", UserSchema);
