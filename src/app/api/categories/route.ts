// app/api/categories/route.ts

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../_libs/supabaseServerClient";

export async function GET() {
  // Need to await this function call
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }

  return NextResponse.json(data);
}