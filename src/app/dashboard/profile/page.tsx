'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  User, Github, Linkedin, FileText, Code2, Globe,
  Save, ExternalLink, CheckCircle, Loader2, Download
} from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { useApi, useMutation } from '@/hooks/useApi';
import { userApi } from '@/services/api';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';

const LANGUAGES = ['C++', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Kotlin', 'C#'];

function InputField({
  label, value, onChange, placeholder, type = 'text', prefix
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <div className={cn('flex items-center border border-border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-brand-500')}>
        {prefix && (
          <span className="px-3 text-xs text-muted-foreground bg-muted border-r border-border h-full flex items-center py-2">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm bg-background focus:outline-none"
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const setStoreUser = useUserStore((s) => s.setUser);

  const { data: userData, loading, refetch } = useApi(() => userApi.getMe(), []);

  const [form, setForm] = useState({
    name: '',
    college: '',
    branch: '',
    country: '',
    githubUrl: '',
    linkedinUrl: '',
    bio: '',
    codeforcesHandle: '',
    leetcodeUsername: '',
    favoriteLanguages: [] as string[],
  });
  const [saveMsg, setSaveMsg] = useState('');

  // Pre-fill from Clerk data immediately (before backend responds)
  useEffect(() => {
    if (clerkUser && !form.name) {
      setForm((f) => ({ ...f, name: clerkUser.fullName ?? '' }));
    }
  }, [clerkUser]);

  // Once backend data loads, overwrite with saved values
  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name ?? clerkUser?.fullName ?? '',
        college: userData.college ?? '',
        branch: userData.branch ?? '',
        country: userData.country ?? '',
        githubUrl: userData.githubUrl ?? '',
        linkedinUrl: userData.linkedinUrl ?? '',
        bio: userData.bio ?? '',
        codeforcesHandle: userData.codeforcesHandle ?? '',
        leetcodeUsername: userData.leetcodeUsername ?? '',
        favoriteLanguages: userData.favoriteLanguages ?? [],
      });
      setStoreUser(userData);
    }
  }, [userData, setStoreUser, clerkUser]);

  const { mutate: updateProfile, loading: saving } = useMutation((data: typeof form) =>
    userApi.updateProfile(data)
  );

  const handleSave = async () => {
    setSaveMsg('');
    try {
      // If user doesn't exist in DB yet (e.g. registration race), create them first
      if (!userData && clerkUser) {
        await userApi.create({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          name: clerkUser.fullName ?? undefined,
          avatar: clerkUser.imageUrl ?? undefined,
        });
      }
      await updateProfile(form);
      setSaveMsg('✓ Profile saved! Syncing data in background…');
      refetch();
      setTimeout(() => setSaveMsg(''), 5000);
    } catch (e: any) {
      setSaveMsg(e.message || 'Failed to save');
    }
  };

  const toggleLanguage = (lang: string) => {
    setForm((f) => ({
      ...f,
      favoriteLanguages: f.favoriteLanguages.includes(lang)
        ? f.favoriteLanguages.filter((l) => l !== lang)
        : [...f.favoriteLanguages, lang],
    }));
  };

  // PDF export
  const handleExportPDF = () => {
    const content = `
CPAnalytics Profile Report
Generated: ${new Date().toLocaleDateString()}

Name: ${form.name || 'N/A'}
College: ${form.college || 'N/A'}
Branch: ${form.branch || 'N/A'}
Country: ${form.country || 'N/A'}

Competitive Programming Handles:
- Codeforces: ${form.codeforcesHandle || 'Not set'}
- LeetCode: ${form.leetcodeUsername || 'Not set'}

Stats:
- Codeforces Rating: ${userData?.profile?.codeforcesRating ?? 'N/A'}
- Codeforces Rank: ${userData?.profile?.codeforcesRank ?? 'N/A'}
- Total Solved: ${userData?.profile?.totalSolved ?? 0}
- Current Streak: ${userData?.profile?.currentStreak ?? 0} days
- LeetCode Solved: ${userData?.profile?.leetcodeTotalSolved ?? 'N/A'}

Favorite Languages: ${form.favoriteLanguages.join(', ') || 'N/A'}

GitHub: ${form.githubUrl || 'N/A'}
LinkedIn: ${form.linkedinUrl || 'N/A'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cpanalytics-profile.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account and competitive programming handles
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 text-sm border border-border hover:border-brand-500/50 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Avatar + basic info */}
      <SectionCard title="Account" icon={User}>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={clerkUser?.imageUrl ?? `https://api.dicebear.com/7.x/initials/svg?seed=${form.name}`}
            alt="Avatar"
            className="w-16 h-16 rounded-xl border-2 border-border"
          />
          <div>
            <p className="font-semibold">{clerkUser?.fullName}</p>
            <p className="text-sm text-muted-foreground">{clerkUser?.emailAddresses[0]?.emailAddress}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avatar managed via Clerk · <a href="https://accounts.clerk.dev" target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">Update</a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Your name" />
          <InputField label="Country" value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} placeholder="India" />
          <InputField label="College" value={form.college} onChange={(v) => setForm((f) => ({ ...f, college: v }))} placeholder="IIT Kanpur" />
          <InputField label="Branch" value={form.branch} onChange={(v) => setForm((f) => ({ ...f, branch: v }))} placeholder="Computer Science" />
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell others about yourself…"
            rows={2}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>
      </SectionCard>

      {/* CP Handles — most important section */}
      <SectionCard
        title="Competitive Programming Handles"
        subtitle="Connect to auto-sync your stats"
        icon={Code2}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Code2 className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-0.5">Codeforces Handle</p>
                <p className="text-xs text-muted-foreground mb-2">Your CF handle (e.g. tourist)</p>
                <input
                  type="text"
                  value={form.codeforcesHandle}
                  onChange={(e) => setForm((f) => ({ ...f, codeforcesHandle: e.target.value }))}
                  placeholder="your_cf_handle"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {form.codeforcesHandle && (
                  <a
                    href={`https://codeforces.com/profile/${form.codeforcesHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-orange-500 hover:underline mt-1.5 inline-flex items-center gap-1"
                  >
                    View profile <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                <Code2 className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-0.5">LeetCode Username</p>
                <p className="text-xs text-muted-foreground mb-2">Your LC username</p>
                <input
                  type="text"
                  value={form.leetcodeUsername}
                  onChange={(e) => setForm((f) => ({ ...f, leetcodeUsername: e.target.value }))}
                  placeholder="your_lc_username"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                {form.leetcodeUsername && (
                  <a
                    href={`https://leetcode.com/${form.leetcodeUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-yellow-500 hover:underline mt-1.5 inline-flex items-center gap-1"
                  >
                    View profile <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Social links */}
      <SectionCard title="Links" icon={Globe}>
        <div className="space-y-4">
          <InputField
            label="GitHub"
            value={form.githubUrl}
            onChange={(v) => setForm((f) => ({ ...f, githubUrl: v }))}
            placeholder="https://github.com/username"
            prefix="🔗"
          />
          <InputField
            label="LinkedIn"
            value={form.linkedinUrl}
            onChange={(v) => setForm((f) => ({ ...f, linkedinUrl: v }))}
            placeholder="https://linkedin.com/in/username"
            prefix="🔗"
          />
        </div>
      </SectionCard>

      {/* Favorite languages */}
      <SectionCard title="Favorite Languages" subtitle="Select all that apply" icon={Code2}>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => {
            const selected = form.favoriteLanguages.includes(lang);
            return (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                  selected
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-border text-muted-foreground hover:border-brand-500/50 hover:text-foreground'
                )}
              >
                {selected && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {lang}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save & Sync'}
        </button>
        {saveMsg && (
          <p className={cn('text-sm', saveMsg.startsWith('✓') ? 'text-green-500' : 'text-red-500')}>
            {saveMsg}
          </p>
        )}
      </div>

      {/* Current stats preview */}
      {userData?.profile && (
        <SectionCard title="Current Stats" subtitle="From your last sync" icon={Code2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'CF Rating', value: userData.profile.codeforcesRating ?? '—' },
              { label: 'CF Rank', value: userData.profile.codeforcesRank ?? '—' },
              { label: 'CF Contests', value: userData.profile.codeforcesContests ?? '—' },
              { label: 'CF Solved', value: userData.profile.codeforcesSolved ?? '—' },
              { label: 'LC Solved', value: userData.profile.leetcodeTotalSolved ?? '—' },
              { label: 'Streak', value: `${userData.profile.currentStreak} days` },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-sm mt-0.5">{String(item.value)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
