// /app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../_libs/supabaseServerClient';  // <- path อ้างอิงตามจริง

// GET /api/transactions?user_id=...
export async function GET(request: Request) {
  // รับค่า user_id จาก query string
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request: Request) {
  try {
    const transaction = await request.json();

    // เช็คว่ามี user_id ไหม
    if (!transaction.user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // ถ้าไม่ได้ส่ง created_at มา ก็ set ให้เป็น now
    if (!transaction.created_at) {
      transaction.created_at = new Date().toISOString();
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding transaction:', error);
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
  }
}

// DELETE /api/transactions?id=...
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
