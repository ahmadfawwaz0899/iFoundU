import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await req.json();

    const { claimantName, claimantContact, secretProof, message } = body;
    if (!claimantName || !secretProof) {
      return NextResponse.json({ success: false, error: 'Name and verification proof are required' }, { status: 400 });
    }

    const claimId = `claim-${Date.now()}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO claims (id, item_id, claimant_name, claimant_contact, secret_proof, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      claimId,
      id,
      claimantName,
      claimantContact || '',
      secretProof,
      message || '',
      'pending',
      now
    );

    // Update item status to 'Pending Verification'
    db.prepare(`UPDATE items SET status = 'Pending Verification' WHERE id = ?`).run(id);

    // Automatically initialize a chat message
    db.prepare(`
      INSERT INTO chat_messages (id, item_id, sender_name, sender_role, message, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `msg-${Date.now()}`,
      id,
      claimantName,
      'claimant',
      `Claim submitted with verification: "${secretProof}". Note: ${message || 'Looking forward to reuniting!'}`,
      now
    );

    return NextResponse.json({ success: true, claimId, message: 'Claim successfully submitted!' });
  } catch (error: any) {
    console.error('Error submitting claim:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await req.json();
    const { claimId, action } = body; // action: 'approve' | 'reject'

    if (!claimId || !action) {
      return NextResponse.json({ success: false, error: 'claimId and action required' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    db.prepare('UPDATE claims SET status = ? WHERE id = ? AND item_id = ?').run(newStatus, claimId, id);

    if (action === 'approve') {
      db.prepare(`UPDATE items SET status = 'Claimed' WHERE id = ?`).run(id);
      db.prepare(`
        INSERT INTO chat_messages (id, item_id, sender_name, sender_role, message, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `msg-${Date.now()}`,
        id,
        'System Verification',
        'finder',
        '✅ Finder approved this claim! You can now arrange a safe exchange.',
        Date.now()
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
