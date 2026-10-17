import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const authResult = authenticateUser(email, password);
    if (!authResult.success || !authResult.token || !authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error || 'Authentication failed' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      message: `Welcome back, ${authResult.user.name}!`,
    });

    // Set session cookie
    response.cookies.set('ifoundu_session', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
