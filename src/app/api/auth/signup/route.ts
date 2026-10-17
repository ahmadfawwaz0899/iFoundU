import { NextRequest, NextResponse } from 'next/server';
import { createUser, authenticateUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const regResult = createUser({
      name,
      email,
      password,
      phone,
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json({ success: false, error: regResult.error }, { status: 400 });
    }

    // Auto-login after sign-up
    const authResult = authenticateUser(email, password);
    if (!authResult.success || !authResult.token) {
      return NextResponse.json({ success: true, user: regResult.user });
    }

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      message: 'Account created successfully! Welcome to IFoundU.',
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
    console.error('Error during sign up:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
