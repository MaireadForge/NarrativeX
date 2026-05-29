import mongoose, { type InferSchemaType, type Model, type Schema } from "mongoose";

const CATEGORIES = [
  "technology",
  "sports",
  "business",
  "health",
  "science",
  "entertainment",
  "general",
] as const;

const SourceSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    name: { type: String, default: "" },
  },
  { _id: false }
);

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    content: { type: String, default: "" },
    url: { type: String, required: true, unique: true },
    urlToImage: { type: String, default: "" },
    source: { type: SourceSchema, default: { id: "", name: "" } },
    category: {
      type: String,
      enum: CATEGORIES,
      default: "general",
    },
    publishedAt: { type: Date, required: true },
    aiSummary: { type: String, default: "" },
    summaryGeneratedAt: { type: Date },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ArticleSchema.index({ title: "text", description: "text", aiSummary: "text" });

export type ArticleDocument = InferSchemaType<typeof ArticleSchema>;

const Article: Model<ArticleDocument> =
  (mongoose.models.Article as Model<ArticleDocument> | undefined) ||
  mongoose.model<ArticleDocument>("Article", ArticleSchema as Schema<ArticleDocument>);

export default Article;

