"use client";

import { useEffect, useState } from "react";

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
  difficulty: string;
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
const projectIdeas: Record<
  string,
  Project[]
> = {
  "Web Development": [
    {
      title: "Personal Portfolio",
      description: "Build a responsive portfolio to present your work.",
      skills: ["HTML", "CSS", "JavaScript"],
      difficulty: "Beginner",
    },
    {
      title: "Task Management App",
      description: "Create an app with task creation, editing and filtering.",
      skills: ["React", "TypeScript"],
      difficulty: "Intermediate",
    },
    {
      title: "Full-Stack Job Tracker",
      description: "Track job applications with a database and API.",
      skills: ["React", "Node.js", "SQL", "REST APIs"],
      difficulty: "Advanced",
    },
  ],
  "Frontend Development": [
    {
      title: "Interactive Dashboard",
      description: "Build a responsive dashboard with reusable components.",
      skills: ["React", "TypeScript", "CSS"],
      difficulty: "Intermediate",
    },
    {
      title: "E-commerce Interface",
      description: "Create product cards, filters and a shopping cart.",
      skills: ["React", "State Management", "Testing"],
      difficulty: "Intermediate",
    },
    {
      title: "Accessibility Showcase",
      description: "Build an accessible interface with keyboard navigation.",
      skills: ["HTML", "CSS", "JavaScript", "Testing"],
      difficulty: "Advanced",
    },
  ],
  "Backend Development": [
    {
      title: "REST API",
      description: "Create an API with validation and error handling.",
      skills: ["Node.js", "Express", "REST APIs"],
      difficulty: "Beginner",
    },
    {
      title: "Expense Tracker API",
      description: "Store and retrieve expenses from a database.",
      skills: ["SQL", "Authentication", "Node.js"],
      difficulty: "Intermediate",
    },
    {
      title: "Booking System",
      description: "Build an API for reservations and availability.",
      skills: ["Express", "SQL", "Authentication"],
      difficulty: "Advanced",
    },
  ],
  "Artificial Intelligence": [
    {
      title: "Data Explorer",
      description: "Explore a dataset and visualize useful patterns.",
      skills: ["Python", "Pandas", "NumPy"],
      difficulty: "Beginner",
    },
    {
      title: "Student Performance Predictor",
      description: "Train and evaluate a model using a public dataset.",
      skills: ["Python", "Statistics", "Machine Learning"],
      difficulty: "Intermediate",
    },
    {
      title: "Recommendation Prototype",
      description: "Recommend items based on user preferences.",
      skills: ["Python", "Data Analysis", "Model Evaluation"],
      difficulty: "Advanced",
    },
  ],
  "Game Development": [
    {
      title: "2D Platformer",
      description: "Build a small game with movement and collision detection.",
      skills: ["C#", "Unity", "Game Physics"],
      difficulty: "Intermediate",
    },
    {
      title: "Puzzle Game",
      description: "Create levels, game rules and a scoring system.",
      skills: ["C#", "Object-Oriented Programming"],
      difficulty: "Beginner",
    },
    {
      title: "Save System",
      description: "Save player progress and game settings.",
      skills: ["C#", "Unity", "File Handling"],
      difficulty: "Advanced",
    },
  ],
  "Mobile Development": [
    {
      title: "Habit Tracker",
      description: "Track daily habits and display progress.",
      skills: ["Kotlin", "Mobile UI"],
      difficulty: "Beginner",
    },
    {
      title: "Movie Explorer",
      description: "Fetch movie data from an API and display results.",
      skills: ["Java", "APIs", "Mobile UI"],
      difficulty: "Intermediate",
    },
    {
      title: "Offline Notes App",
      description: "Create, edit and store notes locally.",
      skills: ["Mobile UI", "Data Storage", "Testing"],
      difficulty: "Advanced",
    },
  ],
  Cybersecurity: [
    {
      title: "Security Checklist",
      description: "Create a checklist of common website security practices.",
      skills: ["Python", "Security Fundamentals"],
      difficulty: "Beginner",
    },
    {
      title: "Log Analyzer",
      description: "Analyze sample logs and summarize unusual patterns.",
      skills: ["Python", "Linux", "Networking"],
      difficulty: "Intermediate",
    },
    {
      title: "HTTP Security Inspector",
      description: "Inspect security headers on systems you are authorized to test.",
      skills: ["Python", "Web Security", "Networking"],
      difficulty: "Advanced",
    },
  ],
};

