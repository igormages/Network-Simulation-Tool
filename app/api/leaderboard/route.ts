import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }
  return neon(connectionString);
}

export async function GET() {
  try {
    const sql = getDb();

    // Get students with their total scores
    const students = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(SUM(ep.best_score), 0) + COALESCE(SUM(tp.best_score), 0) as total_score,
        COALESCE(COUNT(DISTINCT CASE WHEN ep.completed THEN ep.exercise_id END), 0) as exercises_completed,
        COALESCE(COUNT(DISTINCT CASE WHEN tp.completed THEN tp.exercise_id END), 0) as terminal_completed,
        u.last_login
      FROM users u
      LEFT JOIN exercise_progress ep ON u.id = ep.user_id
      LEFT JOIN terminal_exercise_progress tp ON u.id = tp.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.email, u.last_login
      ORDER BY total_score DESC, u.name ASC
      LIMIT 10
    `;

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
