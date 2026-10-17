import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM searches ORDER BY timestamp DESC LIMIT 20').all() as any[];
    return NextResponse.json({ success: true, history: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      db.prepare('DELETE FROM searches WHERE id = ?').run(id);
    } else {
      db.prepare('DELETE FROM searches').run();
    }

    return NextResponse.json({ success: true, message: 'History cleared' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
