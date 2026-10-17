import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { analyzeItemImage, findDatabaseMatches } from '@/lib/aiVision';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, intent = 'found', customApiKey } = body;

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    // 1. Perform AI Vision Feature Extraction
    const extraction = await analyzeItemImage(imageBase64, intent, customApiKey);

    // 2. Fetch opposite-type items from SQLite database to calculate matches
    const db = getDb();
    const oppositeType = intent === 'found' ? 'lost' : 'found';
    const candidateRows = db.prepare(`
      SELECT id, title, category, brand, color, description, location, image_url, created_at, status
      FROM items
      WHERE type = ? AND status != 'Resolved'
      ORDER BY created_at DESC
    `).all(oppositeType) as any[];

    // 3. Run Multi-attribute match algorithm
    const matchResults = findDatabaseMatches(
      {
        category: extraction.category,
        brand: extraction.brand,
        color: extraction.color,
        keywords: extraction.keywords,
      },
      candidateRows
    );

    // Enrich matched items with full database rows
    const matches = matchResults.slice(0, 4).map((m) => {
      const itemRow = candidateRows.find((r) => r.id === m.itemId);
      return {
        ...itemRow,
        matchScore: m.matchScore,
        matchReasons: m.matchReasons,
      };
    });

    return NextResponse.json({
      success: true,
      extraction,
      matches,
    });
  } catch (error: any) {
    console.error('Error during AI scan processing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
