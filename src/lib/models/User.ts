import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "Buyer" | "Seller";
  googleId: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["Buyer", "Seller"], default: "Buyer" },
    googleId: { type: String, required: true, unique: true },
    refreshToken: { type: String }, // will store Google refresh token
  },
  { timestamps: true } // automatically add createdAt and updatedAt
);

// Prevent model overwrite upon hot reload in dev
const User = models.User || model<IUser>("User", UserSchema);

export default User;
