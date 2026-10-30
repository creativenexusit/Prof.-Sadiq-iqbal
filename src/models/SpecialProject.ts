import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpecialProjectDocument extends Document {
  title: string;
  slug?: string;
  subtitle: string;
  description: string;
  thumbnail: {
    url: string;
    publicId?: string;
  };
  gallery: Array<{
    url: string;
    publicId?: string;
  }>;
  tags?: string[];
  projectUrl?: string;
  githubUrl?: string;
  isFeatured: boolean;
  status: 'published' | 'draft';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialProjectSchema = new Schema<ISpecialProjectDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    subtitle: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    thumbnail: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    gallery: {
      type: [
        {
          url: { type: String, default: '' },
          publicId: { type: String, default: '' },
        },
      ],
      default: [],
    },
    tags: { type: [String], default: [] },
    projectUrl: { type: String, default: '', trim: true },
    githubUrl: { type: String, default: '', trim: true },
    isFeatured: { type: Boolean, default: true, index: true },
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

SpecialProjectSchema.index({ status: 1, order: 1, createdAt: -1 });

export const SpecialProject: Model<ISpecialProjectDocument> =
  mongoose.models.SpecialProject ||
  mongoose.model<ISpecialProjectDocument>('SpecialProject', SpecialProjectSchema);

