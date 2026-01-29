-- Create table to store exercise topology schemas
CREATE TABLE IF NOT EXISTS exercise_schemas (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  topology JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exercise_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exercise_schemas_user_id ON exercise_schemas(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_schemas_user_exercise ON exercise_schemas(user_id, exercise_id);
