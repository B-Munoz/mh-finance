import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { deleteCategory, renameCategory } from "@/lib/services/settings";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { userKey } = await requireUser(req);
    const { name } = await params;
    await deleteCategory(userKey, decodeURIComponent(name));
    return Response.json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { userKey } = await requireUser(req);
    const { name } = await params;
    const { new_name } = await req.json();
    await renameCategory(userKey, decodeURIComponent(name), new_name.trim());
    return Response.json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
