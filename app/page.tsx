import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        <h1 className="text-2xl font-bold">
          DevPath<span className="text-violet-400"> AI</span>
        </h1>

        <div className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white">
            Features
          </a>

          <a href="#about" className="hover:text-white">
            About
          </a>

          <Link
            href="/analyze"
            className="rounded-lg bg-violet-600 px-5 py-2 text-white hover:bg-violet-500"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <div className="mb-6 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          Your personal AI career assistant
        </div>

        <h2 className="text-5xl font-bold leading-tight md:text-7xl">
          Build your future
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            in software development.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          Discover your skill gaps, create a personalized learning roadmap,
          and build the projects that move your developer career forward.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/analyze"
            className="rounded-xl bg-violet-600 px-7 py-4 font-semibold hover:bg-violet-500"
          >
            Analyze My Profile →
          </Link>

          <a
            href="#features"
            className="rounded-xl border border-white/15 px-7 py-4 font-semibold hover:bg-white/5"
          >
            Explore Features
          </a>
        </div>

        <div
          id="features"
          className="mt-24 grid gap-5 text-left md:grid-cols-3"
        >
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 text-3xl">🎯</div>
            <h3 className="text-xl font-semibold">Skill Analysis</h3>
            <p className="mt-3 leading-7 text-gray-400">
              Identify your strengths and discover which skills you need to
              develop next.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 text-3xl">🧠</div>
            <h3 className="text-xl font-semibold">AI Roadmap</h3>
            <p className="mt-3 leading-7 text-gray-400">
              Turn your career goals into a structured and personalized
              learning plan.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 text-3xl">🚀</div>
            <h3 className="text-xl font-semibold">Project Ideas</h3>
            <p className="mt-3 leading-7 text-gray-400">
              Find practical projects that help you demonstrate your skills
              and improve your portfolio.
            </p>
          </article>
        </div>
      </section>

      <footer
        id="about"
        className="border-t border-white/10 px-6 py-6 text-center text-sm text-gray-500"
      >
        DevPath AI — Build skills. Create projects. Grow your career.
      </footer>
    </main>
  );
}

