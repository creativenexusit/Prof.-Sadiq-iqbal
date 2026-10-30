import mongoose, { Schema, Document, Model } from 'mongoose';

export type AcademicItemCategory =
  | 'project'
  | 'patent'
  | 'lab_member'
  | 'teaching'
  | 'supervision'
  | 'talk'
  | 'news'
  | 'gallery';

export interface IMetaDetails {
  // Gallery
  galleryCategory?: string; // 'Conference' | 'Award Ceremony' | 'Lab Life' | 'Campus'
  galleryLocation?: string;

  // Patent
  patentNumber?: string;
  patentStatus?: 'Granted' | 'Pending' | 'Filed';
  patentOffice?: string;

  // Lab Member & Alumni
  memberRole?: string; // 'PhD Candidate' | 'Postdoc' | 'Alumni' | 'Research Assistant'
  currentAffiliation?: string; // 'Now Research Scientist at Google DeepMind'
  socialProfileUrl?: string;

  // Teaching
  courseCode?: string;
  level?: 'Undergraduate' | 'Graduate' | 'Postgraduate';
  syllabusUrl?: string;
  semester?: string;

  // Project
  fundingAgency?: string;
  grantAmount?: string;
  collaborators?: string[];
  projectStatus?: 'Ongoing' | 'Completed';

  // Supervision
  studentName?: string;
  thesisTopic?: string;
  degreeType?: 'PhD' | 'MSc' | 'BSc';
  completionYear?: string;

  // Talk
  talkType?: 'Keynote' | 'Invited Speaker' | 'Guest Lecture' | 'Panelist';
  eventVenue?: string;
  slidesUrl?: string;
  videoUrl?: string;

  // News / Media
  mediaOutlet?: string; // e.g. 'BBC News', 'Nature News'
  mediaType?: 'Article' | 'TV Interview' | 'Podcast' | 'Press Release';
}

export interface IAcademicItem extends Document {
  title: string;
  slug: string;
  category: AcademicItemCategory;
  description: string;
  content?: string;
  image?: {
    url: string;
    publicId: string;
    caption?: string;
  };
  dateOrPeriod?: string;
  externalLink?: string;
  metaDetails: IMetaDetails;
  isFeatured: boolean;
  status: 'published' | 'draft';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicItemSchema = new Schema<IAcademicItem>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: [
        'project',
        'patent',
        'lab_member',
        'teaching',
        'supervision',
        'talk',
        'news',
        'gallery',
      ],
      required: true,
      index: true,
    },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      caption: { type: String, default: '' },
    },
    dateOrPeriod: { type: String, default: '' },
    externalLink: { type: String, default: '' },
    metaDetails: {
      galleryCategory: { type: String, default: '' },
      galleryLocation: { type: String, default: '' },
      patentNumber: { type: String, default: '' },
      patentStatus: { type: String, default: '' },
      patentOffice: { type: String, default: '' },
      memberRole: { type: String, default: '' },
      currentAffiliation: { type: String, default: '' },
      socialProfileUrl: { type: String, default: '' },
      courseCode: { type: String, default: '' },
      level: { type: String, default: '' },
      syllabusUrl: { type: String, default: '' },
      semester: { type: String, default: '' },
      fundingAgency: { type: String, default: '' },
      grantAmount: { type: String, default: '' },
      collaborators: { type: [String], default: [] },
      projectStatus: { type: String, default: '' },
      studentName: { type: String, default: '' },
      thesisTopic: { type: String, default: '' },
      degreeType: { type: String, default: '' },
      completionYear: { type: String, default: '' },
      talkType: { type: String, default: '' },
      eventVenue: { type: String, default: '' },
      slidesUrl: { type: String, default: '' },
      videoUrl: { type: String, default: '' },
      mediaOutlet: { type: String, default: '' },
      mediaType: { type: String, default: '' },
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
  {
    timestamps: true,
  }
);

AcademicItemSchema.index({ category: 1, isFeatured: -1, order: 1 });
AcademicItemSchema.index({ title: 'text', description: 'text' });

export const AcademicItem: Model<IAcademicItem> =
  mongoose.models.AcademicItem ||
  mongoose.model<IAcademicItem>('AcademicItem', AcademicItemSchema);
