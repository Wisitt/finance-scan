/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createSupabaseServerClient } from "../_libs/supabaseServerClient";
import { getSessionUser } from "../_libs/authHelpers";

// GET /api/transactions
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Properly await the supabase client
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("date", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request: NextRequest) {
  console.log("📌 Request received at /api/transactions");
  
  const { user, error } = await getSessionUser();
  console.log("🔍 Session User:", user, "Error:", error);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transaction = await request.json();

  if (!transaction.amount || !transaction.category || !transaction.date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  transaction.user_id = user.id;
  transaction.created_at = new Date().toISOString();

  // Properly await the supabase client
  const supabase = await createSupabaseServerClient();
  const { data, error: insertError } = await supabase
    .from("transactions")
    .insert(transaction)
    .select()
    .single();

  if (insertError) {
    console.error("❌ Supabase Insert Error:", insertError);
    return NextResponse.json({ error: "Failed to insert transaction", details: insertError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/transactions
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
  }

  try {
    // Properly await the supabase client
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}