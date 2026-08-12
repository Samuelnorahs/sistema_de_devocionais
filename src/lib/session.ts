import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireReviewAccess() {
  const session = await requireAdmin();
  const { canReview } = await import("@/lib/auth");
  if (!canReview(session.user.role)) {
    redirect("/admin");
  }
  return session;
}

export async function requireUploadAccess() {
  const session = await requireAdmin();
  const { canUpload } = await import("@/lib/auth");
  if (!canUpload(session.user.role)) {
    redirect("/admin");
  }
  return session;
}
