import Link from 'next/link';
import {  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,} from '@clerk/nextjs';
import {
  BarChart3, Zap, Trophy, Lightbulb, Code2,
  ArrowRight, Github, Star, TrendingUp
} from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Rating History',
    desc: 'Interactive Codeforces rating graph with contest tooltips, tier markers, and zoom support.',
    color: 'text-brand-500',
    bg: 'bg-brand-500/10',
  },
  {
    icon: Zap,
    title: 'Activity Heatmap',
    desc: 'GitHub-style heatmap tracking your daily problem-solving streaks across the year.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Trophy,
    title: 'Contest History',
    desc: 'Full searchable, sortable contest table with rating deltas, ranks, and pagination.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Lightbulb,
    title: 'AI Insights',
    desc: 'Rule-based analytics engine that surfaces weak topics, inactivity streaks, and next-step recommendations.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Topic Analytics',
    desc: 'Pie chart breakdown of Greedy, DP, Graphs, Trees, Binary Search, Math and more.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Star,
    title: 'Leaderboard',
    desc: 'Compare against other CP coders by rating, solved count, streak, college, and country.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              CP<span className="text-gradient">Analytics</span>
            </span>
          </div>
          <nav className="flex items-center gap-3">
<SignedOut>
  <SignInButton mode="modal">
    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
      Sign in
    </button>
  </SignInButton>

  <SignUpButton mode="modal">
    <button className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
      Get Started
    </button>
  </SignUpButton>
</SignedOut>

<SignedIn>
  <Link
    href="/dashboard"
    className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5"
  >
    Dashboard <ArrowRight className="w-3.5 h-3.5" />
  </Link>

  <UserButton />
</SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-60 dark:opacity-30 pointer-events-none" />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" />
            Codeforces + LeetCode unified
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Your CP journey,
            <br />
            <span className="text-gradient">visualized.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Track ratings, analyze weak topics, view activity heatmaps, and get personalized
            insights — all in one polished dashboard.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <SignedOut>
  <SignUpButton mode="modal">
    <button className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25">
      Start tracking free <ArrowRight className="w-4 h-4" />
    </button>
  </SignUpButton>
</SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedIn>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-border hover:border-brand-500/50 px-6 py-3 rounded-xl font-semibold text-sm transition-all text-muted-foreground hover:text-foreground"
            >
              <Github className="w-4 h-4" /> View on GitHub
            </a>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '10+', label: 'Charts & Views' },
              { value: '2', label: 'Platforms' },
              { value: 'Free', label: 'Always' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-gradient">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Everything you need to level up</h2>
          <p className="text-muted-foreground text-lg">
            Production-grade analytics built for serious competitive programmers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl border border-border bg-card hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-violet-700 p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10 pointer-events-none" />
          <h2 className="text-3xl font-bold mb-3 relative">Ready to track your progress?</h2>
          <p className="text-brand-100 mb-8 relative">
            Connect your handles and get insights in under 60 seconds.
          </p>
          <SignedOut>
<SignUpButton mode="modal">
  <button className="inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 px-8 py-3 rounded-xl font-bold text-sm transition-colors">
    Create free account <ArrowRight className="w-4 h-4" />
  </button>
</SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 px-8 py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2 className="w-4 h-4" />
            <span>CPAnalytics — Built for IITK competitive programmers</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CPAnalytics</p>
        </div>
      </footer>
    </div>
  );
}
