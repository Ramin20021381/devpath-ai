import { NextResponse } from "next/server";

type RequestBody = {
  level?: unknown;
  goal?: unknown;
  skills?: unknown;
  interest?: unknown;
};

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

const allowedLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const allowedGoals = [
  "Get a job",
  "Build a portfolio",
  "Improve my skills",
  "Prepare for an internship",
  "Start freelancing",
];

const allowedInterests = [
  "Web Development",
  "Frontend Development",
  "Backend Development",
  "Artificial Intelligence",
  "Game Development",
  "Mobile Development",
  "Cybersecurity",
];

const MODEL = "openai/gpt-oss-20b";

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

function isValidDifficulty(
  value: unknown
): value is Project["difficulty"] {
  return (
    value === "Beginner" ||
    value === "Intermediate" ||
    value === "Advanced"
  );
}

function validateAnalysis(value: unknown): value is Analysis {
  if (!value || typeof value !== "object") {
    return false;
  }

  const analysis = value as Analysis;

  const validRoadmap =
    Array.isArray(analysis.roadmap) &&
    analysis.roadmap.length >= 3 &&
    analysis.roadmap.length <= 5 &&
    analysis.roadmap.every(
      (step) =>
        typeof step?.title === "string" &&
        typeof step?.description === "string" &&
        typeof step?.duration === "string" &&
        isStringArray(step?.tasks) &&
        step.tasks.length === 3
    );

  const validProjects =
    Array.isArray(analysis.projects) &&
    analysis.projects.length === 3 &&
    analysis.projects.every(
      (project) =>
        typeof project?.title === "string" &&
        typeof project?.description === "string" &&
        isStringArray(project?.skills) &&
        isValidDifficulty(project?.difficulty)
    );

  return (
    isStringArray(analysis.userSkills) &&
    isStringArray(analysis.missingSkills) &&
    validRoadmap &&
    validProjects
  );
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is missing. Add it to .env.local and restart the development server.",
        },
        { status: 500 }
      );
    }

    let body: RequestBody;

    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        {
          error: "The request body must be valid JSON.",
        },
        { status: 400 }
      );
    }

    const level =
      typeof body.level === "string" ? body.level : "";

    const goal =
      typeof body.goal === "string" ? body.goal : "";

    const interest =
      typeof body.interest === "string"
        ? body.interest
        : "";

    const skills = Array.isArray(body.skills)
      ? body.skills
          .filter(
            (skill): skill is string =>
              typeof skill === "string" &&
              skill.trim().length > 0
          )
          .map((skill) => skill.trim())
          .slice(0, 30)
      : [];

    if (
      !allowedLevels.includes(level) ||
      !allowedGoals.includes(goal) ||
      !allowedInterests.includes(interest) ||
      skills.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid level, career goal, career area, and at least one skill.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are DevPath AI, a practical career-learning assistant for software developers.

Create a realistic, encouraging learning roadmap based on the user's profile.
Do not promise guaranteed employment.

Return only valid JSON with this exact structure:

{
  "userSkills": ["string"],
  "missingSkills": ["string"],
  "roadmap": [
    {
      "title": "string",
      "description": "string",
      "duration": "string",
      "tasks": ["string", "string", "string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "skills": ["string"],
      "difficulty": "Beginner | Intermediate | Advanced"
    }
  ]
}

Requirements:
- Clean up the user's supplied skills.
- Suggest 3 to 7 relevant missing skills.
- Do not list known skills as missing skills.
- Create 3 to 5 ordered roadmap steps.
- Each roadmap step must have exactly 3 actionable tasks.
- Suggest exactly 3 feasible portfolio projects.
- Include useful skill tags and difficulty for each project.
- Tailor recommendations to the user's goal and experience level.
- Keep all content in English.
- Do not include Markdown fences or text outside the JSON.

User profile:
Level: ${level}
Career goal: ${goal}
Career area: ${interest}
Known skills: ${skills.join(", ")}
`;

    let upstream: Response;

    try {
      upstream = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are DevPath AI. Return only valid JSON matching the requested structure.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_completion_tokens: 6000,
          response_format: {
            type: "json_object",
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(60000),
      });
    } catch (error) {
      console.error("Groq connection error:", error);

      return NextResponse.json(
        {
          error:
            "Could not connect to Groq. Check your internet connection and try again.",
        },
        { status: 502 }
      );
    }

    const responseText = await upstream.text();

    let upstreamData: any;

    try {
      upstreamData = JSON.parse(responseText);
    } catch {
      console.error(
        "Groq returned a non-JSON response:",
        upstream.status,
        responseText.slice(0, 2000)
      );

      return NextResponse.json(
        {
          error:
            "Groq returned an unexpected response. Check the server terminal.",
        },
        { status: 502 }
      );
    }

    if (!upstream.ok) {
      const message =
        upstreamData?.error?.message ||
        upstreamData?.message ||
        "Unknown Groq API error";

      console.error("Groq API error:", {
        status: upstream.status,
        message,
        details: upstreamData,
      });

      return NextResponse.json(
        {
          error: `Groq API request failed (${upstream.status}): ${message}`,
        },
        { status: upstream.status }
      );
    }

    const text =
      upstreamData?.choices?.[0]?.message?.content;

    if (typeof text !== "string" || text.trim().length === 0) {
      console.error(
        "Groq returned an empty response:",
        JSON.stringify(upstreamData, null, 2)
      );

      return NextResponse.json(
        {
          error: "Groq returned an empty response. Please try again.",
        },
        { status: 502 }
      );
    }

    let analysis: unknown;

    try {
      analysis = JSON.parse(text);
    } catch {
      console.error(
        "Groq returned invalid JSON:",
        text.slice(0, 2000)
      );

      return NextResponse.json(
        {
          error: "Groq returned invalid JSON. Please try again.",
        },
        { status: 502 }
      );
    }

    if (!validateAnalysis(analysis)) {
      console.error(
        "Unexpected Groq response structure:",
        JSON.stringify(analysis, null, 2)
      );

      return NextResponse.json(
        {
          error:
            "Groq returned data in an unexpected format. Please try again.",
        },
        { status: 502 }
      );
    }

    console.log(
      `DevPath AI analysis completed successfully using ${MODEL}.`
    );

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analyze route error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while analyzing your profile. Check the server terminal.",
      },
      { status: 500 }
    );
  }
}