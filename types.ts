export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export enum MarkStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string; // For teachers/students
  studentId?: string; // Specific to students
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  semester: number;
}

// Relates a teacher to a course for a specific session
export interface CourseAllocation {
  id: string;
  courseId: string;
  teacherId: string;
  academicSession: string; // e.g., "Fall 2024"
}

export interface MarkRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string; // Denormalized for display
  courseName: string; // Denormalized for display
  credits: number;
  theory: number; // Max 70 usually
  lab: number; // Max 30 usually or 0
  total: number;
  gradePoint: number;
  gradeLetter: string;
  status: MarkStatus;
  semester: number;
}

export interface GradeSheet {
  semester: number;
  results: MarkRecord[];
  gpa: number;
  totalCredits: number;
}

export interface TranscriptData {
  student: User;
  semesters: GradeSheet[];
  cgpa: number;
}