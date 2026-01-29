import { NextResponse } from 'next/server';
import { getUserProgress, saveExerciseProgress } from '@/lib/actions/user-actions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const progress = await getUserProgress(parseInt(userId));
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, exerciseId, exerciseNumber, score, maxScore } = await request.json();

    if (!userId || !exerciseId || exerciseNumber === undefined || score === undefined || maxScore === undefined) {
      return NextResponse.json({ error: 'Parametres manquants' }, { status: 400 });
    }

    const success = await saveExerciseProgress(userId, exerciseId, exerciseNumber, score, maxScore);
    if (!success) {
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save progress error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
