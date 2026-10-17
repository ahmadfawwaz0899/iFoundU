import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const messages = db.prepare('SELECT * FROM chat_messages WHERE item_id = ? ORDER BY timestamp ASC').all(id);
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await req.json();
    const { senderName, senderRole, message } = body;

    if (!message || !senderName) {
      return NextResponse.json({ success: false, error: 'Message and sender name are required' }, { status: 400 });
    }

    const msgId = `msg-${Date.now()}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO chat_messages (id, item_id, sender_name, sender_role, message, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      msgId,
      id,
      senderName,
      senderRole || 'claimant',
      message,
      now
    );

    return NextResponse.json({
      success: true,
      message: {
        id: msgId,
        itemId: id,
        senderName,
        senderRole: senderRole || 'claimant',
        message,
        timestamp: now,
      },
    });
  } catch (error: any) {
    console.error('Error posting chat message:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
