import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlogPostDocument extends Document {
  title: string;
  slug: string;
  author: string;
  date: string;
  category: string;
  excerpt: string;
  readTime: string;
  image?: {
    url: string;
    publicId?: string;
  };
  tags?: string[];
  content?: string[];
  isFeatured: boolean;
  status: 'published' | 'draft';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPostDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    author: { type: String, default: 'Prof. Sadiq Iqbal', trim: true },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    },
    category: {
      type: String,
      required: true,
      default: 'Artificial Intelligence',
      trim: true,
      index: true,
    },
    excerpt: { type: String, required: true, trim: true },
    readTime: { type: String, default: '5 min read', trim: true },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    tags: { type: [String], default: [] },
    content: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
      index: true,
    },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const BlogPost: Model<IBlogPostDocument> =
  mongoose.models.BlogPost || mongoose.model<IBlogPostDocument>('BlogPost', BlogPostSchema);

