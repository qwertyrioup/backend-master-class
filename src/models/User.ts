import mongoose, { Document, Model, Schema } from "mongoose";

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "master" | "admin" | "user";
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["master", "admin", "user"],
      default: "user",
    },
  },
  { timestamps: true, collection: "users" }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
