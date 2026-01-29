import { NextResponse } from 'next/server';
import { getAllStudentsWithProgress } from '@/lib/actions/user-actions';

export async function GET() {
  try {
    const students = await getAllStudentsWithProgress();
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
