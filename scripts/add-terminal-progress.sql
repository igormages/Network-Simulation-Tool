-- Add terminal exercise progress table
CREATE TABLE IF NOT EXISTS terminal_exercise_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100) NOT NULL,
  exercise_number INTEGER NOT NULL,
  best_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  attempts INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_terminal_progress_user ON terminal_exercise_progress(user_id);
