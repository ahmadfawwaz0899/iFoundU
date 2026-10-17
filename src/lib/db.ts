import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Ensure .data directory exists
const dataDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ifoundu.db');

// Singleton database instance across Next.js dev server reloads
let db: DatabaseSync;

function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(dbPath);
    // Enable WAL mode for better concurrency
    db.exec('PRAGMA journal_mode = WAL;');
    initSchema(db);
  }
  return db;
}

function initSchema(database: DatabaseSync) {
  // 1. Items Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      specific_location TEXT,
      latitude REAL,
      longitude REAL,
      date TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      brand TEXT,
      color TEXT NOT NULL,
      model TEXT,
      distinct_marks TEXT,
      confidence REAL NOT NULL,
      status TEXT NOT NULL,
      reporter_name TEXT NOT NULL,
      reporter_contact TEXT,
      reporter_user_id TEXT NOT NULL DEFAULT 'user-current'
    );
  `);

  // 2. Claims Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      claimant_name TEXT NOT NULL,
      claimant_contact TEXT NOT NULL,
      secret_proof TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    );
  `);

  // 3. Chat Messages Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    );
  `);

  // 4. Search History Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS searches (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      category TEXT,
      result_count INTEGER NOT NULL DEFAULT 0,
      timestamp INTEGER NOT NULL
    );
  `);

  // 5. User Profile Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT NOT NULL,
      member_since TEXT NOT NULL,
      trust_score REAL NOT NULL,
      gemini_api_key TEXT
    );
  `);

  // 6. Registered Users Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT NOT NULL,
      member_since TEXT NOT NULL,
      trust_score REAL NOT NULL DEFAULT 5.0
    );
  `);

  // 7. Active Sessions Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed default data if items table is empty
  const countRow = database.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase(database);
  }
}

