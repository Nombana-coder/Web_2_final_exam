export interface Exam {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  start_at: Date;
  end_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateExamInput {
  course_id: number;
  title: string;
  description?: string;
  start_at: string; // ISO 8601 UTC
  end_at: string;   // ISO 8601 UTC
}

export interface UpdateExamInput {
  title?: string;
  description?: string;
  start_at?: string;
  end_at?: string;
}
