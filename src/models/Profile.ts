import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEducation {
  degree: string;
  field: string;
  institution: string;
  passingYear: string;
  thesisTitle?: string;
  certificateUrl?: string;
}

export interface IExperience {
  position: string;
  department: string;
  institution: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  institutionUrl?: string;
  description?: string;
}

export interface IAward {
  title: string;
  organization: string;
  year: string;
  description?: string;
  awardUrl?: string;
  imageUrl?: string;
}

export interface ICustomSocialLink {
  name: string;
  url: string;
}

export interface IProfessionalService {
  role: string;
  organizationOrJournal: string;
  period: string;
}

export interface IProfile extends Document {
  fullName: string;
  designation: string;
  department: string;
  institution: string;
  yearsExperience?: string;
  educationSummary?: string;
  bio: string;
  aboutContent: string;
  avatar: {
    url: string;
    publicId: string;
  };
  cvFile: {
    url: string;
    publicId: string;
    fileName: string;
  };
  stats: {
    totalCitations: number;
    hIndex: number;
    i10Index: number;
    totalPublications: number;
    grantsFunded: string;
  };
  contact: {
    email: string;
    phone: string;
    officeLocation: string;
    whatsappNumber: string;
    whatsappGreetingText: string;
    appointmentUrl: string;
    institutionalUrl: string;
  };
  socialLinks: {
    googleScholar: string;
    orcid: string;
    researchGate: string;
    scopus: string;
    dblp: string;
    arxiv: string;
    linkedin: string;
    twitter: string;
    facebook?: string;
    instagram?: string;
    github: string;
    personalWebsite: string;
    customLinks?: ICustomSocialLink[];
  };
  researchInterests: string[];
  studentGuidance: {
    prospectiveStudentsNote: string;
    recLetterPolicy: string;
    officeHours: string;
  };
  professionalServices: IProfessionalService[];
  education: IEducation[];
  experience: IExperience[];
  awards: IAward[];
  siteMeta: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  themeConfig?: {
    primaryColor: string;
    paletteColors?: string[];
  };
  updatedAt: Date;
  createdAt: Date;
}

const EducationSchema = new Schema<IEducation>({
  degree: { type: String, required: true },
  field: { type: String, required: true },
  institution: { type: String, required: true },
  passingYear: { type: String, required: true },
  thesisTitle: { type: String, default: '' },
  certificateUrl: { type: String, default: '' },
});

const ExperienceSchema = new Schema<IExperience>({
  position: { type: String, required: true },
  department: { type: String, required: true },
  institution: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  isCurrent: { type: Boolean, default: false },
  institutionUrl: { type: String, default: '' },
  description: { type: String, default: '' },
});

const AwardSchema = new Schema<IAward>({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  year: { type: String, required: true },
  description: { type: String, default: '' },
  awardUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
});

const ProfessionalServiceSchema = new Schema<IProfessionalService>({
  role: { type: String, required: true },
  organizationOrJournal: { type: String, required: true },
  period: { type: String, required: true },
});

const ProfileSchema = new Schema<IProfile>(
  {
    fullName: { type: String, required: true },
    designation: { type: String, required: true, default: 'Professor & Chairman' },
    department: { type: String, required: true, default: 'Computer Science & Engineering' },
    institution: { type: String, required: true, default: 'Bangladesh University' },
    yearsExperience: { type: String, default: '22+ Years' },
    educationSummary: { type: String, default: 'M.Sc., B.Sc. (NTUU) · PhD Study (DUET)' },
    bio: { type: String, default: '' },
    aboutContent: { type: String, default: '' },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    cvFile: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      fileName: { type: String, default: '' },
    },
    stats: {
      totalCitations: { type: Number, default: 0 },
      hIndex: { type: Number, default: 0 },
      i10Index: { type: Number, default: 0 },
      totalPublications: { type: Number, default: 0 },
      grantsFunded: { type: String, default: '' },
    },
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      officeLocation: { type: String, default: '' },
      whatsappNumber: { type: String, default: '' },
      whatsappGreetingText: { type: String, default: 'Hello Professor, I would like to inquire about...' },
      appointmentUrl: { type: String, default: '' },
      institutionalUrl: { type: String, default: '' },
    },
    socialLinks: {
      googleScholar: { type: String, default: '' },
      orcid: { type: String, default: '' },
      researchGate: { type: String, default: '' },
      scopus: { type: String, default: '' },
      dblp: { type: String, default: '' },
      arxiv: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      github: { type: String, default: '' },
      personalWebsite: { type: String, default: '' },
      customLinks: {
        type: [{ name: String, url: String }],
        default: [],
      },
    },
    researchInterests: { type: [String], default: [] },
    studentGuidance: {
      prospectiveStudentsNote: { type: String, default: '' },
      recLetterPolicy: { type: String, default: '' },
      officeHours: { type: String, default: '' },
    },
    professionalServices: { type: [ProfessionalServiceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    awards: { type: [AwardSchema], default: [] },
    siteMeta: {
      title: { type: String, default: 'Professor Portfolio' },
      description: { type: String, default: 'Academic portfolio and research showcase' },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: '' },
    },
    themeConfig: {
      primaryColor: { type: String, default: '#0EA5E9' },
      paletteColors: {
        type: [String],
        default: [
          '#FFA800',
          '#FFB400',
          '#D31A26',
          '#10B981',
          '#0EA5E9',
          '#8B5CF6',
          '#EC4899',
          '#06B6D4',
        ],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
