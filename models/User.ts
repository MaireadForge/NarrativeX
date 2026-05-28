import mongoose, { type InferSchemaType, type Model, type Schema } from "mongoose";

const INTERESTS = [
  "technology",
  "sports",
  "business",
  "health",
  "science",
  "entertainment",
] as const;

type Interest = (typeof INTERESTS)[number];

const ReadHistorySchema = new mongoose.Schema(
  {
    articleId: { type: String, required: true },
    readAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    interests: {
      type: [String],
      enum: INTERESTS,
      default: [],
    },
    readHistory: {
      type: [ReadHistorySchema],
      default: [],
    },
    bookmarks: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  interests: Interest[];
};

const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument> | undefined) ||
  mongoose.model<UserDocument>("User", UserSchema as Schema<UserDocument>);

export default User;

