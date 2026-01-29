import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }
  return neon(connectionString);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const sql = getDb();
    const progress = await sql`
      SELECT * FROM terminal_exercise_progress 
      WHERE user_id = ${Number.parseInt(userId)}
      ORDER BY exercise_number ASC
    `;
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching terminal progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { userId, exerciseId, exerciseNumber, score, maxScore } = body;

    if (!userId || !exerciseId || exerciseNumber === undefined || score === undefined || maxScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const completed = score >= maxScore * 0.7;

    // Upsert progress
    await sql`
      INSERT INTO terminal_exercise_progress (user_id, exercise_id, exercise_number, best_score, max_score, attempts, completed, completed_at)
      VALUES (${userId}, ${exerciseId}, ${exerciseNumber}, ${score}, ${maxScore}, 1, ${completed}, ${completed ? new Date().toISOString() : null})
      ON CONFLICT (user_id, exercise_id) 
      DO UPDATE SET 
        best_score = GREATEST(terminal_exercise_progress.best_score, ${score}),
        attempts = terminal_exercise_progress.attempts + 1,
        completed = terminal_exercise_progress.completed OR ${completed},
        completed_at = CASE 
          WHEN ${completed} AND terminal_exercise_progress.completed_at IS NULL 
          THEN ${new Date().toISOString()} 
          ELSE terminal_exercise_progress.completed_at 
        END
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving terminal progress:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
