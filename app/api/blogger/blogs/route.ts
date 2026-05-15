import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUserBlogs } from "@/lib/blogger";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const blogs = await listUserBlogs(session.user.id);
    return NextResponse.json(blogs);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch blogs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
