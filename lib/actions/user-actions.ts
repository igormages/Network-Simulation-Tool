'use server';

import { neon } from '@neondatabase/serverless';

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }
  return neon(connectionString);
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_login: string;
}

export interface ExerciseProgressDB {
  id: number;
  user_id: number;
  exercise_id: string;
  exercise_number: number;
  completed: boolean;
  best_score: number;
  max_score: number;
  attempts: number;
  completed_at: string | null;
  updated_at: string;
}

const TEACHER_EMAIL = 'igor.mages@eduservices.org';

export async function loginOrCreateUser(email: string, name: string): Promise<User | null> {
  try {
    const sql = getDb();
    const normalizedEmail = email.toLowerCase().trim();
    const role = normalizedEmail === TEACHER_EMAIL ? 'teacher' : 'student';

    // Check if user exists
    const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${normalizedEmail}
    `;

    if (existingUsers.length > 0) {
      // Update last login
      await sql`
        UPDATE users SET last_login = NOW() WHERE email = ${normalizedEmail}
      `;
      return existingUsers[0] as User;
    }

    // Create new user
    const newUsers = await sql`
      INSERT INTO users (email, name, role)
      VALUES (${normalizedEmail}, ${name}, ${role})
      RETURNING *
    `;

    return newUsers[0] as User;
  } catch (error) {
    console.error('Error in loginOrCreateUser:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const sql = getDb();
    const users = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}
    `;
    return users.length > 0 ? (users[0] as User) : null;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
}

export async function saveExerciseProgress(
  userId: number,
  exerciseId: string,
  exerciseNumber: number,
  score: number,
  maxScore: number
): Promise<boolean> {
  try {
    const sql = getDb();
    const completed = score >= maxScore * 0.7;

    // Check if progress exists
    const existing = await sql`
      SELECT * FROM exercise_progress 
      WHERE user_id = ${userId} AND exercise_id = ${exerciseId}
    `;

    if (existing.length > 0) {
      const current = existing[0] as ExerciseProgressDB;
      const newBestScore = Math.max(current.best_score, score);
      const newCompleted = current.completed || completed;

      await sql`
        UPDATE exercise_progress 
        SET 
          best_score = ${newBestScore},
          completed = ${newCompleted},
          attempts = attempts + 1,
          completed_at = ${newCompleted && !current.completed ? new Date().toISOString() : current.completed_at},
          updated_at = NOW()
        WHERE user_id = ${userId} AND exercise_id = ${exerciseId}
      `;
    } else {
      await sql`
        INSERT INTO exercise_progress (user_id, exercise_id, exercise_number, completed, best_score, max_score, attempts, completed_at)
        VALUES (${userId}, ${exerciseId}, ${exerciseNumber}, ${completed}, ${score}, ${maxScore}, 1, ${completed ? new Date().toISOString() : null})
      `;
    }

    return true;
  } catch (error) {
    console.error('Error in saveExerciseProgress:', error);
    return false;
  }
}

export async function getUserProgress(userId: number): Promise<ExerciseProgressDB[]> {
  try {
    const sql = getDb();
    const progress = await sql`
      SELECT * FROM exercise_progress 
      WHERE user_id = ${userId}
      ORDER BY exercise_number ASC
    `;
    return progress as ExerciseProgressDB[];
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return [];
  }
}

export interface TerminalProgressDB {
  user_id: number;
  exercise_id: string;
  exercise_number: number;
  best_score: number;
  max_score: number;
  attempts: number;
  completed: boolean;
  completed_at: string | null;
}

export interface StudentWithProgress {
  user: User;
  progress: ExerciseProgressDB[];
  terminalProgress: TerminalProgressDB[];
  totalScore: number;
  completedCount: number;
  terminalTotalScore: number;
  terminalCompletedCount: number;
}

export async function getAllStudentsWithProgress(): Promise<StudentWithProgress[]> {
  try {
    const sql = getDb();
    // Get all non-teacher users
    const users = await sql`
      SELECT * FROM users WHERE role = 'student' ORDER BY name ASC
    `;

    const studentsWithProgress: StudentWithProgress[] = [];

    for (const user of users) {
      const progress = await sql`
        SELECT * FROM exercise_progress 
        WHERE user_id = ${(user as User).id}
        ORDER BY exercise_number ASC
      `;

      const terminalProgress = await sql`
        SELECT * FROM terminal_exercise_progress 
        WHERE user_id = ${(user as User).id}
        ORDER BY exercise_number ASC
      `;

      const totalScore = (progress as ExerciseProgressDB[]).reduce((sum, p) => sum + p.best_score, 0);
      const completedCount = (progress as ExerciseProgressDB[]).filter(p => p.completed).length;
      const terminalTotalScore = (terminalProgress as TerminalProgressDB[]).reduce((sum, p) => sum + p.best_score, 0);
      const terminalCompletedCount = (terminalProgress as TerminalProgressDB[]).filter(p => p.completed).length;

      studentsWithProgress.push({
        user: user as User,
        progress: progress as ExerciseProgressDB[],
        terminalProgress: terminalProgress as TerminalProgressDB[],
        totalScore,
        completedCount,
        terminalTotalScore,
        terminalCompletedCount,
      });
    }

    return studentsWithProgress;
  } catch (error) {
    console.error('Error in getAllStudentsWithProgress:', error);
    return [];
  }
}
