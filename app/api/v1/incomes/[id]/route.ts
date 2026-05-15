import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { deleteIncome } from "@/lib/services/income";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userKey } = await requireUser(req);
    const { id } = await params;
    const found = await deleteIncome(userKey, Number(id));
    if (!found) return Response.json({ detail: "Income record not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err) {
    return apiError(err);
  }
}
