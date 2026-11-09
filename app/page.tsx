import Link from "next/link";

const features = [
  {
    icon: "🎯",
    title: "AI Skill Analysis",
    description:
      "Discover your strengths, identify skill gaps, and understand what you should learn next.",
    link: "/analyze",
    action: "Analyze Skills",
  },
  {
    icon: "🧠",
    title: "Personalized Roadmap",
    description:
      "Get a structured learning path based on your current knowledge and career ambitions.",
    link: "/dashboard",
    action: "View Roadmap",
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    description:
      "Track completed learning steps and monitor how far you have progressed toward your goals.",
    link: "/dashboard",
    action: "Track Progress",
  },
  {
    icon: "🚀",
    title: "Project Recommendations",
    description:
      "Discover practical project ideas that match your programming level and technical skills.",
    link: "/dashboard",
    action: "Explore Projects",
  },
  {
    icon: "💼",
    title: "Career Planning",
    description:
      "Define your professional goals and discover the skills needed to move closer to them.",
    link: "/analyze",
    action: "Plan My Career",
  },
  {
    icon: "👤",
    title: "Developer Profile",
    description:
      "Keep your skills, career interests, and learning preferences organized in one place.",
    link: "/profile",
    action: "View Profile",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      {/* Navigation */}
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
        <Link href="/" className="text-2xl font-bold">
          DevPath<span className="text-violet-400"> AI</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-sm">

          <Link href="/about" className="hidden text-gray-400 transition hover:text-white sm:block">
            About
          </Link>

          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-violet-600 px-5 py-2 font-semibold text-white transition hover:bg-violet-500"
          >
            Sign Up
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-violet-300 transition hover:bg-violet-500/20"
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="text-center">
          <div className="mb-6 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            Your personal AI career assistant
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Build your future
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              in software development.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Discover your skill gaps, create a personalized learning roadmap,
            and build the projects that move your developer career forward.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/analyze"
              className="rounded-xl bg-violet-600 px-7 py-4 font-semibold transition hover:bg-violet-500"
            >
              Analyze My Profile →
            </Link>

            <a
              href="#features"
              className="rounded-xl border border-white/15 px-7 py-4 font-semibold transition hover:bg-white/5"
            >
              Explore Features ↓
            </a>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32 scroll-mt-10">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold tracking-[0.2em] text-violet-400">
              YOUR DEVELOPER TOOLKIT
            </span>

            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Everything you need to grow
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-400">
              Explore the tools that help you understand your skills,
              organize your learning, and build your developer career.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-violet-500/[0.04]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-2xl">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold transition group-hover:text-violet-300">
                  {feature.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-gray-400">
                  {feature.description}
                </p>

                <Link
                  href={feature.link}
                  className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-violet-400 transition hover:text-violet-300"
                >
                  {feature.action}
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-28 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-500/5 px-6 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-bold">
            Ready to take the next step?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
            Start analyzing your skills and discover a learning path
            designed around your career goals.
          </p>

          <Link
            href="/analyze"
            className="mt-8 inline-flex rounded-xl bg-violet-600 px-7 py-4 font-semibold transition hover:bg-violet-500"
          >
            Get Started Now →
          </Link>
        </section>
      </section>

      {/* Footer */}
      <footer
        id="about"
        className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500"
      >
        <p className="font-semibold text-gray-300">
          DevPath<span className="text-violet-400"> AI</span>
        </p>

        <p className="mt-2">
          Build skills. Create projects. Grow your career.
        </p>

        <p className="mt-4 text-xs">
          © 2026 DevPath AI. All rights reserved.
        </p>
      </footer>
    </main>
  );
}