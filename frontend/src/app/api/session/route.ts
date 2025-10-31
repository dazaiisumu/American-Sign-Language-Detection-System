import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const res = await fetch(`${API_BASE_URL}/sessions?page=${page}&limit=${limit}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      sessions: data.sessions || [],
      totalPages: data.totalPages ?? 1,
      currentPage: data.currentPage ?? page,
      totalSessions: data.totalSessions ?? data.sessions?.length ?? 0,
    });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      {
        sessions: [],
        totalPages: 1,
        currentPage: page,
        totalSessions: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
