import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#09090f] px-6 py-12 text-white">

      <div className="mx-auto max-w-4xl">

        <Link
          href="/"
          className="text-sm text-violet-400 hover:text-violet-300"
        >
          ← Back to Home
        </Link>

        <section className="mt-16 text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-violet-500/30 bg-violet-500/10 text-4xl">
            👨‍💻
          </div>

          <p className="mt-8 text-sm font-semibold tracking-[0.2em] text-violet-400">
            ABOUT THE DEVELOPER
          </p>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Ramin Motamed
          </h1>

          <p className="mt-4 text-lg text-gray-400">
            Software Engineering Student & Developer
          </p>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-gray-400">
            I'm a software engineering student passionate about
            technology, programming, and building useful digital
            experiences.

            I enjoy exploring new technologies, solving problems,
            and turning ideas into real-world applications.

            My main interests include web development, game
            development, and artificial intelligence.
          </p>

        </section>

        {/* Technical Interests */}
        <section className="mt-20">

          <h2 className="text-2xl font-bold text-center">
            Technical Interests
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">

            {[
              {
                icon: "🌐",
                title: "Web Development",
                description: "Building modern and interactive web applications.",
              },
              {
                icon: "🎮",
                title: "Game Development",
                description: "Exploring game development and interactive experiences.",
              },
              {
                icon: "🤖",
                title: "Artificial Intelligence",
                description: "Learning how AI can solve real-world problems.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition hover:border-violet-500/40"
              >
                <div className="text-3xl">{item.icon}</div>

                <h3 className="mt-4 font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}

          </div>
        </section>

        {/* Technologies */}
        <section className="mt-20 text-center">

          <h2 className="text-2xl font-bold">
            Technologies & Tools
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            {[
              "JavaScript",
              "TypeScript",
              "React",
              "Next.js",
              "Node.js",
              "HTML",
              "CSS",
              "Python",
              "C#",
              "Unity",
              "Git",
              "Supabase",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300"
              >
                {tech}
              </span>
            ))}

          </div>
        </section>

        {/* Contact */}
        <section className="mt-20 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-500/5 p-8 text-center sm:p-12">

          <h2 className="text-3xl font-bold">
            Let's Connect
          </h2>

          <p className="mt-4 text-gray-400">
            Feel free to reach out through email.
          </p>

          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dipper.mort2002@gmail.com" target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500">
                ✉ Contact Me
          </a>

          <p className="mt-5 text-sm text-gray-500">
            dipper.mort2002@gmail.com
          </p>

        </section>

        <footer className="mt-20 border-t border-white/10 py-8 text-center text-sm text-gray-500">
          © 2026 Ramin Motamed. Built with passion.
        </footer>

      </div>
    </main>
  );
}