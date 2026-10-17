import crypto from 'node:crypto';
import { getDb } from './db';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  memberSince: string;
  trustScore: number;
}

// Hash password with SHA-256 + salt
export function hashPassword(password: string): string {
  const salt = 'ifoundu_secure_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Generate secure random session token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create new user in SQLite
export function createUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
}): { success: boolean; user?: UserSession; error?: string } {
  const db = getDb();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists' };
  }

  const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const passwordHash = hashPassword(data.password);
  const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const avatarUrl = data.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=4f46e5,7c3aed`;

  try {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, phone, avatar_url, member_since, trust_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name.trim(),
      normalizedEmail,
      passwordHash,
      data.phone?.trim() || '',
      avatarUrl,
      nowStr,
      5.0
    );

    const user: UserSession = {
      id,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone?.trim() || '',
      avatarUrl,
      memberSince: nowStr,
      trustScore: 5.0,
    };

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Database error during registration' };
  }
}

// Authenticate user with email and password
export function authenticateUser(email: string, password: string): { success: boolean; user?: UserSession; token?: string; error?: string } {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;
  if (!row) {
    return { success: false, error: 'No account found with this email' };
  }

  if (row.password_hash !== passwordHash) {
    return { success: false, error: 'Incorrect password entered' };
  }

  const user: UserSession = {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    avatarUrl: row.avatar_url,
    memberSince: row.member_since,
    trustScore: row.trust_score,
  };

  // Create session token
  const token = generateToken();
  const now = Date.now();
  const expiresAt = now + 1000 * 60 * 60 * 24 * 30; // 30 days

  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, row.id, now, expiresAt);

  return { success: true, user, token };
}

// Verify session token
export function verifySession(token: string): UserSession | null {
  if (!token) return null;
  const db = getDb();
  const now = Date.now();

  const sessionRow = db.prepare(`
    SELECT u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, now) as any;

  if (!sessionRow) return null;

  return {
    id: sessionRow.id,
    name: sessionRow.name,
    email: sessionRow.email,
    phone: sessionRow.phone || '',
    avatarUrl: sessionRow.avatar_url,
    memberSince: sessionRow.member_since,
    trustScore: sessionRow.trust_score,
  };
}

// Destroy session token (logout)
export function destroySession(token: string): void {
  if (!token) return;
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}
