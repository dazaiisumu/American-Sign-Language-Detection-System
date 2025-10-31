import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/users/total`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      totalUsers: data.totalUsers ?? 0,
    });
  } catch (error) {
    console.error("Failed to fetch total users:", error);
    return NextResponse.json(
      { totalUsers: 0, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
