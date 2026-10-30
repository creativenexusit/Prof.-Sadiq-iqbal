import mongoose, { Schema, Document, Model } from 'mongoose';

export type PublicationCategory =
  | 'journal'
  | 'conference'
  | 'book'
  | 'book_chapter'
  | 'preprint';

export interface IPublication extends Document {
  title: string;
  slug: string;
  category: PublicationCategory;
  authors: string[];
  journalOrPublisher: string;
  year: number;
  publicationDate?: Date;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  doiUrl?: string;
  publisherUrl?: string;
  openAccessPdfUrl?: string;
  codeRepositoryUrl?: string;
  datasetUrl?: string;
  abstract: string;
  bibtex?: string;
  coverImage?: {
    url: string;
    publicId: string;
  };
  pdfFile?: {
    url: string;
    publicId: string;
  };
  citationCount: number;
  isFeatured: boolean;
  status: 'published' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const PublicationSchema = new Schema<IPublication>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['journal', 'conference', 'book', 'book_chapter', 'preprint'],
      required: true,
      index: true,
    },
    authors: { type: [String], required: true },
    journalOrPublisher: { type: String, required: true },
    year: { type: Number, required: true, index: true },
    publicationDate: { type: Date },
    volume: { type: String, default: '' },
    issue: { type: String, default: '' },
    pages: { type: String, default: '' },
    doi: { type: String, default: '' },
    doiUrl: { type: String, default: '' },
    publisherUrl: { type: String, default: '' },
    openAccessPdfUrl: { type: String, default: '' },
    codeRepositoryUrl: { type: String, default: '' },
    datasetUrl: { type: String, default: '' },
    abstract: { type: String, default: '' },
    bibtex: { type: String, default: '' },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    pdfFile: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    citationCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index for global search
PublicationSchema.index({ title: 'text', abstract: 'text', journalOrPublisher: 'text' });

export const Publication: Model<IPublication> =
  mongoose.models.Publication ||
  mongoose.model<IPublication>('Publication', PublicationSchema);