function seedDatabase(database: DatabaseSync) {
  // Seed Profile
  database.prepare(`
    INSERT OR REPLACE INTO user_profile (id, name, email, phone, avatar_url, member_since, trust_score)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'user-current',
    'Alex Chen',
    'alex.chen@example.com',
    '+1 (555) 234-8901',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'January 2026',
    4.95
  );

  // Seed Users
  // Hash for 'password123' with salt 'ifoundu_secure_salt_2026'
  const defaultPasswordHash = 'c6916fa713a29828e826b52c002242006326aa98889ec1bbf7f0a7c49b2de2ff';
  database.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, phone, avatar_url, member_since, trust_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'user-current',
    'Alex Chen',
    'alex.chen@example.com',
    defaultPasswordHash,
    '+1 (555) 234-8901',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'January 2026',
    4.95
  );

  database.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, phone, avatar_url, member_since, trust_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'user-2',
    'Sarah Jenkins',
    'sarah.jenkins@example.com',
    defaultPasswordHash,
    '+1 (555) 345-6789',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    'February 2026',
    4.88
  );

  // Seed Items
  const insertItem = database.prepare(`
    INSERT INTO items (
      id, type, title, category, location, specific_location, date, created_at,
      image_url, description, brand, color, model, distinct_marks, confidence,
      status, reporter_name, reporter_contact, reporter_user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialItems = [
    {
      id: 'item-1',
      type: 'found',
      title: 'Black Samsung Galaxy S23 Ultra',
      category: 'Electronics',
      location: 'Central Library, 2nd Floor Study Room B',
      specific_location: 'Desk #14 near the east window',
      date: '2026-10-17',
      created_at: Date.now() - 1000 * 60 * 18,
      image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
      description: 'Found an unlocked dark grey/black Samsung phone with a matte black Spigen protective case. Screen has no cracks. Has a lockscreen photo of a golden retriever puppy.',
      brand: 'Samsung',
      color: 'Phantom Black',
      model: 'Galaxy S23 Ultra (Quad Lens)',
      distinct_marks: 'Spigen Tough Armor case with card kickstand',
      confidence: 98.4,
      status: 'Open',
      reporter_name: 'Marcus Vance',
      reporter_contact: 'm.vance@campus.edu',
      reporter_user_id: 'user-2',
    },
    {
      id: 'item-2',
      type: 'lost',
      title: 'Vintage Tan Leather Bellroy Wallet',
      category: 'Wallets & Bags',
      location: 'Metro Station North Gate, Line 2',
      specific_location: 'Dropped likely around turnstile #3 or ascending escalator',
      date: '2026-10-17',
      created_at: Date.now() - 1000 * 60 * 45,
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      description: 'Bifold tan brown leather wallet containing university ID (Alex C.), student transit card, and gym membership pass. Deep sentimental value, reward offered!',
      brand: 'Bellroy',
      color: 'Caramel Tan',
      model: 'Hide & Seek Bifold',
      distinct_marks: 'Embossed owl logo on bottom right, slight scuff on spine',
      confidence: 94.7,
      status: 'Open',
      reporter_name: 'Alex Chen',
      reporter_contact: 'alex.chen@example.com',
      reporter_user_id: 'user-current',
    },
    {
      id: 'item-3',
      type: 'found',
      title: 'AirPods Pro 2nd Gen in Blue Case',
      category: 'Electronics',
      location: 'Downtown Starbucks Cafe',
      specific_location: 'Left on the wooden bar table next to the power outlets',
      date: '2026-10-17',
      created_at: Date.now() - 1000 * 60 * 60,
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      description: 'White Apple AirPods Pro 2 charging case enclosed in a navy silicone protective sleeve with a small silver carabiner clip.',
      brand: 'Apple',
      color: 'Navy Blue Silicone (White Case inside)',
      model: 'AirPods Pro 2 (USB-C)',
      distinct_marks: 'Silver metallic carabiner clip with small scratch',
      confidence: 97.1,
      status: 'Open',
      reporter_name: 'Sarah Jenkins (Barista)',
      reporter_contact: 'starbucks.dt@store.com',
      reporter_user_id: 'user-3',
    },
    {
      id: 'item-4',
      type: 'lost',
      title: 'Subaru Car Key with Blue Climbing Lanyard',
      category: 'Keys',
      location: 'Riverside Jogging Trail Park',
      specific_location: 'Between Mile Marker 2.5 and the dog recreation area',
      date: '2026-10-16',
      created_at: Date.now() - 1000 * 60 * 180,
      image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      description: 'Key fob for a 2022 Subaru Outback attached to a bright royal blue Mammut climbing cord lanyard with three brass house keys and a miniature bottle opener.',
      brand: 'Subaru',
      color: 'Black fob & Royal Blue cord',
      model: 'Keyless Smart Remote',
      distinct_marks: 'Brass key #402, mini anodized blue opener',
      confidence: 95.2,
      status: 'Open',
      reporter_name: 'David Kim',
      reporter_contact: 'david.k@outlook.com',
      reporter_user_id: 'user-4',
    },
    {
      id: 'item-5',
      type: 'found',
      title: 'Ray-Ban Classic Aviator Sunglasses',
      category: 'Accessories',
      location: 'Grand Plaza Shopping Mall, Food Court',
      specific_location: 'On bench outside the artisan bakery',
      date: '2026-10-16',
      created_at: Date.now() - 1000 * 60 * 300,
      image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
      description: 'Gold-framed Ray-Ban aviator sunglasses with green classic G-15 lenses. Found inside an original brown leather case with cleaning cloth.',
      brand: 'Ray-Ban',
      color: 'Gold / Green G-15',
      model: 'RB3025 Aviator Classic',
      distinct_marks: 'Laser etched RB on left lens, brown button snap case',
      confidence: 96.8,
      status: 'Open',
      reporter_name: 'Security Desk Grand Plaza',
      reporter_contact: 'security@grandplaza.com',
      reporter_user_id: 'user-5',
    },
    {
      id: 'item-6',
      type: 'lost',
      title: 'Fjällräven Kånken Backpack (Forest Green)',
      category: 'Wallets & Bags',
      location: 'University Science Center Auditorium',
      specific_location: 'Row G Seat 12, Physics Lecture Hall',
      date: '2026-10-16',
      created_at: Date.now() - 1000 * 60 * 360,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      description: 'Classic green Kånken backpack containing a spiral notebook, blue water flask, and TI-84 Plus CE graphing calculator. Very important notes inside!',
      brand: 'Fjällräven',
      color: 'Forest Green',
      model: 'Kånken Classic 16L',
      distinct_marks: 'Enamel pin of a Saturn planet on front zippered pocket',
      confidence: 98.9,
      status: 'Open',
      reporter_name: 'Emily Watson',
      reporter_contact: 'emily.w@uni.edu',
      reporter_user_id: 'user-6',
    },
    {
      id: 'item-7',
      type: 'found',
      title: 'Navy Blue London Fog Umbrella',
      category: 'Accessories',
      location: 'Campus Dining Hall, Umbrella Stand #2',
      specific_location: 'Near north glass entry',
      date: '2026-10-12',
      created_at: Date.now() - 1000 * 60 * 60 * 24 * 5,
      image_url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=600&auto=format&fit=crop&q=80',
      description: 'Large wooden curved handle umbrella with automatic release button. Found left in dining hall.',
      brand: 'London Fog',
      color: 'Navy Blue / Polished Walnut Handle',
      model: 'Automatic Compact Stick',
      distinct_marks: 'Small brass crest on handle',
      confidence: 96.2,
      status: 'Claimed',
      reporter_name: 'Alex Chen',
      reporter_contact: 'alex.chen@example.com',
      reporter_user_id: 'user-current',
    },
    {
      id: 'item-8',
      type: 'found',
      title: 'Tan Leather Bellroy Bifold Wallet',
      category: 'Wallets & Bags',
      location: 'Metro Station North Gate, Customer Information Booth',
      specific_location: 'Turned into Station Agent after evening transit peak',
      date: '2026-10-17',
      created_at: Date.now() - 1000 * 60 * 30,
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      description: 'Found caramel tan leather bifold wallet with student transit cards and gym keycard inside.',
      brand: 'Bellroy',
      color: 'Caramel Tan / Brown',
      model: 'Hide & Seek Bifold',
      distinct_marks: 'Embossed owl crest on corner, slight scuff on spine',
      confidence: 96.7,
      status: 'Open',
      reporter_name: 'Metro Agent Lisa',
      reporter_contact: 'lisa.metro@transit.gov',
      reporter_user_id: 'user-8',
    },
  ];

  for (const item of initialItems) {
    insertItem.run(
      item.id,
      item.type,
      item.title,
      item.category,
      item.location,
      item.specific_location,
      item.date,
      item.created_at,
      item.image_url,
      item.description,
      item.brand,
      item.color,
      item.model,
      item.distinct_marks,
      item.confidence,
      item.status,
      item.reporter_name,
      item.reporter_contact,
      item.reporter_user_id
    );
  }

  // Seed sample claim and chat message on the London Fog umbrella
  database.prepare(`
    INSERT INTO claims (id, item_id, claimant_name, claimant_contact, secret_proof, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'claim-1',
    'item-7',
    'Jessica Liu',
    'jessica.l@campus.edu',
    'Left it on Tuesday during the rain storm; handle has a tiny scratch on the gold rim',
    'Thank you so much for picking it up! Can we meet at the campus center tomorrow?',
    'approved',
    Date.now() - 1000 * 60 * 60 * 24 * 4
  );

  database.prepare(`
    INSERT INTO chat_messages (id, item_id, sender_name, sender_role, message, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'chat-1',
    'item-7',
    'Jessica Liu',
    'claimant',
    'Hi Alex! I submitted the verification for the London Fog umbrella. Is it still with you?',
    Date.now() - 1000 * 60 * 60 * 24 * 4
  );

  database.prepare(`
    INSERT INTO chat_messages (id, item_id, sender_name, sender_role, message, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'chat-2',
    'item-7',
    'Alex Chen',
    'finder',
    'Yes Jessica! The scratch on the gold rim matched. I left it safely at the front desk of the Dining Hall under your name.',
    Date.now() - 1000 * 60 * 60 * 24 * 3
  );

  // Seed search history
  const insertSearch = database.prepare(`
    INSERT INTO searches (id, query, category, result_count, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertSearch.run('sh-1', 'Bellroy tan leather wallet', 'Wallets & Bags', 3, Date.now() - 1000 * 60 * 120);
  insertSearch.run('sh-2', 'Subaru remote fob', 'Keys', 7, Date.now() - 1000 * 60 * 60 * 24);
  insertSearch.run('sh-3', 'Samsung Galaxy phone S23', 'Electronics', 14, Date.now() - 1000 * 60 * 60 * 72);
}

export { getDb };