function getRoadmapStep(skill: string, index: number): RoadmapStep {
  const descriptions: Record<string, string> = {
    HTML: "Learn semantic elements, forms, links and page structure.",
    CSS: "Practice layouts, Flexbox, Grid and responsive design.",
    JavaScript: "Study functions, arrays, objects, modules and asynchronous code.",
    Git: "Learn commits, branches, merges and collaborative workflows.",
    React: "Build components and learn props, state, hooks and forms.",
    TypeScript: "Practice types, interfaces, unions and typed React components.",
    "REST APIs": "Learn HTTP methods, status codes, JSON and API integration.",
    "Node.js": "Learn server-side JavaScript, modules and asynchronous operations.",
    Express: "Create routes, middleware and structured error handling.",
    SQL: "Practice tables, relationships, joins and queries.",
    Python: "Learn data types, functions, modules and file handling.",
    Statistics: "Study distributions, probability, correlation and basic inference.",
    NumPy: "Practice numerical arrays and vectorized operations.",
    Pandas: "Clean, transform and analyze tabular datasets.",
    "Machine Learning": "Train baseline models and compare their performance.",
    "Model Evaluation": "Evaluate models with suitable metrics and validation.",
    "C#": "Practice variables, methods, classes and collections.",
    "Object-Oriented Programming": "Use encapsulation, inheritance and composition.",
    Unity: "Build scenes and learn components, prefabs and game loops.",
    "Game Physics": "Practice collisions, movement and physics-based interactions.",
    Java: "Study classes, collections, exceptions and application structure.",
    Kotlin: "Practice Kotlin syntax, null safety and basic application logic.",
    "Mobile UI": "Build screens, navigation and reusable interface components.",
    APIs: "Fetch remote data and handle loading, success and error states.",
    Testing: "Write tests for expected behavior and edge cases.",
    Networking: "Learn IP addresses, ports, DNS and common network protocols.",
    Linux: "Practice the shell, permissions, processes and file management.",
    "Security Fundamentals": "Learn authentication, authorization and common vulnerabilities.",
    "Web Security": "Study input validation, access control and secure HTTP practices.",
    Authentication: "Learn sessions, tokens, password hashing and access control.",
    "State Management": "Practice predictable state updates and data flow.",
    "Data Analysis": "Explore datasets, clean values and communicate findings.",
    "File Handling": "Learn safe reading, writing and structured data storage.",
  };

  return {
    title: skill,
    description:
      descriptions[skill] ??
      `Study the fundamentals of ${skill} and apply them in a small exercise.`,
    duration:
      index === 0 ? "3–5 days" : index === 1 ? "1 week" : "1–2 weeks",
    tasks: [
      `Study the core concepts of ${skill}.`,
      `Complete practical exercises using ${skill}.`,
      `Apply ${skill} in a small project and review your work.`,
    ],
  };
}

function normalizeSkill(skill: string) {
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    "node.js": "node.js",
    "nodejs": "node.js",
    "react.js": "react",
    "reactjs": "react",
    "rest api": "rest apis",
    "apis": "apis",
    "oop": "object-oriented programming",
    "object oriented programming": "object-oriented programming",
  };

  const normalized = skill.trim().toLowerCase();
  return aliases[normalized] ?? normalized;
}

