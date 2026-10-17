import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get('ifoundu_session')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    const user = verifySession(token);
    if (!user) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
