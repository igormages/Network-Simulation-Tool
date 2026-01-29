import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; exerciseId: string } }
) {
  try {
    const { userId, exerciseId } = params;

    if (!userId || !exerciseId) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT topology, created_at, updated_at
      FROM exercise_schemas
      WHERE user_id = ${userId} AND exercise_id = ${exerciseId}
      LIMIT 1;
    `;

    if (result.rows.length === 0) {
      return Response.json(
        { topology: null },
        { status: 200 }
      );
    }

    return Response.json({
      topology: result.rows[0].topology,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Error loading exercise schema:', error);
    return Response.json(
      { error: 'Failed to load exercise schema' },
      { status: 500 }
    );
  }
}
