import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as any;
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    const claims = db.prepare('SELECT * FROM claims WHERE item_id = ? ORDER BY created_at DESC').all(id) as any[];
    const chatMessages = db.prepare('SELECT * FROM chat_messages WHERE item_id = ? ORDER BY timestamp ASC').all(id) as any[];

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        type: item.type,
        title: item.title,
        category: item.category,
        location: item.location,
        specificLocation: item.specific_location,
        date: item.date,
        createdAt: item.created_at,
        imageUrl: item.image_url,
        description: item.description,
        aiDetectedFeatures: {
          brand: item.brand,
          color: item.color,
          model: item.model,
          distinctMarks: item.distinct_marks,
          confidence: item.confidence,
        },
        status: item.status,
        reporterName: item.reporter_name,
        reporterContact: item.reporter_contact,
        reporterUserId: item.reporter_user_id,
      },
      claims,
      chatMessages,
    });
  } catch (error: any) {
    console.error('Error fetching item details:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