export default function AnalyzePage() {
  const [level, setLevel] = useState("Beginner");
  const [goal, setGoal] = useState("Get a job");
  const [skills, setSkills] = useState("");
  const [interest, setInterest] = useState("Web Development");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("devpath-ai-profile");

      if (savedData) {
        const data = JSON.parse(savedData);

        if (typeof data.level === "string") setLevel(data.level);
        if (typeof data.goal === "string") setGoal(data.goal);
        if (typeof data.skills === "string") setSkills(data.skills);
        if (
          typeof data.interest === "string" &&
          Object.prototype.hasOwnProperty.call(recommendations, data.interest)
        ) {
          setInterest(data.interest);
        }

        if (
          data.analysis &&
          Array.isArray(data.analysis.userSkills) &&
          Array.isArray(data.analysis.missingSkills) &&
          Array.isArray(data.analysis.roadmap) &&
          Array.isArray(data.analysis.projects)
        ) {
          setAnalysis(data.analysis as Analysis);
        }

        if (Array.isArray(data.completedSteps)) {
          setCompletedSteps(
            data.completedSteps.filter(
              (step: unknown): step is string => typeof step === "string"
            )
          );
        }
      }
    } catch (loadError) {
      console.error("Failed to load saved profile:", loadError);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      const data = {
        level,
        goal,
        skills,
        interest,
        analysis,
        completedSteps,
      };

      localStorage.setItem("devpath-ai-profile", JSON.stringify(data));
    } catch (saveError) {
      console.error("Failed to save profile:", saveError);
    }
  }, [isLoaded, level, goal, skills, interest, analysis, completedSteps]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const userSkills = Array.from(
      new Set(
        skills
          .split(/[,;\\n]/)
          .map((skill) => skill.trim())
          .filter(Boolean)
      )
    );

    if (userSkills.length === 0) {
      setError("Please enter at least one skill to analyze your profile.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          goal,
          skills: userSkills,
          interest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "The AI analysis could not be completed. Please try again."
        );
      }

      const result = data.analysis as Analysis;

      if (
        !result ||
        !Array.isArray(result.userSkills) ||
        !Array.isArray(result.missingSkills) ||
        !Array.isArray(result.roadmap) ||
        !Array.isArray(result.projects)
      ) {
        throw new Error("The AI returned an unexpected response. Please try again.");
      }

      setAnalysis(result);
      setCompletedSteps([]);
    } catch (submitError) {
      console.error("AI analysis failed:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function toggleStep(title: string) {
    setCompletedSteps((current) =>
      current.includes(title)
        ? current.filter((step) => step !== title)
        : [...current, title]
    );
  }

  const progress =
    analysis && analysis.roadmap.length > 0
      ? Math.round((completedSteps.length / analysis.roadmap.length) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#09090f] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-sm text-violet-400 hover:text-violet-300">
          ← Back to Home
        </a>

        <header className="mb-10 mt-8">
          <span className="text-sm font-semibold tracking-[0.2em] text-violet-400">
            DEVELOPER PROFILE
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Build your career roadmap
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-gray-400">
            Analyze your skills, plan your next steps, and track your learning
            progress.
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
            <label htmlFor="skills" className="mb-3 block text-sm font-medium">
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
            options={[
              "Get a job",
              "Build a portfolio",
              "Improve my skills",
              "Prepare for an internship",
              "Start freelancing",
            ]}
          />

          <div className="flex items-end text-sm leading-6 text-gray-500">
            Your selected level is {level.toLowerCase()}. Recommendations are
            based on your chosen career area and the skills you enter.
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400 md:col-span-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isAnalyzing}
            className="rounded-xl bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            {isAnalyzing ? "Analyzing with AI..." : "Analyze My Profile →"}
          </button>
        </form>

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
                  <h3 className="text-2xl font-bold">Learning Roadmap</h3>
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
                            {step.tasks.map((task) => (
                              <li
                                key={task}
                                className="text-sm leading-6 text-gray-300"
                              >
                                <span className="mr-2 text-violet-400">•</span>
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
              <h3 className="text-2xl font-bold">Recommended Projects</h3>
              <p className="mt-2 text-sm text-gray-400">
                Practice your skills by building something real.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {analysis.projects.map((project) => (
                  <article
                    key={project.title}
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
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
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
              Time estimates are approximate. This is a rule-based roadmap,
              not an AI-generated assessment. Your profile and roadmap progress
              are saved in this browser on this device.
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
      <label htmlFor={id} className="mb-3 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#13131d] p-3.5 outline-none focus:border-violet-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
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
      <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
    </article>
  );
}
