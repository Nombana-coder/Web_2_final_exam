DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE courses ADD COLUMN updated_at TIMESTAMPTZ';
    EXECUTE 'UPDATE courses SET updated_at = created_at WHERE updated_at IS NULL';
    EXECUTE 'ALTER TABLE courses ALTER COLUMN updated_at SET DEFAULT now()';
    EXECUTE 'ALTER TABLE courses ALTER COLUMN updated_at SET NOT NULL';
  END IF;
END $$;

DO $$
DECLARE
  has_start_time boolean;
  has_end_time boolean;
  has_start_at boolean;
  has_end_at boolean;
  has_updated_at boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'start_time'
  ) INTO has_start_time;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'end_time'
  ) INTO has_end_time;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'start_at'
  ) INTO has_start_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'end_at'
  ) INTO has_end_at;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'updated_at'
  ) INTO has_updated_at;

  IF has_start_time AND NOT has_start_at THEN
    EXECUTE 'ALTER TABLE exams RENAME COLUMN start_time TO start_at';
  END IF;

  IF has_end_time AND NOT has_end_at THEN
    EXECUTE 'ALTER TABLE exams RENAME COLUMN end_time TO end_at';
  END IF;

  IF NOT has_updated_at THEN
    EXECUTE 'ALTER TABLE exams ADD COLUMN updated_at TIMESTAMPTZ';
    EXECUTE 'UPDATE exams SET updated_at = created_at WHERE updated_at IS NULL';
    EXECUTE 'ALTER TABLE exams ALTER COLUMN updated_at SET DEFAULT now()';
    EXECUTE 'ALTER TABLE exams ALTER COLUMN updated_at SET NOT NULL';
  END IF;

  IF has_start_time THEN
    EXECUTE 'UPDATE exams SET start_at = start_time WHERE start_at IS NULL AND start_time IS NOT NULL';
  END IF;

  IF has_end_time THEN
    EXECUTE 'UPDATE exams SET end_at = end_time WHERE end_at IS NULL AND end_time IS NOT NULL';
  END IF;

  IF has_start_time THEN
    EXECUTE 'ALTER TABLE exams DROP COLUMN start_time';
  END IF;

  IF has_end_time THEN
    EXECUTE 'ALTER TABLE exams DROP COLUMN end_time';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'start_at'
  ) THEN
    EXECUTE 'ALTER TABLE exams ADD COLUMN start_at TIMESTAMPTZ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'end_at'
  ) THEN
    EXECUTE 'ALTER TABLE exams ADD COLUMN end_at TIMESTAMPTZ';
  END IF;

  EXECUTE 'ALTER TABLE exams ALTER COLUMN start_at SET DEFAULT now()';
  EXECUTE 'ALTER TABLE exams ALTER COLUMN end_at SET DEFAULT now()';
  EXECUTE 'ALTER TABLE exams ALTER COLUMN updated_at SET DEFAULT now()';
  EXECUTE 'ALTER TABLE exams ALTER COLUMN start_at SET NOT NULL';
  EXECUTE 'ALTER TABLE exams ALTER COLUMN end_at SET NOT NULL';
  EXECUTE 'ALTER TABLE exams ALTER COLUMN updated_at SET NOT NULL';
END $$;