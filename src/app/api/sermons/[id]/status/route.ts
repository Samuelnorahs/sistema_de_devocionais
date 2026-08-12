import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSermonProcessingStatus } from "@/lib/pipeline";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sermon = await getSermonProcessingStatus(id);

  if (!sermon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: sermon.status,
    errorMessage: sermon.errorMessage,
    jobs: sermon.jobs,
  });
}
