import mongoose, { Schema, Document, Model } from 'mongoose';

export type FaqCategory =
  | 'general'
  | 'admission'
  | 'research'
  | 'supervision'
  | 'courses'
  | 'contact'
  | 'recommendation'
  | 'publication';

export interface IFaq extends Document {
  question: string;
  answer: string;
  category: FaqCategory;
  /** Uploaded reference PDF — e.g., "Recommendation Letter Policy.pdf" */
  pdfFile?: {
    url: string;
    publicId: string;
    fileName: string;
  };
  isFeatured: boolean;
  status: 'published' | 'draft';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'general',
        'admission',
        'research',
        'supervision',
        'courses',
        'contact',
        'recommendation',
        'publication',
      ],
      default: 'general',
      index: true,
    },
    pdfFile: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      fileName: { type: String, default: '' },
    },
    isFeatured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
      index: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FaqSchema.index({ category: 1, order: 1 });
FaqSchema.index({ question: 'text', answer: 'text' });

export const Faq: Model<IFaq> =
  mongoose.models.Faq || mongoose.model<IFaq>('Faq', FaqSchema);
