import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { getCategoryMeta } from '../lib/categories';
import { TerminalAnimation } from '../components/TerminalAnimation';
import { TechniqueTicker } from '../components/TechniqueTicker';
import { CountUp } from '../components/CountUp';
import { MatrixRain } from '../components/MatrixRain';

const CATEGORY_BLURB: Record<string, string> = {
  crypto: 'Break ciphers, factor keys, and learn where "encoded" stops meaning "secure."',
  forensics: 'Dig through metadata, encodings, and hex dumps for what wasn\'t meant to be found.',
  web: 'Attack real, disposable web apps — SQL injection, IDOR, broken auth, and more.',
  misc: 'Recon, protocols, and the habits that matter before you touch an exploit.',
};

export function LandingPage() {
  const { data: challenges } = useQuery({ queryKey: ['challenges'], queryFn: api.getChallenges });
  const { data: lessons } = useQuery({ queryKey: ['lessons'], queryFn: api.getLessons });

  const challengeCount = challenges?.length ?? 0;
  const liveCount = challenges?.filter((c) => c.type === 'LIVE').length ?? 0;
  const lessonCount = lessons?.length ?? 0;

  const categories = new Map<string, number>();
  for (const c of challenges ?? []) {
    categories.set(c.categorySlug, (categories.get(c.categorySlug) ?? 0) + 1);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-900 px-6 py-10 text-center">
        <MatrixRain className="pointer-events-none absolute inset-0 h-full w-full opacity-30" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(5,6,3,0.6), rgba(5,6,3,0.92) 60%)',
          }}
        />
        <div className="animate-fade-in-up relative mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-400">
            🔓 Hands-on Cyber Range
          </span>
          <h1 className="animate-glitch text-4xl font-extrabold leading-tight sm:text-5xl">
            Learn to break things —<br />
            <span className="text-neon">so you know how to defend them.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            ExploitYard pairs write-ups on real attack techniques with disposable, isolated
            challenges you exploit yourself — from a rigged login form to a forged JWT.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="animate-neon-pulse rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 px-6 py-3 text-sm font-bold text-black hover:brightness-110"
            >
              Start hacking — it's free
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-bold hover:border-zinc-500"
            >
              Log in
            </Link>
          </div>

          <div className="mt-6">
            <TerminalAnimation />
          </div>
        </div>
      </section>

      <TechniqueTicker />

      {/* Stats */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-3">
        {[
          { label: 'Challenges', value: challengeCount },
          { label: 'Live Docker Sandboxes', value: liveCount },
          { label: 'Technique Write-ups', value: lessonCount },
        ].map((s, i) => (
          <div
            key={s.label}
            className="animate-fade-in-up rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 text-center"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="text-3xl font-extrabold text-cyan-400">
              <CountUp value={s.value} />
            </div>
            <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">{s.label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="mb-8 text-center text-2xl font-extrabold">How it works</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: '📘',
              title: '1. Learn',
              body: 'Read a short write-up on the technique — what the bug is, and why it works.',
            },
            {
              icon: '🎯',
              title: '2. Practice',
              body: 'Solve the matching challenge yourself — including live, disposable containers.',
            },
            {
              icon: '🏆',
              title: '3. Compete',
              body: 'Earn points, level up, and climb the live leaderboard as you solve more.',
            },
          ].map((step, i) => (
            <div
              key={step.title}
              className="animate-fade-in-up rounded-xl border border-zinc-800 bg-zinc-950/80 p-6"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-2xl">{step.icon}</div>
              <h3 className="mt-2 font-bold">{step.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offense vs Defense */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="mb-2 text-center text-2xl font-extrabold">
          <span className="text-rose-400">Offense</span> meets{' '}
          <span className="text-sky-400">Defense</span>
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-center text-sm text-zinc-400">
          Every technique here trains one side of the same coin — attacking a system, or
          recognizing when someone else already has.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-rose-900/50 bg-rose-950/10 p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full border border-rose-800/60 bg-rose-950/50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-rose-400">
                Offense
              </span>
              <span className="text-xs text-zinc-500">Crypto &amp; Web tracks</span>
            </div>
            <h3 className="text-lg font-bold">Think like an attacker</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Break ciphers, forge tokens, and find the request an app never expected to receive.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['SQL Injection', 'IDOR', 'JWT Forgery', 'CORS Misconfig', 'RSA Factoring'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-rose-900/60 bg-rose-950/30 px-2.5 py-1 text-xs text-rose-300"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="rounded-xl border border-sky-900/50 bg-sky-950/10 p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full border border-sky-800/60 bg-sky-950/50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-sky-400">
                Defense
              </span>
              <span className="text-xs text-zinc-500">Forensics &amp; Misc tracks</span>
            </div>
            <h3 className="text-lg font-bold">Think like a defender</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Read logs like an incident responder, spot what metadata is leaking, and build the
              instincts that catch an attacker mid-attempt.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Log Analysis', 'EXIF Forensics', 'Encoding Detection', 'Defense in Depth'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-sky-900/60 bg-sky-950/30 px-2.5 py-1 text-xs text-sky-300"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category preview */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="mb-8 text-center text-2xl font-extrabold">Pick your battlefield</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...categories.entries()].map(([slug, count]) => {
            const meta = getCategoryMeta(slug);
            return (
              <div key={slug} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{meta.icon}</span>
                  <h3 className={`text-lg font-bold uppercase tracking-wide ${meta.color}`}>{slug}</h3>
                  <span className="ml-auto rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-400">
                    {count} challenge{count === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{CATEGORY_BLURB[slug]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing / positioning */}
      <section className="border-t border-zinc-900 px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-400">
            💸 Simple pricing
          </span>
          <h2 className="text-2xl font-extrabold">Start free. Upgrade when you're hooked.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">
            The full Academy curriculum and a real taste of the challenge catalog are free,
            forever. PRO unlocks every challenge — including the live Docker sandboxes — plus more
            concurrent instances.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
            <h3 className="font-bold text-zinc-400">Free</h3>
            <p className="mt-1 text-2xl font-extrabold text-zinc-300">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>✓ Full Academy curriculum, every lesson</li>
              <li>✓ A curated set of starter challenges</li>
              <li>✓ 1 free live Docker sandbox (SQLi 101)</li>
              <li>✓ 1 live instance at a time</li>
              <li>◦ Most MEDIUM/HARD challenges locked</li>
              <li>◦ Other live Docker sandboxes locked</li>
            </ul>
          </div>
          <div className="relative rounded-xl border border-cyan-700/60 bg-cyan-950/10 p-6 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            <span className="absolute -top-3 right-4 rounded-full bg-cyan-400 px-2.5 py-0.5 text-xs font-bold text-black">
              PRO
            </span>
            <h3 className="font-bold text-cyan-400">Pro</h3>
            <p className="mt-1 text-2xl font-extrabold text-cyan-400">
              $/month <span className="text-sm font-medium text-zinc-500">— see Upgrade</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>✓ Every challenge, unlocked — including live sandboxes</li>
              <li>✓ 3x concurrent live instances</li>
              <li>✓ Full Academy curriculum</li>
              <li>✓ Supports new content and infra</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-zinc-900 px-6 py-16 text-center">
        <h2 className="text-2xl font-extrabold">Ready to find your first flag?</h2>
        <Link
          to="/register"
          className="animate-neon-pulse mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 px-6 py-3 text-sm font-bold text-black hover:brightness-110"
        >
          Create a free account
        </Link>
      </section>
    </div>
  );
}
