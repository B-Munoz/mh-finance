import { NextRequest } from "next/server";
import { requireUser, apiError } from "@/lib/requireUser";
import { loadExpenses, addExpense } from "@/lib/services/expense";

export async function GET(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    return Response.json(await loadExpenses(userKey));
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userKey } = await requireUser(req);
    const { category, description, amount } = await req.json();
    const expense = await addExpense(userKey, category, description, amount);
    return Response.json(expense, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}
