import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('ifoundu_session')?.value;
    if (token) {
      destroySession(token);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('ifoundu_session');
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
