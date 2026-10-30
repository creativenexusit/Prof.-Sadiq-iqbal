import { connectDB } from '@/lib/mongodb';
import { Profile, IProfile } from '@/models/Profile';
import { Publication, IPublication, PublicationCategory } from '@/models/Publication';
import { AcademicItem, IAcademicItem, AcademicItemCategory } from '@/models/AcademicItem';
import { BlogPost } from '@/models/BlogPost';
import { Faq } from '@/models/Faq';
import {
  initialProfileData,
  initialPublicationsData,
  initialAcademicItemsData,
} from '@/lib/seedData';

export async function getProfile(): Promise<IProfile | typeof initialProfileData> {
  try {
    await connectDB();
    const profile = await Profile.findOne().lean();
    if (profile) return JSON.parse(JSON.stringify(profile)) as unknown as IProfile;
  } catch (err) {
    console.warn('MongoDB connection not ready for getProfile, using initial fallback data.', err);
  }
  return JSON.parse(JSON.stringify(initialProfileData)) as unknown as IProfile;
}

export async function getPublications(params?: {
  category?: PublicationCategory;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<IPublication[]> {
  try {
    await connectDB();
    const query: Record<string, unknown> = { status: 'published' };
    if (params?.category) query.category = params.category;
    if (params?.featuredOnly) query.isFeatured = true;

    let q = Publication.find(query).sort({ year: -1, publicationDate: -1 });
    if (params?.limit) q = q.limit(params.limit);

    const items = await q.lean();
    if (items && items.length > 0) return JSON.parse(JSON.stringify(items)) as unknown as IPublication[];
  } catch (err) {
    console.warn('MongoDB connection not ready for getPublications, using initial fallback data.', err);
  }

  let filtered = [...initialPublicationsData];
  if (params?.category) {
    filtered = filtered.filter((p) => p.category === params.category);
  }
  if (params?.featuredOnly) {
    filtered = filtered.filter((p) => p.isFeatured);
  }
  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }
  return JSON.parse(JSON.stringify(filtered)) as unknown as IPublication[];
}

export async function getPublicationBySlug(
  slug: string
): Promise<IPublication | null> {
  try {
    await connectDB();
    const item = await Publication.findOne({ slug }).lean();
    if (item) return JSON.parse(JSON.stringify(item)) as unknown as IPublication;
  } catch (err) {
    console.warn('MongoDB connection not ready for getPublicationBySlug, using initial fallback data.', err);
  }

  const match = initialPublicationsData.find((p) => p.slug === slug);
  return (match ? JSON.parse(JSON.stringify(match)) : null) as unknown as IPublication | null;
}

export async function getPublicationById(id: string): Promise<IPublication | null> {
  try {
    await connectDB();
    const item = await Publication.findById(id).lean();
    if (item) return JSON.parse(JSON.stringify(item)) as unknown as IPublication;
  } catch (err) {
    // ignore
  }

  const match = initialPublicationsData.find(
    (p) => ('_id' in p && String((p as Record<string, unknown>)._id) === id) || p.slug === id
  );
  return (match ? JSON.parse(JSON.stringify(match)) : null) as unknown as IPublication | null;
}


export async function getAcademicItems(params?: {
  category?: AcademicItemCategory;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<IAcademicItem[]> {
  try {
    await connectDB();
    const query: Record<string, unknown> = { status: 'published' };
    if (params?.category) query.category = params.category;
    if (params?.featuredOnly) query.isFeatured = true;

    let q = AcademicItem.find(query).sort({ order: 1, createdAt: -1 });
    if (params?.limit) q = q.limit(params.limit);

    const items = await q.lean();
    if (items && items.length > 0) return JSON.parse(JSON.stringify(items)) as unknown as IAcademicItem[];
  } catch (err) {
    console.warn('MongoDB connection not ready for getAcademicItems, using initial fallback data.', err);
  }

  let filtered = [...initialAcademicItemsData];
  if (params?.category) {
    filtered = filtered.filter((item) => item.category === params.category);
  }
  if (params?.featuredOnly) {
    filtered = filtered.filter((item) => (item as any).isFeatured);
  }
  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }
  return JSON.parse(JSON.stringify(filtered)) as unknown as IAcademicItem[];
}

export async function getAcademicItemById(id: string): Promise<IAcademicItem | null> {
  try {
    await connectDB();
    const item = await AcademicItem.findById(id).lean();
    if (item) return JSON.parse(JSON.stringify(item)) as unknown as IAcademicItem;
  } catch (err) {
    // ignore
  }

  const match = initialAcademicItemsData.find(
    (it) => ('_id' in it && String((it as Record<string, unknown>)._id) === id) || it.slug === id
  );
  return (match ? JSON.parse(JSON.stringify(match)) : null) as unknown as IAcademicItem | null;
}

export async function getAcademicItemBySlug(slug: string): Promise<IAcademicItem | null> {
  try {
    await connectDB();
    const item = await AcademicItem.findOne({ slug }).lean();
    if (item) return JSON.parse(JSON.stringify(item)) as unknown as IAcademicItem;
  } catch (err) {
    // ignore
  }

  const match = initialAcademicItemsData.find((it) => it.slug === slug);
  return (match ? JSON.parse(JSON.stringify(match)) : null) as unknown as IAcademicItem | null;
}

export interface IBlogPost {
  _id?: string;
  title: string;
  author: string;
  date: string;
  category: string;
  excerpt: string;
  readTime: string;
  slug: string;
  image?: string;
  tags?: string[];
  content?: string[];
  isFeatured?: boolean;
  status?: 'published' | 'draft';
  order?: number;
  createdAt?: string | Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBlogPost(raw: any): IBlogPost {
  const imageUrl =
    typeof raw.image === 'string'
      ? raw.image
      : raw.image?.url || '';

  return {
    _id: raw._id ? String(raw._id) : undefined,
    title: raw.title || '',
    author: raw.author || 'Prof. Sadiq Iqbal',
    date: raw.date || '',
    category: raw.category || 'General',
    excerpt: raw.excerpt || '',
    readTime: raw.readTime || '5 min read',
    slug: raw.slug || '',
    image: imageUrl,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    content: Array.isArray(raw.content)
      ? raw.content
      : typeof raw.content === 'string'
        ? raw.content.split('\n\n').filter(Boolean)
        : [],
    isFeatured: Boolean(raw.isFeatured),
    status: raw.status || 'published',
    order: raw.order ?? 0,
    createdAt: raw.createdAt,
  };
}

export const initialBlogPosts: IBlogPost[] = [
  {
    title: 'Explainable AI in Clinical Healthcare',
    author: 'Prof. Sadiq Iqbal',
    date: 'January 2025',
    category: 'Explainable Artificial Intelligence',
    excerpt:
      'Why opaque black-box machine learning models face clinical resistance in healthcare diagnosis, and how transparent feature optimization and interpretable neural architectures provide verifiable reasoning.',
    readTime: '6 min read',
    slug: 'explainable-ai-clinical-healthcare',
    image: '/contact-sheet/img2.webp',
    tags: ['XAI', 'Deep Learning', 'Healthcare Informatics', 'Clinical AI'],
    content: [
      'In recent years, deep neural networks have achieved remarkable diagnostic accuracy across radiography, pathology, and predictive patient monitoring. However, despite clinical benchmarks frequently rivaling expert physicians, adoption in active hospital wards remains strikingly hesitant. The root cause is the pervasive "black-box" dilemma: when a life-critical decision is recommended by millions of opaque weight matrices, clinicians cannot verify whether the inference is grounded in genuine pathological indicators or spurious statistical artifacts.',
      'Our research explores interpretable-by-design neural frameworks that synthesize local feature attributions with global rule extraction. Rather than treating interpretability as a post-hoc diagnostic overlay (such as standard Grad-CAM or vanilla SHAP values, which frequently succumb to gradient noise), we propose structurally bounded latent spaces where decision boundaries map directly to human-comprehensible biomarkers.',
      'Through clinical validation trials conducted on multimodal medical records, we demonstrated that integrating rule-constrained attention mechanisms reduced diagnostic skepticism by over 74% among attending physicians. More importantly, it uncovered edge-case false positives that conventional black-box ensembles had systematically masked.',
      'As machine learning assumes an increasingly ubiquitous role in primary care and intensive care units, transparent computational reasoning is no longer a philosophical preference—it is a non-negotiable prerequisite for ethical, reliable, and legally sound clinical intelligence.',
    ],
  },
  {
    title: 'Combating Obfuscated Malware: A Multi-Stage Feature Scaling Paradigm',
    author: 'Prof. Sadiq Iqbal',
    date: 'December 2024',
    category: 'Cybersecurity',
    excerpt:
      'An architectural breakdown of how polymorphic binaries camouflage malicious signatures, and how genetic metaheuristics paired with robust feature selection reveal zero-day threats in enterprise networks.',
    readTime: '8 min read',
    slug: 'combating-obfuscated-malware',
    image: '/contact-sheet/img3.webp',
    tags: ['Malware Analysis', 'Genetic Algorithms', 'Network Security', 'Zero-Day Defense'],
    content: [
      'Polymorphic and metamorphic malware represent the pinnacle of adversarial engineering in modern cyber warfare. By dynamically encrypting internal payloads, inserting dead code sequences, reordering registers, and morphing operational codes between execution cycles, these sophisticated binaries effortlessly evade conventional signature-based intrusion detection systems.',
      'To counter these evasion strategies, static heuristic analysis is grossly inadequate. Instead, modern defensive architectures must capture systemic behavioral invariants across the binary execution lifecycle. Our proposed paradigm employs a multi-stage feature scaling architecture that integrates dynamic API call sequence mining with structural entropy tracking and control-flow graph (CFG) topology analysis.',
      'At the core of this pipeline lies a genetic metaheuristic algorithm designed to traverse ultra-high-dimensional feature spaces. By simulating evolutionary pressure across generations of extracted binary attributes, the algorithm eliminates redundant noisy features while accentuating subtle structural anomalies characteristic of unpacked malicious shellcodes.',
      'In empirical benchmarks evaluating thousands of obfuscated zero-day samples across enterprise network honeypots, our multi-stage framework achieved an empirical detection accuracy of 99.4% with a false-alarm rate below 0.08%. These results emphasize that multi-layered structural representations provide the resilience required to withstand automated adversarial malware evolution.',
    ],
  },
  {
    title: 'Distinguishing Synthetic AI Output from Human Web Search Queries',
    author: 'Prof. Sadiq Iqbal',
    date: 'October 2024',
    category: 'Machine Learning',
    excerpt:
      'Examining forensic statistical linguistic markers and supervised classifiers to reliably identify machine-generated text from large language models.',
    readTime: '5 min read',
    slug: 'distinguishing-synthetic-ai-output',
    image: '/contact-sheet/img4.webp',
    tags: ['NLP', 'Synthetic Content', 'Linguistic Forensic', 'LLM Classifiers'],
    content: [
      'The exponential proliferation of Large Language Models (LLMs) has fundamentally blurred the boundary between human-written and synthetically generated text across academic repositories, web search engines, and communication channels. Detecting machine-authored prose is critical for preventing automated spam cascades, safeguarding academic integrity, and defending digital indexing systems.',
      'Our investigation examined forensic statistical linguistic markers—specifically token probability curvature, cross-entropy variance, and semantic burstiness across diverse generative architectures including GPT-4, Llama, and Gemini.',
      'While humans exhibit dramatic spikes in syntactic variation and stylistic idiosyncrasies, generative decoders inherently maximize token likelihood trajectories, creating statistically detectable homogeneity across extended lexical passages.',
      'By training ensemble classifiers on high-frequency linguistic n-grams paired with token rank decay distributions, our classifier achieved robust differentiation across both formal academic prose and unstructured informal query corpora.',
    ],
  },
  {
    title: 'Distributed Telemedicine Architectures for Low-Resource Healthcare Infrastructure',
    author: 'Prof. Sadiq Iqbal',
    date: 'August 2024',
    category: 'Cloud & Distributed Systems',
    excerpt:
      'Engineering resilient, low-latency distributed databases to manage electronic patient records securely across remote clinics and diagnostic IoT sensors.',
    readTime: '7 min read',
    slug: 'distributed-telemedicine-architectures',
    image: '/contact-sheet/img5.webp',
    tags: ['Telemedicine', 'Distributed Systems', 'Edge Computing', 'Healthcare IoT'],
    content: [
      'Healthcare delivery in remote and underserved regional facilities suffers from severe bandwidth constraints, intermittent grid connectivity, and hardware latency. Deploying centralized, monolithic Electronic Health Record (EHR) platforms in these environments invariably results in operational failure during connectivity outages.',
      'To solve this systemic bottleneck, our laboratory architected a peer-to-peer federated edge telemedicine framework. By embedding lightweight, conflict-free replicated data types (CRDTs) onto regional clinic gateways, diagnostic sensor nodes can record clinical observations, electrocardiograms, and vital telemetry completely offline.',
      'When satellite or cellular uplink windows become available, the distributed synchronization protocol resolves replication conflicts deterministically with zero data loss or clinical record divergence.',
      'Field trials in remote diagnostic camps corroborated that this federated edge paradigm guarantees 99.99% local operational uptime, ensuring that vital patient care is never held hostage by fragile telecommunication links.',
    ],
  },
];

export async function getBlogPosts(limit = 20): Promise<IBlogPost[]> {
  try {
    await connectDB();
    const posts = await BlogPost.find({ status: { $ne: 'draft' } })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    if (posts && posts.length > 0) {
      return posts.map(normalizeBlogPost);
    }

    // Attempt to seed initial posts to DB if empty
    try {
      await BlogPost.insertMany(
        initialBlogPosts.map((p, idx) => ({
          ...p,
          image: { url: p.image || '' },
          order: idx + 1,
        }))
      );
      const seeded = await BlogPost.find({ status: { $ne: 'draft' } })
        .sort({ order: 1, createdAt: -1 })
        .limit(limit)
        .lean();
      if (seeded && seeded.length > 0) {
        return seeded.map(normalizeBlogPost);
      }
    } catch {
      // ignore insert collisions
    }
  } catch (err) {
    console.warn('MongoDB connection not ready for getBlogPosts, using fallback data.', err);
  }
  return initialBlogPosts.slice(0, limit);
}

export async function getBlogPostBySlug(slug: string): Promise<IBlogPost | null> {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug }).lean();
    if (post) {
      return normalizeBlogPost(post);
    }
  } catch (err) {
    console.warn('MongoDB connection not ready for getBlogPostBySlug, using fallback data.', err);
  }
  const match = initialBlogPosts.find((p) => p.slug === slug);
  return match || null;
}

