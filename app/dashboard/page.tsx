"use client";

import Link from "next/link";
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

type Activity = {
  id: string;
  type:
    | "task_completed"
    | "task_reopened"
    | "step_completed"
    | "step_reopened";
  title: string;
  description: string;
  timestamp: string;
};

type Profile = {
  level: string;
  goal: string;
  skills: string;
  interest: string;
  analysis: Analysis | null;
  completedSteps: string[];
  completedTasks: Record<string, string[]>;
  activityHistory: Activity[];  
};

const STORAGE_KEY = "devpath-ai-profile";

const defaultProfile: Profile = {
  level: "Beginner",
  goal: "Get a job",
  skills: "",
  interest: "Web Development",
  analysis: null,
  completedSteps: [],
  completedTasks: {},
  activityHistory: [],
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);

        setProfile({
          ...defaultProfile,
          ...parsed,
          completedSteps: Array.isArray(parsed.completedSteps)
            ? parsed.completedSteps
            : [],
          completedTasks:
            parsed.completedTasks &&
            typeof parsed.completedTasks === "object"
              ? parsed.completedTasks
              : {},
          activityHistory: Array.isArray(parsed.activityHistory)
          ? parsed.activityHistory
          : [],
        });
      }
    } catch (error) {
      console.error("Could not load dashboard profile:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  const analysis = profile.analysis;
  const roadmap = analysis?.roadmap ?? [];
  const projects = analysis?.projects ?? [];

  const totalSteps = roadmap.length;

  const completedCount = roadmap.filter((step) =>
    profile.completedSteps.includes(step.title)
  ).length;

  const progress =
    totalSteps > 0
      ? Math.round((completedCount / totalSteps) * 100)
      : 0;

  const userSkills = analysis?.userSkills ?? [];
  const missingSkills = analysis?.missingSkills ?? [];

  const toggleExpandedStep = (stepTitle: string) => {
    setExpandedSteps((current) =>
      current.includes(stepTitle)
        ? current.filter((title) => title !== stepTitle)
        : [...current, stepTitle]
    );
  };

  const toggleTask = (stepTitle: string, taskTitle: string) => {
  setProfile((current) => {
    const currentTasks = current.completedTasks || {};
    const stepTasks = currentTasks[stepTitle] || [];

    const isTaskCompleted = stepTasks.includes(taskTitle);

    const updatedTasks = isTaskCompleted
      ? stepTasks.filter((task) => task !== taskTitle)
      : [...stepTasks, taskTitle];

    const updatedCompletedTasks = {
      ...currentTasks,
      [stepTitle]: updatedTasks,
    };

    const roadmapStep = current.analysis?.roadmap.find(
      (step) => step.title === stepTitle
    );

    const allTasksCompleted =
      !!roadmapStep &&
      roadmapStep.tasks.length > 0 &&
      roadmapStep.tasks.every((task) =>
        updatedTasks.includes(task)
      );

    const wasStepCompleted =
      current.completedSteps.includes(stepTitle);

    const updatedCompletedSteps = allTasksCompleted
      ? Array.from(
          new Set([...current.completedSteps, stepTitle])
        )
      : current.completedSteps.filter(
          (title) => title !== stepTitle
        );

    const newActivities: Activity[] = [
      {
        id: `${Date.now()}-task`,
        type: isTaskCompleted
          ? "task_reopened"
          : "task_completed",
        title: isTaskCompleted
          ? "Task reopened"
          : "Task completed",
        description: `${taskTitle} — ${stepTitle}`,
        timestamp: new Date().toISOString(),
      },
    ];

    if (allTasksCompleted && !wasStepCompleted) {
      newActivities.push({
        id: `${Date.now()}-step`,
        type: "step_completed",
        title: "Roadmap step completed",
        description: stepTitle,
        timestamp: new Date().toISOString(),
      });
    }

    if (!allTasksCompleted && wasStepCompleted) {
      newActivities.push({
        id: `${Date.now()}-step-reopened`,
        type: "step_reopened",
        title: "Roadmap step reopened",
        description: stepTitle,
        timestamp: new Date().toISOString(),
      });
    }

    const updatedProfile = {
      ...current,
      completedTasks: updatedCompletedTasks,
      completedSteps: updatedCompletedSteps,
      activityHistory: [
        ...newActivities,
        ...(current.activityHistory || []),
      ].slice(0, 30),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedProfile)
    );

    return updatedProfile;
  });
};

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090f] text-white">
        <p className="text-gray-400">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0d0d15] p-6 lg:block">
          <Link href="/" className="text-2xl font-bold">
            DevPath<span className="text-violet-400"> AI</span>
          </Link>

          <p className="mt-2 text-xs text-gray-500">
            Your AI career companion
          </p>

          <nav className="mt-12 space-y-2">
            <a
              href="#overview"
              className="block rounded-xl bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-300"
            >
              Overview
            </a>

            <a
              href="#roadmap"
              className="block rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Learning Roadmap
            </a>
            <section id="activity" className="mt-12">
  <div>
    <p className="text-sm text-violet-400">
      Your Recent Actions
    </p>

    <h2 className="mt-1 text-2xl font-bold">
      Activity History
    </h2>

    <p className="mt-2 text-sm text-gray-500">
      Keep track of your learning journey.
    </p>
  </div>

  <div className="mt-6 rounded-2xl border border-white/10 bg-[#11111a] p-6">
    {profile.activityHistory.length > 0 ? (
      <div className="space-y-5">
        {profile.activityHistory.map((activity) => {
          const isCompleted =
            activity.type === "task_completed" ||
            activity.type === "step_completed";

          return (
            <div
              key={activity.id}
              className="flex gap-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {isCompleted ? "✓" : "↺"}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-white">
                  {activity.title}
                </h3>

                <p className="mt-1 break-words text-sm text-gray-400">
                  {activity.description}
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="py-8 text-center">
        <div className="text-3xl">📋</div>

                <h3 className="mt-3 font-semibold">
                No activities yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                    Complete your first roadmap task to see your activity here.
                </p>
                </div>
                )}
            </div>
            </section>
            <a
              href="#skills"
              className="block rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              My Skills
            </a>

            <a
              href="#projects"
              className="block rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Projects
            </a>

            <Link
              href="/analyze"
              className="block rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              New Analysis
            </Link>
          </nav>

          <div className="mt-16 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-sm font-semibold text-violet-300">
              Keep Learning
            </p>

            <p className="mt-2 text-xs leading-5 text-gray-400">
              Small steps every day can move you closer to your career goals.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
          <header
            id="overview"
            className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-sm text-violet-400">
                Personal Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Welcome back!
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Track your learning progress and build your future.
              </p>
            </div>

            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >
              New Skill Analysis
            </Link>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Known Skills"
              value={userSkills.length}
              description="Skills you already have"
            />

            <StatCard
              title="Skills to Learn"
              value={missingSkills.length}
              description="Skills to improve"
            />

            <StatCard
              title="Completed Steps"
              value={`${completedCount}/${totalSteps}`}
              description="Roadmap milestones"
            />

            <StatCard
              title="Recommended Projects"
              value={projects.length}
              description="Projects to build"
            />
          </section>

          <section className="mt-8 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-600/15 to-[#171323] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-violet-300">
                  Your Career Goal
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {profile.goal}
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  {profile.interest} · {profile.level} Level
                </p>
              </div>

              <div className="w-full md:max-w-xs">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-400">
                    Overall Progress
                  </span>

                  <span className="font-semibold text-violet-300">
                    {progress}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {completedCount} of {totalSteps} steps completed
                </p>
              </div>
            </div>
          </section>

          <section id="roadmap" className="mt-10">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm text-violet-400">
                  Your Learning Journey
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Learning Roadmap
                </h2>
              </div>

              <p className="text-sm text-gray-500">
                Expand a step to see its tasks.
              </p>
            </div>

            {analysis ? (
              <div className="mt-7 space-y-4">
                {roadmap.map((step, index) => {
                  const isExpanded = expandedSteps.includes(step.title);

                  const completedTasks =
                    profile.completedTasks?.[step.title] || [];

                  const completedTaskCount = step.tasks.filter(
                    (task) => completedTasks.includes(task)
                  ).length;

                  const taskProgress =
                    step.tasks.length > 0
                      ? Math.round(
                          (completedTaskCount / step.tasks.length) * 100
                        )
                      : 0;

                  const completed = profile.completedSteps.includes(
                    step.title
                  );

                  return (
                    <div
                      key={`${step.title}-${index}`}
                      className={`overflow-hidden rounded-xl border transition ${
                        completed
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-white/10 bg-[#13131d]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpandedStep(step.title)}
                        aria-expanded={isExpanded}
                        className="flex w-full items-center gap-4 p-5 text-left"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            completed
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-violet-500/10 text-violet-400"
                          }`}
                        >
                          {completed ? "✓" : index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white">
                            {step.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {step.duration}
                          </p>

                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-emerald-400 transition-all"
                                style={{ width: `${taskProgress}%` }}
                              />
                            </div>

                            <span className="text-xs text-gray-400">
                              {completedTaskCount}/{step.tasks.length} tasks
                            </span>
                          </div>
                        </div>

                        <span className="text-gray-400">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/10 px-5 pb-5 pt-4">
                          {step.description && (
                            <p className="mb-5 text-sm leading-6 text-gray-400">
                              {step.description}
                            </p>
                          )}

                          <h4 className="mb-3 text-sm font-semibold text-white">
                            Tasks to complete
                          </h4>

                          <div className="space-y-3">
                            {step.tasks.map((task, taskIndex) => {
                              const isTaskCompleted =
                                completedTasks.includes(task);

                              return (
                                <label
                                  key={`${task}-${taskIndex}`}
                                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.05]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isTaskCompleted}
                                    onChange={() =>
                                      toggleTask(step.title, task)
                                    }
                                    className="mt-1 h-4 w-4 accent-violet-500"
                                  />

                                  <span
                                    className={`text-sm leading-6 ${
                                      isTaskCompleted
                                        ? "text-gray-500 line-through"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {task}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          <div className="mt-4 text-xs text-gray-500">
                            {completed
                              ? "You have completed this roadmap step!"
                              : `${taskProgress}% completed`}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No roadmap available yet"
                description="Generate your skill analysis to get a personalized learning roadmap."
                buttonText="Create Skill Analysis"
                href="/analyze"
              />
            )}
          </section>

          <section id="skills" className="mt-12 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#11111a] p-6">
              <p className="text-sm text-violet-400">
                Your Strengths
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Skills You Have
              </h2>

              {userSkills.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {userSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  Your analyzed skills will appear here.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11111a] p-6">
              <p className="text-sm text-violet-400">
                Growth Opportunities
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Skills to Improve
              </h2>

              {missingSkills.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {missingSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  Your missing skills will appear after analysis.
                </p>
              )}
            </div>
          </section>

          <section id="projects" className="mt-12 pb-10">
            <div>
              <p className="text-sm text-violet-400">
                Build Your Portfolio
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Recommended Projects
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Practice your skills with projects selected for your career goal.
              </p>
            </div>

            {projects.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project, index) => (
                  <div
                    key={`${project.title}-${index}`}
                    className="rounded-2xl border border-white/10 bg-[#11111a] p-5 transition hover:-translate-y-1 hover:border-violet-500/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">
                        {project.title}
                      </h3>

                      <span className="shrink-0 rounded-md bg-violet-500/10 px-2 py-1 text-xs text-violet-300">
                        {project.difficulty}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-400">
                      {project.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.skills.map((skill, skillIndex) => (
                        <span
                          key={`${skill}-${skillIndex}`}
                          className="rounded-md bg-white/5 px-2 py-1 text-xs text-gray-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No projects available"
                description="Generate your AI analysis to receive project recommendations."
                buttonText="Generate Projects"
                href="/analyze"
              />
            )}
          </section>

          <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-600">
            DevPath AI · Build skills. Track progress. Grow your career.
          </footer>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
      <p className="text-sm text-gray-400">{title}</p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  buttonText,
  href,
}: {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#11111a] px-6 py-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
      >
        {buttonText}
      </Link>
    </div>
  );
}