import { NextResponse } from 'next/server';
import { loginOrCreateUser, getUserProgress } from '@/lib/actions/user-actions';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email et nom requis' }, { status: 400 });
    }

    const user = await loginOrCreateUser(email, name);
    if (!user) {
      return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
    }

    const progress = await getUserProgress(user.id);

    return NextResponse.json({ user, progress });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