export async function getBlogPostById(id: string): Promise<IBlogPost | null> {
  try {
    await connectDB();
    const post = await BlogPost.findById(id).lean();
    if (post) {
      return normalizeBlogPost(post);
    }
  } catch {
    // fallback
  }
  return null;
}

export interface IAcademicEvent {
  id: string;
  title: string;
  type: string;
  theme?: string;
  date: string;
  day: string;
  month: string;
  year: string;
  time?: string;
  venue: string;
  organizer?: string;
  description: string;
  isUpcoming: boolean;
}

export const initialEventsData: IAcademicEvent[] = [
  {
    id: 'event-01',
    title: 'Seminar on Big Data Analytics: Harnessing Data for Smarter Decisions',
    type: 'Seminar',
    theme: 'Harnessing Data for Smarter Decisions',
    date: 'September 27, 2025',
    day: '27',
    month: 'SEP',
    year: '2025',
    time: '10:00 AM',
    venue: 'Main Conference Hall, University Campus, Dhaka',
    organizer: 'Department of Computer Science & Engineering',
    description:
      'A comprehensive academic seminar focused on big data analytics, distributed data pipelines, and data-driven computational strategies for intelligent decision-making.',
    isUpcoming: true,
  },
  {
    id: 'event-02',
    title: 'Workshop on Cybersecurity Trends: Protecting Data & Privacy in the Digital Age',
    type: 'Workshop',
    theme: 'Protecting Data and Privacy in the Digital Age',
    date: 'October 7, 2025',
    day: '07',
    month: 'OCT',
    year: '2025',
    time: '2:30 PM',
    venue: 'Computer Science Department, Room 205, Bangladesh University',
    organizer: 'Department of CSE, Bangladesh University',
    description:
      'Hands-on academic workshop covering modern cybersecurity paradigms, digital identity defense, and proactive digital privacy architectures.',
    isUpcoming: true,
  },
  {
    id: 'event-03',
    title: 'International Conference on Artificial Intelligence: Future of Intelligent Systems',
    type: 'Conference',
    theme: 'Exploring the Future of Intelligent Systems and Machine Learning',
    date: 'October 27, 2025',
    day: '27',
    month: 'OCT',
    year: '2025',
    time: '9:00 AM',
    venue: 'Grand Convention Center, Dhaka',
    organizer: 'International Academic & Research Consortium',
    description:
      'Keynote discussion exploring the frontier of machine learning, explainable neural networks, and scalable autonomous computing.',
    isUpcoming: true,
  },
];

export async function getAcademicEvents(limit = 3): Promise<IAcademicEvent[]> {
  return initialEventsData.slice(0, limit);
}

export async function getFaqsPublic(category?: string) {
  try {
    await connectDB();
    const query: Record<string, unknown> = { status: { $ne: 'draft' } };
    if (category && category !== 'ALL') query.category = category;
    const faqs = await Faq.find(query).sort({ category: 1, order: 1, createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(faqs));
  } catch (err) {
    console.warn('MongoDB connection not ready for getFaqsPublic, using empty fallback.', err);
    return [];
  }
}


