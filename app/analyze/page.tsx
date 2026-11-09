"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RoadmapStep = {
  title: string;
  description: string;
  duration: string;
  tasks: string[];
};

type Project = {
  title: string;
  description: string;
  skills: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

type Analysis = {
  userSkills: string[];
  missingSkills: string[];
  roadmap: RoadmapStep[];
  projects: Project[];
};

const recommendations: Record<string, string[]> = {
  "Web Development": [
    "HTML",
    "CSS",
    "JavaScript",
    "Git",
    "React",
    "TypeScript",
    "REST APIs",
  ],
  "Frontend Development": [
    "HTML",
    "CSS",
    "JavaScript",
    "Git",
    "React",
    "TypeScript",
    "Testing",
  ],
  "Backend Development": [
    "JavaScript",
    "Git",
    "Node.js",
    "Express",
    "SQL",
    "REST APIs",
    "Authentication",
  ],
  "Artificial Intelligence": [
    "Python",
    "Statistics",
    "NumPy",
    "Pandas",
    "Machine Learning",
    "Model Evaluation",
  ],
  "Game Development": [
    "C#",
    "Object-Oriented Programming",
    "Git",
    "Unity",
    "Game Physics",
  ],
  "Mobile Development": [
    "Java",
    "Kotlin",
    "Git",
    "Mobile UI",
    "APIs",
    "Testing",
  ],
  Cybersecurity: [
    "Networking",
    "Linux",
    "Python",
    "Security Fundamentals",
    "Web Security",
  ],
};

const allowedGoals = [
  "Get a job",
  "Build a portfolio",
  "Improve my skills",
  "Prepare for an internship",
  "Start freelancing",
];

function isAnalysis(value: unknown): value is Analysis {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Analysis;

  return (
    Array.isArray(item.userSkills) &&
    item.userSkills.every((x) => typeof x === "string") &&
    Array.isArray(item.missingSkills) &&
    item.missingSkills.every((x) => typeof x === "string") &&
    Array.isArray(item.roadmap) &&
    item.roadmap.every(
      (step) =>
        step &&
        typeof step.title === "string" &&
        typeof step.description === "string" &&
        typeof step.duration === "string" &&
        Array.isArray(step.tasks) &&
        step.tasks.every((task) => typeof task === "string")
    ) &&
    Array.isArray(item.projects) &&
    item.projects.every(
      (project) =>
        project &&
        typeof project.title === "string" &&
        typeof project.description === "string" &&
        Array.isArray(project.skills) &&
        typeof project.difficulty === "string"
    )
  );
}

export default function AnalyzePage() {
  const router = useRouter();

  const [level, setLevel] = useState("Beginner");
  const [goal, setGoal] = useState("Get a job");
  const [skills, setSkills] = useState("");
  const [interest, setInterest] = useState("Web Development");

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  // Load the user's profile from Supabase
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        if (!active) return;

        setUserId(user.id);

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select(
            "level, goal, skills, interest, analysis, completed_steps"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!active) return;

        if (data) {
          if (typeof data.level === "string") {
            setLevel(data.level);
          }

          if (typeof data.goal === "string") {
            setGoal(data.goal);
          }

          if (typeof data.skills === "string") {
            setSkills(data.skills);
          }

          if (
            typeof data.interest === "string" &&
            Object.prototype.hasOwnProperty.call(
              recommendations,
              data.interest
            )
          ) {
            setInterest(data.interest);
          }

          if (isAnalysis(data.analysis)) {
            setAnalysis(data.analysis);
          }

          if (Array.isArray(data.completed_steps)) {
            setCompletedSteps(
              data.completed_steps.filter(
                (step: unknown): step is string =>
                  typeof step === "string"
              )
            );
          }
        }
      } catch (loadError) {
        console.error("Profile loading error:", loadError);

        if (active) {
          setError(
            "Could not load your saved profile. Please refresh the page."
          );
        }
      } finally {
        if (active) {
          setIsLoaded(true);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  // Automatically save profile changes
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const timer = window.setTimeout(async () => {
      const { error: saveError } = await supabase
        .from("profiles")
        .update({
          level,
          goal,
          skills,
          interest,
          analysis,
          completed_steps: completedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (saveError) {
        console.error("Profile save error:", saveError);
        setSaveMessage("Could not save changes.");
      } else {
        setSaveMessage("Saved to your account");
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [
    isLoaded,
    userId,
    level,
    goal,
    skills,
    interest,
    analysis,
    completedSteps,
  ]);

  // Submit profile to Groq API
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSaveMessage("");
    setIsAnalyzing(true);

    try {
      const userSkills = Array.from(
        new Set(
          skills
            .split(/[,;\n]+/)
            .map((skill) => skill.trim())
            .filter(Boolean)
        )
      );

      if (userSkills.length === 0) {
        throw new Error("Please enter at least one skill.");
      }

      if (userSkills.length > 30) {
        throw new Error("Please enter no more than 30 skills.");
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          goal,
          skills: userSkills,
          interest,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "AI analysis failed. Please try again."
        );
      }

      if (!isAnalysis(result.analysis)) {
        throw new Error(
          "The AI returned an unexpected response. Please try again."
        );
      }

      const newAnalysis = result.analysis as Analysis;

      setAnalysis(newAnalysis);
      setCompletedSteps([]);

      // Save the new analysis to Supabase
      if (!userId) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .update({
          level,
          goal,
          skills: userSkills.join(", "),
          interest,
          analysis: newAnalysis,
          completed_steps: [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (saveError) {
        console.error("Analysis save error:", saveError);
        throw new Error(
          "Analysis completed, but saving to your account failed. Please try again."
        );
      }

      setSkills(userSkills.join(", "));
      setSaveMessage("Analysis saved to your account");

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    } catch (submitError) {
      console.error("AI analysis error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Toggle roadmap completion
  function toggleStep(title: string) {
    setCompletedSteps((current) =>
      current.includes(title)
        ? current.filter((step) => step !== title)
        : [...current, title]
    );
  }

  const progress =
    analysis && analysis.roadmap.length > 0
      ? Math.round(
          (completedSteps.length / analysis.roadmap.length) * 100
        )
      : 0;

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090f] text-white">
        <p className="text-gray-400">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090f] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm text-gray-400 transition hover:text-white">
          ← Home
          </Link>

          <Link href="/dashboard" className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-300 transition hover:border-violet-400 hover:bg-violet-500/20">
            Dashboard →
          </Link>
        </nav>

        <header className="mb-10 mt-8">
          <span className="text-sm font-semibold tracking-[0.2em] text-violet-400">
            DEVELOPER PROFILE
          </span>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Build your career roadmap
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-gray-400">
            Analyze your skills, plan your next steps, and track your
            learning progress.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8 md:grid-cols-2"
        >
          <FormSelect
            id="level"
            label="Current programming level"
            value={level}
            onChange={setLevel}
            options={["Beginner", "Intermediate", "Advanced"]}
          />

          <FormSelect
            id="interest"
            label="Career area"
            value={interest}
            onChange={setInterest}
            options={Object.keys(recommendations)}
          />

          <div className="md:col-span-2">
            <label
              htmlFor="skills"
              className="mb-3 block text-sm font-medium"
            >
              Skills and technologies you know
            </label>

            <textarea
              id="skills"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="Example: JavaScript, React, HTML, CSS"
              rows={4}
              required
              className="w-full resize-y rounded-xl border border-white/10 bg-[#13131d] p-4 outline-none placeholder:text-gray-600 focus:border-violet-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Separate each skill with a comma.
            </p>
          </div>

          <FormSelect
            id="goal"
            label="Main career goal"
            value={goal}
            onChange={setGoal}
            options={allowedGoals}
          />

          <div className="flex items-end text-sm leading-6 text-gray-500">
            Your selected level is {level.toLowerCase()}. Recommendations
            are based on your chosen career area and the skills you enter.
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-400 md:col-span-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isAnalyzing}
            className="rounded-xl bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            {isAnalyzing
              ? "Analyzing with AI..."
              : "Analyze My Profile →"}
          </button>
        </form>

        {saveMessage && (
          <p className="mt-4 text-sm text-emerald-400">
            {saveMessage}
          </p>
        )}

        {analysis && (
          <section className="mt-12 space-y-8" aria-live="polite">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <span className="text-sm font-semibold tracking-widest text-violet-400">
                  YOUR RESULTS
                </span>

                <h2 className="mt-2 text-3xl font-bold">
                  Your developer roadmap
                </h2>
              </div>

              <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
                {level} · {interest}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Skills entered"
                value={analysis.userSkills.length}
                description="Technologies in your profile"
              />

              <StatCard
                label="Skills to explore"
                value={analysis.missingSkills.length}
                description="Suggested areas to develop"
              />

              <StatCard
                label="Learning progress"
                value={`${progress}%`}
                description={`${completedSteps.length} of ${analysis.roadmap.length} roadmap steps completed`}
              />
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-2xl font-bold">
                    Learning Roadmap
                  </h3>

                  <p className="mt-2 text-sm text-gray-400">
                    Goal: {goal}. Mark each step as you complete it.
                  </p>
                </div>

                <span className="text-sm font-semibold text-violet-300">
                  {progress}% complete
                </span>
              </div>

              <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Learning roadmap progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-8 space-y-4">
                {analysis.roadmap.map((step, index) => {
                  const completed = completedSteps.includes(step.title);

                  return (
                    <article
                      key={`${step.title}-${index}`}
                      className={`rounded-xl border p-5 transition ${
                        completed
                          ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                          : "border-white/10 bg-[#13131d]"
                      }`}
                    >
                      <div className="flex gap-4">
                        <input
                          type="checkbox"
                          checked={completed}
                          onChange={() => toggleStep(step.title)}
                          aria-label={`Mark ${step.title} as ${
                            completed ? "incomplete" : "complete"
                          }`}
                          className="mt-1 h-5 w-5 shrink-0 accent-violet-500"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4
                              className={`font-semibold ${
                                completed
                                  ? "text-emerald-300 line-through"
                                  : "text-white"
                              }`}
                            >
                              {index + 1}. {step.title}
                            </h4>

                            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-400">
                              {step.duration}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-400">
                            {step.description}
                          </p>

                          <ul className="mt-4 space-y-2">
                            {step.tasks.map((task, taskIndex) => (
                              <li
                                key={`${task}-${taskIndex}`}
                                className="text-sm leading-6 text-gray-300"
                              >
                                <span className="mr-2 text-violet-400">
                                  •
                                </span>
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold">
                Recommended Projects
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Practice your skills by building something real.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {analysis.projects.map((project, index) => (
                  <article
                    key={`${project.title}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-500/40"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                      {project.difficulty}
                    </span>

                    <h4 className="mt-3 text-lg font-semibold">
                      {project.title}
                    </h4>

                    <p className="mt-3 text-sm leading-6 text-gray-400">
                      {project.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.skills.map((skill, skillIndex) => (
                        <span
                          key={`${skill}-${skillIndex}`}
                          className="rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-gray-500">
              Your AI-generated roadmap, profile, and learning progress
              are saved to your Supabase account.
            </p>

            <button
              type="button"
              onClick={() => {
                setAnalysis(null);
                setCompletedSteps([]);
                setError("");
              }}
              className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium transition hover:bg-white/5"
            >
              ← Edit Profile
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-3 block text-sm font-medium"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#13131d] p-3.5 outline-none focus:border-violet-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-gray-400">{label}</p>

      <p className="mt-3 text-3xl font-bold">{value}</p>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </article>
  );
}