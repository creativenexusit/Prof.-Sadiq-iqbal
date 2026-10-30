'use client';

import { useState } from 'react';
import { updateProfileAdmin, uploadMediaAdmin } from '@/app/actions/adminCrud';
import { initialProfileData } from '@/lib/seedData';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Trophy,
  Share2,
  Plus,
  Trash2,
  Edit3,
  Check,
  Calendar,
  Building,
  Image as ImageIcon,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

/** Clean and extract direct image URLs if user pasted a Google Search result link */
function extractDirectImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  try {
    if (trimmed.includes('google.') && (trimmed.includes('imgurl=') || trimmed.includes('url='))) {
      const parsed = new URL(trimmed);
      const direct = parsed.searchParams.get('imgurl') || parsed.searchParams.get('url');
      if (direct) {
        return decodeURIComponent(direct);
      }
    }
  } catch {
    // ignore
  }
  return trimmed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProfileData = Record<string, any>;

interface ProfileFormProps {
  initialProfile: ProfileData;
}

type TabKey = 'personal' | 'education' | 'experience' | 'professional' | 'awards' | 'contact';

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  // Ensure default data fallback if DB is empty or disconnected
  const safeProfile = {
    ...initialProfileData,
    ...initialProfile,
    designation: initialProfile?.designation || initialProfileData.designation,
    department: initialProfile?.department || initialProfileData.department,
    institution: initialProfile?.institution || initialProfileData.institution,
    yearsExperience: initialProfile?.yearsExperience || initialProfileData.yearsExperience || '22+ Years',
    educationSummary: initialProfile?.educationSummary || initialProfileData.educationSummary || 'M.Sc., B.Sc. (NTUU) · PhD Study (DUET)',
    education:
      initialProfile?.education && initialProfile.education.length > 0
        ? initialProfile.education
        : initialProfileData.education,
    experience:
      initialProfile?.experience && initialProfile.experience.length > 0
        ? initialProfile.experience
        : initialProfileData.experience,
    awards:
      initialProfile?.awards && initialProfile.awards.length > 0
        ? initialProfile.awards
        : initialProfileData.awards,
    contact: {
      ...initialProfileData.contact,
      ...(initialProfile?.contact || {}),
      email: initialProfile?.contact?.email || initialProfileData.contact?.email || 'sadiq.iqbal@bu.edu.bd',
      phone: initialProfile?.contact?.phone || initialProfileData.contact?.phone || '01755559312',
      whatsappNumber: initialProfile?.contact?.whatsappNumber || initialProfileData.contact?.whatsappNumber || '01755559312',
      officeLocation: initialProfile?.contact?.officeLocation || initialProfileData.contact?.officeLocation || 'Department of Computer Science & Engineering, Bangladesh University, Dhaka, Bangladesh',
    },
    socialLinks: {
      ...initialProfileData.socialLinks,
      ...(initialProfile?.socialLinks || {}),
      customLinks: initialProfile?.socialLinks?.customLinks || [],
    },
  };

  const [profile, setProfile] = useState<ProfileData>(safeProfile);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingAwardImg, setUploadingAwardImg] = useState<number | null>(null);

  // Edit mode tracking for clean View / Edit UX
  const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);
  const [editingAwdIndex, setEditingAwdIndex] = useState<number | null>(null);

  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // Avatar Upload
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'academic_portfolio/avatar');

    try {
      const res = await uploadMediaAdmin(fd);
      if (res.success && res.url) {
        setProfile((prev) => ({
          ...prev,
          avatar: { url: res.url, publicId: res.publicId || '' },
        }));
        setStatus({ type: 'success', message: 'Profile photo updated successfully!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Photo upload failed' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Photo upload error' });
    } finally {
      setUploadingAvatar(false);
    }
  }

  // CV Upload
  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCv(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'academic_portfolio/documents');

    try {
      const res = await uploadMediaAdmin(fd);
      if (res.success && res.url) {
        setProfile((prev) => ({
          ...prev,
          cvFile: { url: res.url, publicId: res.publicId || '', fileName: file.name },
        }));
        setStatus({ type: 'success', message: 'CV updated successfully!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'CV upload failed' });
      }
    } catch {
      setStatus({ type: 'error', message: 'CV upload error' });
    } finally {
      setUploadingCv(false);
    }
  }

  // Award Image Upload
  async function handleAwardImageUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAwardImg(index);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'academic_portfolio/items');

    try {
      const res = await uploadMediaAdmin(fd);
      if (res.success && res.url) {
        setProfile((prev) => {
          const updated = [...(prev.awards || [])];
          updated[index] = { ...updated[index], imageUrl: res.url };
          return { ...prev, awards: updated };
        });
        setStatus({ type: 'success', message: 'Award image uploaded!' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Failed to upload award image' });
    } finally {
      setUploadingAwardImg(null);
    }
  }

  // Education Helpers
  const addEducation = () => {
    setProfile((prev) => {
      const current = prev.education || [];
      const newIndex = current.length;
      setEditingEduIndex(newIndex);
      return {
        ...prev,
        education: [
          ...current,
          { degree: '', field: '', institution: '', passingYear: '', thesisTitle: '' },
        ],
      };
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setProfile((prev) => {
      const updated = [...(prev.education || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index),
    }));
    if (editingEduIndex === index) setEditingEduIndex(null);
  };

  const moveEducation = (index: number, direction: 'up' | 'down') => {
    setProfile((prev) => {
      const list = [...(prev.education || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, education: list };
    });
    setEditingEduIndex(null);
  };

  // Experience Helpers
  const addExperience = () => {
    setProfile((prev) => {
      const current = prev.experience || [];
      const newIndex = current.length;
      setEditingExpIndex(newIndex);
      return {
        ...prev,
        experience: [
          ...current,
          { position: '', department: '', institution: '', startDate: '', endDate: '', isCurrent: false, description: '' },
        ],
      };
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setProfile((prev) => {
      const updated = [...(prev.experience || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_: any, i: number) => i !== index),
    }));
    if (editingExpIndex === index) setEditingExpIndex(null);
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    setProfile((prev) => {
      const list = [...(prev.experience || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, experience: list };
    });
    setEditingExpIndex(null);
  };

  // Awards Helpers
  const addAward = () => {
    setProfile((prev) => {
      const current = prev.awards || [];
      const newIndex = current.length;
      setEditingAwdIndex(newIndex);
      return {
        ...prev,
        awards: [
          ...current,
          { title: '', organization: '', year: '', description: '', imageUrl: '' },
        ],
      };
    });
  };

  const updateAward = (index: number, field: string, value: string) => {
    const finalVal = field === 'imageUrl' ? extractDirectImageUrl(value) : value;
    setProfile((prev) => {
      const updated = [...(prev.awards || [])];
      updated[index] = { ...updated[index], [field]: finalVal };
      return { ...prev, awards: updated };
    });
  };

  const removeAward = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      awards: prev.awards.filter((_: any, i: number) => i !== index),
    }));
    if (editingAwdIndex === index) setEditingAwdIndex(null);
  };

  // Custom Social Links Helpers
  const addCustomSocialLink = () => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        customLinks: [
          ...(prev.socialLinks?.customLinks || []),
          { name: '', url: '' },
        ],
      },
    }));
  };

  const updateCustomSocialLink = (index: number, field: string, value: string) => {
    setProfile((prev) => {
      const custom = [...(prev.socialLinks?.customLinks || [])];
      custom[index] = { ...custom[index], [field]: value };
      return {
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          customLinks: custom,
        },
      };
    });
  };

  const removeCustomSocialLink = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        customLinks: prev.socialLinks?.customLinks?.filter((_: any, i: number) => i !== index) || [],
      },
    }));
  };

  // Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await updateProfileAdmin(profile as Record<string, unknown>);
      if (res.success) {
        setStatus({ type: 'success', message: res.message || 'Profile saved and live across website!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Database connection error' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'personal', label: 'Personal Info', icon: User },
    { key: 'education', label: 'Education', icon: GraduationCap },
    { key: 'experience', label: 'Experience', icon: Briefcase },
    { key: 'professional', label: 'Research & Expertise', icon: Sparkles },
    { key: 'awards', label: 'Awards & Honors', icon: Trophy },
    { key: 'contact', label: 'Contact & Social', icon: Share2 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* Status Notifications */}
      {status.type === 'success' && (
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span className="truncate">{status.message}</span>
        </div>
      )}

      {status.type === 'error' && (
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
          <AlertCircle size={15} className="text-red-400 shrink-0" />
          <span className="truncate">{status.message}</span>
        </div>
      )}

      {/* Responsive Tab Bar with Dedicated Experience Tab */}
      <div className="flex items-center gap-1 sm:gap-1.5 pb-1 overflow-x-auto no-scrollbar border-b border-[#1F1F24]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              title={tab.label}
              aria-label={tab.label}
              className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 min-h-[38px] sm:min-h-[42px] ${isActive
                  ? 'bg-white text-black shadow-md font-black'
                  : 'bg-[#141418] text-neutral-400 hover:text-white hover:bg-[#1A1A20] border border-[#222226]'
                }`}
            >
              <Icon size={15} className="shrink-0" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════
          TAB 1: PERSONAL INFORMATION
      ═══════════════════════════════════════════════ */}
      {activeTab === 'personal' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3 sm:space-y-4">
            {/* Avatar & Basic Details Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#1F1F24]">
              {/* Photo Box */}
              <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden border border-[#282830] bg-[#1A1A20] shadow-md shrink-0">
                  {profile.avatar?.url ? (
                    <Image
                      src={profile.avatar.url}
                      alt={profile.fullName || 'Photo'}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-neutral-500 font-mono">
                      No Photo
                    </div>
                  )}
                </div>

                <label className="cursor-pointer inline-flex items-center justify-center gap-1 w-24 sm:w-28 py-1 sm:py-1.5 rounded-lg border border-[#2B2B33] bg-[#1A1A20] text-neutral-300 hover:text-white text-[11px] sm:text-xs font-semibold transition min-h-[30px] sm:min-h-[36px]">
                  {uploadingAvatar ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Upload size={11} />
                  )}
                  <span>{uploadingAvatar ? 'Uploading' : 'Change'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              {/* Identity Inputs */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.fullName || ''}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder="Prof. Sadiq Iqbal"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.designation || ''}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    placeholder="Professor & Chairman"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={profile.department || ''}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={profile.institution || ''}
                    onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                    placeholder="Bangladesh University"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={profile.yearsExperience || profile.stats?.yearsExperience || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        yearsExperience: e.target.value,
                        stats: { ...(profile.stats || {}), yearsExperience: e.target.value },
                      })
                    }
                    placeholder="22+ Years"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                    Education Summary (About Page)
                  </label>
                  <input
                    type="text"
                    value={profile.educationSummary || ''}
                    onChange={(e) => setProfile({ ...profile, educationSummary: e.target.value })}
                    placeholder="M.Sc., B.Sc. (NTUU) · PhD Study (DUET)"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                </div>
              </div>
            </div>

            {/* Bios: Short Bio & Long Bio */}
            <div className="space-y-2.5 sm:space-y-3.5">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                  Short Bio (Hero)
                </label>
                <textarea
                  rows={2}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Academic leader and researcher..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)] resize-y leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                  Long Bio (About)
                </label>
                <textarea
                  rows={4}
                  value={profile.aboutContent || ''}
                  onChange={(e) => setProfile({ ...profile, aboutContent: e.target.value })}
                  placeholder="Detailed academic biography..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)] resize-y leading-relaxed"
                />
              </div>
            </div>

            {/* CV Upload */}
            <div className="pt-2.5 sm:pt-3 border-t border-[#1F1F24] flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1A1A20] text-neutral-400 flex items-center justify-center shrink-0">
                  <FileText size={14} />
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-semibold text-white block truncate">
                    CV (PDF)
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-neutral-400 truncate block font-mono">
                    {profile.cvFile?.fileName || 'Official CV'}
                  </span>
                </div>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#2B2B33] bg-[#1A1A20] text-neutral-300 hover:text-white text-[11px] sm:text-xs font-semibold transition shrink-0 min-h-[30px] sm:min-h-[34px]">
                {uploadingCv ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                <span>{uploadingCv ? 'Uploading' : 'Upload'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCvUpload}
                  className="hidden"
                  disabled={uploadingCv}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 2: EDUCATIONAL INFORMATION
          (View by default, click Edit to open inputs)
      ═══════════════════════════════════════════════ */}
      {activeTab === 'education' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Education
                </span>
                <span className="text-[10px] sm:text-[11px] text-neutral-400">
                  {profile.education?.length || 0} degrees listed
                </span>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-black font-bold text-xs uppercase tracking-wider min-h-[30px] sm:min-h-[34px]"
                style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
              >
                <Plus size={12} strokeWidth={3} />
                <span className="hidden sm:inline">Add Degree</span>
                <span className="sm:hidden inline">Add</span>
              </button>
            </div>

            {/* List of Education (Click Edit to expand inputs) */}
            <div className="space-y-2">
              {(profile.education || []).map((edu: any, index: number) => {
                const isEditing = editingEduIndex === index;

                return (
                  <div
                    key={index}
                    className="p-2.5 sm:p-3.5 rounded-xl bg-[#1A1A20] border border-[#282830] transition-colors"
                  >
                    {/* View Mode (Clean Text) */}
                    {!isEditing ? (
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-mono font-bold text-[var(--theme-color,#FFA800)] shrink-0">
                              #{index + 1}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[170px] sm:max-w-none">
                              {edu.degree || 'Untitled Degree'}
                            </h4>
                            {edu.passingYear && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#141418] text-neutral-400 border border-[#25252B] shrink-0">
                                {edu.passingYear}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-300 truncate">
                            {edu.field ? `${edu.field} — ` : ''}{edu.institution || 'Institution'}
                          </p>
                          {edu.thesisTitle && (
                            <p className="text-[10px] sm:text-[11px] text-neutral-400 italic line-clamp-1">
                              {edu.thesisTitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveEducation(index, 'up')}
                            disabled={index === 0}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed min-h-[28px] sm:min-h-[30px] px-1.5"
                            title="Move Up"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveEducation(index, 'down')}
                            disabled={index === (profile.education?.length || 0) - 1}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed min-h-[28px] sm:min-h-[30px] px-1.5"
                            title="Move Down"
                          >
                            <ChevronDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingEduIndex(index)}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-300 hover:text-white text-[11px] flex items-center gap-1 min-h-[28px] sm:min-h-[30px] px-2"
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-400 hover:text-red-400 min-h-[28px] sm:min-h-[30px] px-1.5"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Edit Mode (Input Fields) */
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-[#25252B]">
                          <span className="text-xs font-bold text-white font-mono">
                            Editing Degree #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingEduIndex(null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25252E] text-white text-xs font-semibold hover:bg-neutral-700 min-h-[26px]"
                          >
                            <Check size={11} />
                            <span>Done</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Degree
                            </label>
                            <input
                              type="text"
                              value={edu.degree || ''}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              placeholder="M.Sc. in Computer Science"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Field of Study
                            </label>
                            <input
                              type="text"
                              value={edu.field || ''}
                              onChange={(e) => updateEducation(index, 'field', e.target.value)}
                              placeholder="Computer Science"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Institution
                            </label>
                            <input
                              type="text"
                              value={edu.institution || ''}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              placeholder="University name"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Year / Period
                            </label>
                            <input
                              type="text"
                              value={edu.passingYear || ''}
                              onChange={(e) => updateEducation(index, 'passingYear', e.target.value)}
                              placeholder="2002 or Ongoing"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Thesis / Distinction
                            </label>
                            <input
                              type="text"
                              value={edu.thesisTitle || ''}
                              onChange={(e) => updateEducation(index, 'thesisTitle', e.target.value)}
                              placeholder="Academic thesis or honors"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 3: EXPERIENCE (DEDICATED TAB)
          (Positions added here directly appear on /experience)
      ═══════════════════════════════════════════════ */}
      {activeTab === 'experience' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Work Experience &amp; Academic Leadership
                </span>
                <span className="text-[10px] sm:text-[11px] text-neutral-400">
                  {profile.experience?.length || 0} positions recorded (live on /experience page)
                </span>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-black font-bold text-xs uppercase tracking-wider min-h-[30px] sm:min-h-[34px]"
                style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
              >
                <Plus size={12} strokeWidth={3} />
                <span className="hidden sm:inline">Add Position</span>
                <span className="sm:hidden inline">Add</span>
              </button>
            </div>

            {/* List of Experience */}
            <div className="space-y-2">
              {(profile.experience || []).map((exp: any, index: number) => {
                const isEditing = editingExpIndex === index;

                return (
                  <div
                    key={index}
                    className="p-2.5 sm:p-3.5 rounded-xl bg-[#1A1A20] border border-[#282830] transition-colors"
                  >
                    {!isEditing ? (
                      /* View Mode */
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-mono font-bold text-[var(--theme-color,#FFA800)] shrink-0">
                              #{index + 1}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[170px] sm:max-w-none">
                              {exp.position || 'Untitled Position'}
                            </h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#141418] text-neutral-400 border border-[#25252B] shrink-0">
                              {exp.startDate ? `${exp.startDate} – ${exp.isCurrent ? 'Present' : exp.endDate || 'Present'}` : 'Timeline'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 truncate">
                            {exp.department ? `${exp.department}, ` : ''}{exp.institution || 'Organization'}
                          </p>
                          {exp.description && (
                            <p className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-1">
                              {exp.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveExperience(index, 'up')}
                            disabled={index === 0}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed min-h-[28px] sm:min-h-[30px] px-1.5"
                            title="Move Up"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveExperience(index, 'down')}
                            disabled={index === (profile.experience?.length || 0) - 1}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed min-h-[28px] sm:min-h-[30px] px-1.5"
                            title="Move Down"
                          >
                            <ChevronDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingExpIndex(index)}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-300 hover:text-white text-[11px] flex items-center gap-1 min-h-[28px] sm:min-h-[30px] px-2"
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-400 hover:text-red-400 min-h-[28px] sm:min-h-[30px] px-1.5"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Edit Mode */
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-[#25252B]">
                          <span className="text-xs font-bold text-white font-mono">
                            Editing Role #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingExpIndex(null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25252E] text-white text-xs font-semibold hover:bg-neutral-700 min-h-[26px]"
                          >
                            <Check size={11} />
                            <span>Done</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Role / Position
                            </label>
                            <input
                              type="text"
                              value={exp.position || ''}
                              onChange={(e) => updateExperience(index, 'position', e.target.value)}
                              placeholder="Professor & Chairman"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Department
                            </label>
                            <input
                              type="text"
                              value={exp.department || ''}
                              onChange={(e) => updateExperience(index, 'department', e.target.value)}
                              placeholder="Dept. of CSE"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Institution
                            </label>
                            <input
                              type="text"
                              value={exp.institution || ''}
                              onChange={(e) => updateExperience(index, 'institution', e.target.value)}
                              placeholder="Bangladesh University"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                                Start Date
                              </label>
                              <input
                                type="text"
                                value={exp.startDate || ''}
                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                placeholder="Nov 2025"
                                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                                End Date
                              </label>
                              <input
                                type="text"
                                value={exp.isCurrent ? 'Present' : exp.endDate || ''}
                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                disabled={exp.isCurrent}
                                placeholder="Present"
                                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white disabled:opacity-50"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Responsibilities
                            </label>
                            <textarea
                              rows={2}
                              value={exp.description || ''}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              placeholder="Departmental leadership and teaching..."
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Research Interests Tags */}
            <div className="pt-2.5 sm:pt-3 border-t border-[#1F1F24]">
              <label className="block text-[11px] sm:text-xs font-semibold text-neutral-300 mb-1">
                Research Interests (comma-separated)
              </label>
              <input
                type="text"
                value={
                  Array.isArray(profile.researchInterests)
                    ? profile.researchInterests.join(', ')
                    : profile.researchInterests || ''
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    researchInterests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Machine Learning, Explainable AI, Network Security"
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 4: ACHIEVEMENTS & AWARDS (With Image Upload)
          (View by default, click Edit to open inputs)
      ═══════════════════════════════════════════════ */}
      {activeTab === 'awards' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Awards &amp; Honors
                </span>
                <span className="text-[10px] sm:text-[11px] text-neutral-400">
                  {profile.awards?.length || 0} entries recorded
                </span>
              </div>
              <button
                type="button"
                onClick={addAward}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-black font-bold text-xs uppercase tracking-wider min-h-[30px] sm:min-h-[34px]"
                style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
              >
                <Plus size={12} strokeWidth={3} />
                <span className="hidden sm:inline">Add Award</span>
                <span className="sm:hidden inline">Add</span>
              </button>
            </div>

            {/* List of Awards */}
            <div className="space-y-2">
              {(profile.awards || []).map((awd: any, index: number) => {
                const isEditing = editingAwdIndex === index;

                return (
                  <div
                    key={index}
                    className="p-2.5 sm:p-3.5 rounded-xl bg-[#1A1A20] border border-[#282830] transition-colors"
                  >
                    {!isEditing ? (
                      /* View Mode */
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {awd.imageUrl && (
                            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-[#282830] bg-[#141418] shrink-0 mt-0.5">
                              <Image
                                src={awd.imageUrl}
                                alt={awd.title || 'Award'}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-mono font-bold text-[var(--theme-color,#FFA800)] shrink-0">
                                #{index + 1}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-none">
                                {awd.title || 'Untitled Award'}
                              </h4>
                              {awd.year && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#141418] text-neutral-400 border border-[#25252B] shrink-0">
                                  {awd.year}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-300 truncate">
                              {awd.organization || 'Issuing Organization'}
                            </p>
                            {awd.description && (
                              <p className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-1">
                                {awd.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingAwdIndex(index)}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-300 hover:text-white text-[11px] flex items-center gap-1 min-h-[28px] sm:min-h-[30px] px-2"
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAward(index)}
                            className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-400 hover:text-red-400 min-h-[28px] sm:min-h-[30px] px-1.5"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Edit Mode (with Image Upload) */
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-[#25252B]">
                          <span className="text-xs font-bold text-white font-mono">
                            Editing Award #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingAwdIndex(null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25252E] text-white text-xs font-semibold hover:bg-neutral-700 min-h-[26px]"
                          >
                            <Check size={11} />
                            <span>Done</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Award Title
                            </label>
                            <input
                              type="text"
                              value={awd.title || ''}
                              onChange={(e) => updateAward(index, 'title', e.target.value)}
                              placeholder="Academic Excellence Award"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Year
                            </label>
                            <input
                              type="text"
                              value={awd.year || ''}
                              onChange={(e) => updateAward(index, 'year', e.target.value)}
                              placeholder="2023"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Organization
                            </label>
                            <input
                              type="text"
                              value={awd.organization || ''}
                              onChange={(e) => updateAward(index, 'organization', e.target.value)}
                              placeholder="Issuing institution"
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                            />
                          </div>

                          {/* Award Image Upload or URL */}
                          <div className="sm:col-span-3 p-2.5 rounded-lg bg-[#141418] border border-[#25252B] space-y-2">
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300">
                              Award Image / Certificate
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                {awd.imageUrl && (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#2B2B33] bg-[#0E0E10] shrink-0">
                                    <Image
                                      src={awd.imageUrl}
                                      alt="Preview"
                                      fill
                                      unoptimized
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2B2B33] bg-[#1E1E24] text-neutral-300 hover:text-white text-xs font-semibold transition min-h-[32px]">
                                  {uploadingAwardImg === index ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : (
                                    <Upload size={11} />
                                  )}
                                  <span>{uploadingAwardImg === index ? 'Uploading' : 'Upload Image'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleAwardImageUpload(index, e)}
                                    className="hidden"
                                    disabled={uploadingAwardImg === index}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                value={awd.imageUrl || ''}
                                onChange={(e) => updateAward(index, 'imageUrl', e.target.value)}
                                placeholder="Or image URL..."
                                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white min-h-[32px]"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={awd.description || ''}
                              onChange={(e) => updateAward(index, 'description', e.target.value)}
                              placeholder="Citation details..."
                              className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 5: CONTACT & SOCIAL MEDIA LINKS
          (Facebook, Instagram, X + Dynamic Custom Links)
      ═══════════════════════════════════════════════ */}
      {activeTab === 'contact' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3 sm:space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block pb-2 border-b border-[#1F1F24]">
              Direct Contact
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.contact?.email || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, email: e.target.value },
                    })
                  }
                  placeholder="sadiq.iqbal@bu.edu.bd"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={profile.contact?.phone || profile.contact?.whatsappNumber || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: {
                        ...profile.contact,
                        phone: e.target.value,
                        whatsappNumber: e.target.value,
                      },
                    })
                  }
                  placeholder="01755559312"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  Location (Office / Department)
                </label>
                <input
                  type="text"
                  value={profile.contact?.officeLocation || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, officeLocation: e.target.value },
                    })
                  }
                  placeholder="Department of Computer Science & Engineering, Bangladesh University, Dhaka, Bangladesh"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  Appointment Link
                </label>
                <input
                  type="text"
                  value={profile.contact?.appointmentUrl || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact: { ...profile.contact, appointmentUrl: e.target.value },
                    })
                  }
                  placeholder="https://calendly.com/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>
            </div>

            {/* Popular Social Links (Facebook, Instagram, X, LinkedIn, etc.) */}
            <span className="text-xs font-bold text-white uppercase tracking-wider block pt-2.5 sm:pt-4 pb-2 border-b border-[#1F1F24]">
              Social Channels
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  Facebook
                </label>
                <input
                  type="text"
                  value={profile.socialLinks?.facebook || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={profile.socialLinks?.instagram || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  X (Twitter)
                </label>
                <input
                  type="text"
                  value={profile.socialLinks?.twitter || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={profile.socialLinks?.linkedin || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  Google Scholar
                </label>
                <input
                  type="text"
                  value={profile.socialLinks?.googleScholar || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, googleScholar: e.target.value },
                    })
                  }
                  placeholder="https://scholar.google.com/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  GitHub
                </label>
                <input
                  type="text"
                  value={profile.socialLinks?.github || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  ResearchGate
                </label>
                <input
                  type="text"
                  value={profile.socialLinks?.researchGate || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, researchGate: e.target.value },
                    })
                  }
                  placeholder="https://researchgate.net/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-300 mb-1">
                  ORCID
                </label>
                <input
                  type="text"
                  value={profile.socialLinks?.orcid || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, orcid: e.target.value },
                    })
                  }
                  placeholder="https://orcid.org/..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                />
              </div>
            </div>

            {/* Dynamic Custom Social Links */}
            <div className="pt-2.5 sm:pt-4 border-t border-[#1F1F24] space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Custom Links
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-neutral-400">
                    YouTube, Medium, Threads, blog, etc.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addCustomSocialLink}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-black font-bold text-xs uppercase tracking-wider min-h-[30px] sm:min-h-[34px]"
                  style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
                >
                  <Plus size={12} strokeWidth={3} />
                  <span className="hidden sm:inline">Add Link</span>
                  <span className="sm:hidden inline">Add</span>
                </button>
              </div>

              <div className="space-y-2">
                {(profile.socialLinks?.customLinks || []).map((link: any, index: number) => (
                  <div
                    key={index}
                    className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] space-y-1.5 sm:space-y-0 sm:flex sm:items-center sm:gap-2"
                  >
                    <div className="flex items-center gap-1.5 sm:contents">
                      <input
                        type="text"
                        value={link.name || ''}
                        onChange={(e) => updateCustomSocialLink(index, 'name', e.target.value)}
                        placeholder="Platform (e.g. YouTube)"
                        className="flex-1 sm:w-40 px-2.5 py-1.5 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomSocialLink(index)}
                        className="p-1 sm:p-1.5 rounded-lg bg-[#141418] border border-[#2B2B33] text-neutral-400 hover:text-red-400 min-h-[28px] sm:min-h-[32px] px-2 sm:order-last shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={link.url || ''}
                      onChange={(e) => updateCustomSocialLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full sm:flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#141418] border border-[#2B2B33] text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Save Action Bar (Single line on mobile & desktop) */}
      <div className="sticky bottom-2.5 sm:bottom-4 z-20 pt-1">
        <div className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#141418]/95 backdrop-blur-md border border-[#2B2B33] shadow-2xl flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--theme-color, #FFA800)' }} />
            <span className="text-[11px] sm:text-xs text-neutral-400 font-mono truncate">
              Live sync
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 hover:brightness-110 shrink-0 min-h-[34px] sm:min-h-[38px]"
            style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin text-black shrink-0" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={13} className="shrink-0" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
