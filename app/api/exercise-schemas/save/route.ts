import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { userId, exerciseId, topology } = await request.json();

    if (!userId || !exerciseId || !topology) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert: insert or update if already exists
    const result = await sql`
      INSERT INTO exercise_schemas (user_id, exercise_id, topology, updated_at)
      VALUES (${userId}, ${exerciseId}, ${JSON.stringify(topology)}, NOW())
      ON CONFLICT (user_id, exercise_id) 
      DO UPDATE SET topology = EXCLUDED.topology, updated_at = NOW()
      RETURNING id, created_at, updated_at;
    `;

    return Response.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving exercise schema:', error);
    return Response.json(
      { error: 'Failed to save exercise schema' },
      { status: 500 }
    );
  }
}
