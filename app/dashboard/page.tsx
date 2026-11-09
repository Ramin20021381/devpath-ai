"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  difficulty: string;
};

type Analysis = {
  userSkills: string[];
  missingSkills: string[];
  roadmap: RoadmapStep[];
  projects: Project[];
};

type Activity = {
  type: string;
  description: string;
  timestamp: string;
};

type Profile = {
  level: string;
  goal: string;
  skills: string;
  interest: string;
  analysis: Analysis | null;
  completedTasks: Record<string, boolean>;
  activityHistory: Activity[];
};

const defaultProfile: Profile = {
  level: "Beginner",
  goal: "Get a job",
  skills: "",
  interest: "Web Development",
  analysis: null,
  completedTasks: {},
  activityHistory: [],
};

function getTaskKey(stepIndex: number, taskIndex: number) {
  return `${stepIndex}-${taskIndex}`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

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

      setUserEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile loading error:", error);
        return;
      }

      if (data) {
        setProfile({
          level: data.level ?? "Beginner",
          goal: data.goal ?? "Get a job",
          skills: data.skills ?? "",
          interest: data.interest ?? "Web Development",
          analysis: data.analysis ?? null,
          completedTasks: data.completed_tasks ?? {},
          activityHistory: data.activity_history ?? [],
        });
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(updatedProfile: Profile) {
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          level: updatedProfile.level,
          goal: updatedProfile.goal,
          skills: updatedProfile.skills,
          interest: updatedProfile.interest,
          analysis: updatedProfile.analysis,
          completed_tasks: updatedProfile.completedTasks,
          activity_history: updatedProfile.activityHistory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Profile saving error:", error);
      }
    } catch (error) {
      console.error("Saving error:", error);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(
    stepIndex: number,
    taskIndex: number,
    taskTitle: string
  ) {
    const key = getTaskKey(stepIndex, taskIndex);
    const isCompleted = Boolean(profile.completedTasks[key]);

    const updatedTasks = {
      ...profile.completedTasks,
      [key]: !isCompleted,
    };

    const newActivity: Activity = {
      type: isCompleted ? "reopened" : "completed",
      description: isCompleted
        ? `Reopened task: ${taskTitle}`
        : `Completed task: ${taskTitle}`,
      timestamp: new Date().toISOString(),
    };

    const updatedProfile: Profile = {
      ...profile,
      completedTasks: updatedTasks,
      activityHistory: [
        newActivity,
        ...profile.activityHistory,
      ].slice(0, 30),
    };

    setProfile(updatedProfile);
    await saveProfile(updatedProfile);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const roadmap = profile.analysis?.roadmap ?? [];
  const projects = profile.analysis?.projects ?? [];

  const totalTasks = roadmap.reduce(
    (total, step) => total + (step.tasks?.length ?? 0),
    0
  );

  const completedTaskCount = roadmap.reduce(
    (total, step, stepIndex) =>
      total +
      (step.tasks?.filter(
        (_, taskIndex) =>
          profile.completedTasks[
            getTaskKey(stepIndex, taskIndex)
          ]
      ).length ?? 0),
    0
  );

  const overallProgress =
    totalTasks > 0
      ? Math.round((completedTaskCount / totalTasks) * 100)
      : 0;

  const completedSteps = roadmap.filter(
    (step, stepIndex) =>
      step.tasks.length > 0 &&
      step.tasks.every(
        (_, taskIndex) =>
          profile.completedTasks[
            getTaskKey(stepIndex, taskIndex)
          ]
      )
  ).length;

  const skills = profile.skills
    .split(/[,;\n]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090f] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0d0d16] p-6 md:flex md:flex-col">
          <Link href="/" className="mb-12 text-2xl font-bold">
            DevPath<span className="text-violet-400"> AI</span>
          </Link>

          <nav className="flex-1 space-y-2">
            {[
              ["Overview", "#overview"],
              ["Progress", "#progress"],
              ["Learning Roadmap", "#roadmap"],
              ["My Skills", "#skills"],
              ["Projects", "#projects"],
              ["Activity History", "#activity"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="block rounded-xl px-4 py-3 text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="border-t border-white/10 pt-6">
            <p className="mb-3 truncate text-xs text-gray-500">
              {userEmail}
            </p>

            <button
              onClick={handleLogout}
              className="w-full rounded-xl px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <div className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12">

          {/* HEADER */}

          <header
            id="overview"
            className="mb-10 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p className="mb-2 text-sm text-violet-400">
                YOUR DEVELOPER SPACE
              </p>

              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                Dashboard
                </h1>

                <Link
                  href="/settings"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white"
                >
                ⚙ Settings
                </Link>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                Track your learning journey and keep growing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
                {saving ? "Saving..." : "Changes saved"}
              </span>

              <Link
                href="/analyze"
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
              >
                New Analysis
              </Link>
            </div>
          </header>

          {/* WELCOME */}

          <section className="mb-8 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 via-[#171326] to-[#11111b] p-7 sm:p-9">
            <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
              Your personal learning space
            </span>

            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
              Keep moving forward.
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-gray-400">
              Every completed task brings you closer to your career
              goals. Stay consistent, build projects, and improve
              your skills.
            </p>

            <Link
              href="/analyze"
              className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Continue Learning →
            </Link>
          </section>

          {/* STATISTICS */}

          <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Overall Progress"
              value={`${overallProgress}%`}
              subtitle="Task completion"
              icon="📈"
            />

            <StatCard
              title="Completed Tasks"
              value={`${completedTaskCount}`}
              subtitle={`Out of ${totalTasks} tasks`}
              icon="✅"
            />

            <StatCard
              title="Completed Steps"
              value={`${completedSteps}`}
              subtitle={`Out of ${roadmap.length} stages`}
              icon="📚"
            />

            <StatCard
              title="Recommended Projects"
              value={`${projects.length}`}
              subtitle="Projects to build"
              icon="💻"
            />
          </section>

          {/* PROGRESS CHART */}

          <section
            id="progress"
            className="mb-10 grid gap-6 lg:grid-cols-3"
          >
            <div className="rounded-3xl border border-white/10 bg-[#11111b] p-6">
              <h2 className="text-lg font-bold">
                Overall Progress
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Based on completed tasks
              </p>

              <div className="flex flex-col items-center py-8">
                <div
                  className="relative flex h-48 w-48 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#8b5cf6 ${overallProgress}%, #272338 ${overallProgress}% 100%)`,
                  }}
                >
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[#11111b]">
                    <span className="text-4xl font-bold">
                      {overallProgress}%
                    </span>

                    <span className="mt-1 text-xs text-gray-500">
                      Completed
                    </span>
                  </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-400">
                  {completedTaskCount} of {totalTasks} tasks completed.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                  Completed
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#272338]" />
                  Remaining
                </span>
              </div>
            </div>

            {/* STEP PROGRESS */}

            <div className="rounded-3xl border border-white/10 bg-[#11111b] p-6 lg:col-span-2">
              <h2 className="text-lg font-bold">
                Progress by Learning Stage
              </h2>

              <p className="mb-8 mt-1 text-sm text-gray-500">
                Complete individual tasks to increase your progress.
              </p>

              {roadmap.length > 0 ? (
                <div className="space-y-7">
                  {roadmap.map((step, stepIndex) => {
                    const tasks = step.tasks ?? [];
                    const completed = tasks.filter(
                      (_, taskIndex) =>
                        profile.completedTasks[
                          getTaskKey(stepIndex, taskIndex)
                        ]
                    ).length;

                    const percentage =
                      tasks.length > 0
                        ? Math.round((completed / tasks.length) * 100)
                        : 0;

                    return (
                      <div key={`${step.title}-${stepIndex}`}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium text-gray-200">
                            {stepIndex + 1}. {step.title}
                          </span>

                          <span className="shrink-0 text-xs text-violet-300">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-violet-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-gray-600">
                          {completed} of {tasks.length} tasks completed
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No roadmap yet"
                  description="Generate your first learning roadmap to see your progress here."
                  buttonText="Create Roadmap"
                  href="/analyze"
                />
              )}
            </div>
          </section>

          {/* LEARNING ROADMAP */}

          <section
            id="roadmap"
            className="mb-10 rounded-3xl border border-white/10 bg-[#11111b] p-6 sm:p-8"
          >
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Learning Roadmap
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Check off individual tasks as you complete them.
                </p>
              </div>

              <span className="rounded-full bg-violet-500/10 px-4 py-2 text-xs text-violet-300">
                {completedTaskCount}/{totalTasks} Tasks
              </span>
            </div>

            {roadmap.length > 0 ? (
              <div className="space-y-5">
                {roadmap.map((step, stepIndex) => {
                  const tasks = step.tasks ?? [];

                  const completed = tasks.filter(
                    (_, taskIndex) =>
                      profile.completedTasks[
                        getTaskKey(stepIndex, taskIndex)
                      ]
                  ).length;

                  const percentage =
                    tasks.length > 0
                      ? Math.round((completed / tasks.length) * 100)
                      : 0;

                  return (
                    <div
                      key={`${step.title}-${stepIndex}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 font-bold text-violet-400">
                            {stepIndex + 1}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-semibold">
                              {step.title}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-gray-400">
                              {step.description}
                            </p>

                            <span className="mt-3 inline-block text-xs text-violet-300">
                              Duration: {step.duration}
                            </span>
                          </div>
                        </div>

                        <span className="rounded-full bg-violet-500/10 px-3 py-2 text-xs text-violet-300">
                          {percentage}% Complete
                        </span>
                      </div>

                      {/* INDIVIDUAL TASKS */}

                      <div className="mt-6 border-t border-white/10 pt-5">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-400">
                            Learning Tasks
                          </p>

                          <p className="text-xs text-gray-500">
                            {completed}/{tasks.length}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {tasks.map((task, taskIndex) => {
                            const key = getTaskKey(
                              stepIndex,
                              taskIndex
                            );

                            const isCompleted = Boolean(
                              profile.completedTasks[key]
                            );

                            return (
                              <label
                                key={key}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                                  isCompleted
                                    ? "border-green-500/20 bg-green-500/5"
                                    : "border-white/5 bg-white/[0.02] hover:border-violet-500/30"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() =>
                                    toggleTask(
                                      stepIndex,
                                      taskIndex,
                                      task
                                    )
                                  }
                                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-violet-500"
                                />

                                <span
                                  className={`text-sm leading-6 ${
                                    isCompleted
                                      ? "text-green-400 line-through"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {task}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Your roadmap is waiting"
                description="Complete your first AI analysis to generate a personalized learning roadmap."
                buttonText="Generate Roadmap"
                href="/analyze"
              />
            )}
          </section>

          {/* SKILLS */}

          <section
            id="skills"
            className="mb-10 rounded-3xl border border-white/10 bg-[#11111b] p-6 sm:p-8"
          >
            <h2 className="text-xl font-bold">
              My Skills
            </h2>

            <p className="mb-6 mt-1 text-sm text-gray-500">
              Skills you currently have
            </p>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No skills added yet.
              </p>
            )}

            {profile.analysis?.missingSkills &&
              profile.analysis.missingSkills.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-300">
                    Skills to Learn
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {profile.analysis.missingSkills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
          </section>

          {/* PROJECTS */}

          <section id="projects" className="mb-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Recommended Projects
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Practical projects to improve your portfolio
              </p>
            </div>

            {projects.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project, index) => (
                  <div
                    key={`${project.title}-${index}`}
                    className="rounded-3xl border border-white/10 bg-[#11111b] p-6 transition hover:-translate-y-1 hover:border-violet-500/30"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-2xl">💻</span>

                      <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                        {project.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold">
                      {project.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-gray-400">
                      {project.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.skills?.map((skill, skillIndex) => (
                        <span
                          key={`${skill}-${skillIndex}`}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#11111b] p-8">
                <EmptyState
                  title="No projects yet"
                  description="Your AI analysis will recommend projects based on your career goals."
                  buttonText="Get Project Ideas"
                  href="/analyze"
                />
              </div>
            )}
          </section>

          {/* ACTIVITY HISTORY */}

          <section
            id="activity"
            className="mb-10 rounded-3xl border border-white/10 bg-[#11111b] p-6 sm:p-8"
          >
            <h2 className="text-xl font-bold">
              Activity History
            </h2>
            
            <p className="mb-7 mt-1 text-sm text-gray-500">
              Your recent learning activities
            </p>

            {profile.activityHistory.length > 0 ? (
              <div className="space-y-5">
                {profile.activityHistory.map((activity, index) => (
                  <div
                    key={`${activity.timestamp}-${index}`}
                    className="flex items-start gap-4"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        activity.type === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-orange-500/10 text-orange-400"
                      }`}
                    >
                      {activity.type === "completed" ? "✓" : "↻"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-300">
                        {activity.description}
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <p className="text-sm text-gray-400">
                  Your activity will appear here when you complete tasks.
                </p>
              </div>
            )}
          </section>

          {/* PROFILE */}

          <section className="mb-10 rounded-3xl border border-white/10 bg-[#11111b] p-6 sm:p-8">
            <h2 className="text-xl font-bold">
              Developer Profile
            </h2>

            <p className="mb-6 mt-1 text-sm text-gray-500">
              Your current learning preferences
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <ProfileItem
                label="Email"
                value={userEmail || "Not available"}
              />

              <ProfileItem
                label="Experience Level"
                value={profile.level}
              />

              <ProfileItem
                label="Career Goal"
                value={profile.goal}
              />

              <ProfileItem
                label="Main Interest"
                value={profile.interest}
              />
            </div>

            <Link
              href="/analyze"
              className="mt-7 inline-flex rounded-xl border border-violet-500/30 px-5 py-3 text-sm text-violet-300 transition hover:bg-violet-500/10"
            >
              Update My Profile →
            </Link>
          </section>

          <footer className="border-t border-white/10 py-8 text-center text-xs text-gray-600">
            DevPath AI © 2026 — Built for your growth.
          </footer>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#11111b] p-5 transition hover:border-violet-500/30">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <span className="text-xl">{icon}</span>
      </div>

      <p className="text-3xl font-bold">{value}</p>

      <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="mb-2 text-xs text-gray-500">{label}</p>

      <p className="break-words text-sm font-medium text-gray-200">
        {value}
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
    <div className="py-8 text-center">
      <div className="mb-4 text-4xl">🚀</div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
      >
        {buttonText}
      </Link> 
    </div>
  );
}
