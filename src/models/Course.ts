export interface Course {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseInput {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateCourseInput {
  code?: string;
  name?: string;
  description?: string;
}
