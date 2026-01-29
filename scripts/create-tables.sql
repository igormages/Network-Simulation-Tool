-- Table des utilisateurs (étudiants et professeurs)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de progression des exercices
CREATE TABLE IF NOT EXISTS exercise_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100) NOT NULL,
  exercise_number INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  best_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exercise_id)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_progress_user ON exercise_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_exercise ON exercise_progress(exercise_id);
