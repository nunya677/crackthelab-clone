import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { getCategoryMeta } from '../lib/categories';
import { TerminalAnimation } from '../components/TerminalAnimation';
import { TechniqueTicker } from '../components/TechniqueTicker';
import { CountUp } from '../components/CountUp';
import { MatrixRain } from '../components/MatrixRain';

const CATEGORY_BLURB: Record<string, string> = {
  crypto:
    'Break ciphers, factor keys, and learn where "encoded" stops meaning "secure."',
  forensics:
    'Dig through metadata, encodings, and hex dumps for what wasn\'t meant to be found.',
  web:
    'Attack real, disposable web apps — SQL injection, IDOR, broken auth, and more.',
  misc:
    'Recon, protocols, and the habits that matter before you touch an exploit.',
};

export function LandingPage() {
  const {
    data: challengesData,
    isLoading: challengesLoading,
  } = useQuery({
    queryKey: ['challenges'],
    queryFn: api.getChallenges,
  });

  const {
    data: lessonsData,
    isLoading: lessonsLoading,
  } = useQuery({
    queryKey: ['lessons'],
    queryFn: api.getLessons,
  });


  // Protect UI from bad API responses
  const challenges = Array.isArray(challengesData)
    ? challengesData
    : [];

  const lessons = Array.isArray(lessonsData)
    ? lessonsData
    : [];


  const challengeCount = challenges.length;

  const liveCount = challenges.filter(
    (c) => c.type === 'LIVE'
  ).length;

  const lessonCount = lessons.length;


  const categories = new Map<string, number>();

  for (const c of challenges) {
    categories.set(
      c.categorySlug,
      (categories.get(c.categorySlug) ?? 0) + 1
    );
  }


  return (
    <div>

      {/* HERO */}
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
            🔐 Hands-on Cyber Range
          </span>


          <h1 className="animate-glitch text-4xl font-extrabold leading-tight sm:text-5xl">

            Learn to break things —
            <br />

            <span className="text-neon">
              so you know how to defend them.
            </span>

          </h1>


          <p className="mx-auto mt-3 max-w-xl text-slate-400">

            ExploitYard pairs write-ups on real attack techniques
            with disposable isolated challenges you exploit yourself.

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


      {/* STATS */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-3">

        {[
          {
            label: 'Challenges',
            value: challengeCount,
          },
          {
            label: 'Live Docker Sandboxes',
            value: liveCount,
          },
          {
            label: 'Technique Write-ups',
            value: lessonCount,
          },
        ].map((s) => (

          <div
            key={s.label}
            className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 text-center"
          >

            <div className="text-3xl font-extrabold text-cyan-400">

              <CountUp value={s.value} />

            </div>


            <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">

              {s.label}

            </div>

          </div>

        ))}

      </section>



      {/* CATEGORY SECTION */}

      <section className="mx-auto max-w-4xl px-6 py-10">

        <h2 className="mb-8 text-center text-2xl font-extrabold">
          Pick your battlefield
        </h2>


        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {[...categories.entries()].map(([slug, count]) => {

            const meta = getCategoryMeta(slug);

            return (

              <div
                key={slug}
                className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6"
              >

                <div className="flex items-center gap-2">

                  <span className="text-2xl">
                    {meta.icon}
                  </span>


                  <h3
                    className={`text-lg font-bold uppercase tracking-wide ${meta.color}`}
                  >
                    {slug}
                  </h3>


                  <span className="ml-auto rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-400">

                    {count} challenge{count === 1 ? '' : 's'}

                  </span>


                </div>


                <p className="mt-2 text-sm text-zinc-400">

                  {CATEGORY_BLURB[slug]}

                </p>


              </div>

            );

          })}


        </div>

      </section>



      {/* FINAL CTA */}

      <section className="border-t border-zinc-900 px-6 py-16 text-center">

        <h2 className="text-2xl font-extrabold">
          Ready to find your first flag?
        </h2>


        <Link
          to="/register"
          className="animate-neon-pulse mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 px-6 py-3 text-sm font-bold text-black"
        >
          Create a free account
        </Link>


      </section>


    </div>
  );
}