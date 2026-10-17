import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = ?').get('user-current') as any;

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Compute live stats from database
    const submittedCount = (db.prepare(`SELECT COUNT(*) as c FROM items WHERE reporter_user_id = 'user-current'`).get() as any)?.c || 0;
    const resolvedCount = (db.prepare(`SELECT COUNT(*) as c FROM items WHERE reporter_user_id = 'user-current' AND (status = 'Claimed' OR status = 'Resolved')`).get() as any)?.c || 0;
    const activeSearches = (db.prepare(`SELECT COUNT(*) as c FROM searches`).get() as any)?.c || 0;

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        memberSince: profile.member_since,
        trustScore: profile.trust_score,
        hasCustomApiKey: !!profile.gemini_api_key,
        stats: {
          submittedCount,
          resolvedCount,
          activeSearches,
          aiMatchRate: 98,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { name, email, phone, geminiApiKey } = body;

    let sql = 'UPDATE user_profile SET name = ?, email = ?, phone = ?';
    const params: any[] = [name, email, phone];

    if (geminiApiKey !== undefined) {
      sql += ', gemini_api_key = ?';
      params.push(geminiApiKey);
    }

    sql += ' WHERE id = ?';
    params.push('user-current');

    db.prepare(sql).run(...params);

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
