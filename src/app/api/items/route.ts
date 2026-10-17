import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { LostFoundItem } from '@/types';

function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'lost' | 'found'
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');

    let sql = 'SELECT * FROM items WHERE 1=1';
    const params: any[] = [];

    if (type && (type === 'lost' || type === 'found')) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (userId) {
      sql += ' AND reporter_user_id = ?';
      params.push(userId);
    }

    if (query && query.trim()) {
      const q = `%${query.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(location) LIKE ? OR LOWER(description) LIKE ? OR LOWER(brand) LIKE ?)';
      params.push(q, q, q, q);

      // Log search query in background
      try {
        db.prepare(`
          INSERT INTO searches (id, query, category, result_count, timestamp)
          VALUES (?, ?, ?, ?, ?)
        `).run(`sh-${Date.now()}`, query.trim(), category || 'All', 0, Date.now());
      } catch (e) {
        // ignore
      }
    }

    sql += ' ORDER BY created_at DESC';

    const rows = db.prepare(sql).all(...params) as any[];

    const items: LostFoundItem[] = rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      category: r.category,
      location: r.location,
      specificLocation: r.specific_location,
      date: r.date,
      timeAgo: formatTimeAgo(r.created_at),
      imageUrl: r.image_url,
      description: r.description,
      aiDetectedFeatures: {
        brand: r.brand,
        color: r.color,
        model: r.model,
        distinctMarks: r.distinct_marks,
        confidence: r.confidence,
      },
      status: r.status,
      reporterName: r.reporter_name,
      reporterContact: r.reporter_contact,
    }));

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const {
      type,
      title,
      category,
      location,
      specificLocation,
      imageUrl,
      description,
      brand,
      color,
      model,
      distinctMarks,
      confidence,
      reporterName,
      reporterContact,
    } = body;

    if (!type || !title || !category || !location) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();
    const dateStr = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO items (
        id, type, title, category, location, specific_location, date, created_at,
        image_url, description, brand, color, model, distinct_marks, confidence,
        status, reporter_name, reporter_contact, reporter_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      type,
      title,
      category,
      location,
      specificLocation || '',
      dateStr,
      now,
      imageUrl || 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
      description || 'Item reported via IFoundU scanner.',
      brand || '',
      color || 'Unknown',
      model || '',
      distinctMarks || '',
      confidence || 96.0,
      'Open',
      reporterName || 'Alex Chen',
      reporterContact || 'alex.chen@example.com',
      'user-current'
    );

    // Update submitted count in user_profile
    try {
      db.prepare(`
        UPDATE user_profile 
        SET member_since = member_since 
        WHERE id = 'user-current'
      `).run();
    } catch (e) {
      // ignore
    }

    const createdItem: LostFoundItem = {
      id,
      type,
      title,
      category,
      location,
      specificLocation,
      date: dateStr,
      timeAgo: 'Just now',
      imageUrl: imageUrl || '',
      description: description || '',
      aiDetectedFeatures: {
        brand,
        color: color || 'Unknown',
        model,
        distinctMarks,
        confidence: confidence || 96.0,
      },
      status: 'Open',
      reporterName: reporterName || 'Alex Chen',
      reporterContact: reporterContact || 'alex.chen@example.com',
    };

    return NextResponse.json({ success: true, item: createdItem }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
