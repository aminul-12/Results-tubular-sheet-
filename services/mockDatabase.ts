import { User, Role, Course, CourseAllocation, MarkRecord, MarkStatus } from '../types';

/**
 * THIS FILE SIMULATES A BACKEND DATABASE & API LAYER.
 * In a real app, this would be Node.js/Express + PostgreSQL.
 */

// --- 1. SEED DATA ---

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Alan Turing', email: 'admin@uni.edu', role: Role.ADMIN },
  { id: 'u2', name: 'Prof. John Smith', email: 'prof.smith@uni.edu', role: Role.TEACHER, department: 'Computer Science' },
  { id: 'u3', name: 'Prof. Jane Doe', email: 'prof.doe@uni.edu', role: Role.TEACHER, department: 'Mathematics' },
  { id: 'u4', name: 'Alice Johnson', email: 'alice@uni.edu', role: Role.STUDENT, studentId: 'S2024001', department: 'Computer Science' },
  { id: 'u5', name: 'Bob Williams', email: 'bob@uni.edu', role: Role.STUDENT, studentId: 'S2024002', department: 'Computer Science' }
];

const MOCK_COURSES: Course[] = [
  { id: 'c1', code: 'CS101', name: 'Intro to Programming', credits: 3.0, department: 'Computer Science', semester: 1 },
  { id: 'c2', code: 'CS102', name: 'Data Structures', credits: 4.0, department: 'Computer Science', semester: 2 },
  { id: 'c3', code: 'MATH101', name: 'Calculus I', credits: 3.0, department: 'Mathematics', semester: 1 },
  { id: 'c4', code: 'ENG101', name: 'Technical Writing', credits: 2.0, department: 'Humanities', semester: 1 }
];

const MOCK_ALLOCATIONS: CourseAllocation[] = [
  { id: 'a1', courseId: 'c1', teacherId: 'u2', academicSession: 'Fall 2024' },
  { id: 'a2', courseId: 'c2', teacherId: 'u2', academicSession: 'Fall 2024' },
  { id: 'a3', courseId: 'c3', teacherId: 'u3', academicSession: 'Fall 2024' },
  { id: 'a4', courseId: 'c4', teacherId: 'u3', academicSession: 'Fall 2024' } // Math prof teaching English for demo
];

// Initial marks (some draft, some submitted)
let MOCK_MARKS: MarkRecord[] = [
  {
    id: 'm1', studentId: 'u4', courseId: 'c1', courseCode: 'CS101', courseName: 'Intro to Programming',
    credits: 3, semester: 1, theory: 60, lab: 25, total: 85, gradePoint: 4.0, gradeLetter: 'A+', status: MarkStatus.SUBMITTED
  },
  {
    id: 'm2', studentId: 'u5', courseId: 'c1', courseCode: 'CS101', courseName: 'Intro to Programming',
    credits: 3, semester: 1, theory: 50, lab: 20, total: 70, gradePoint: 3.5, gradeLetter: 'A-', status: MarkStatus.SUBMITTED
  }
];

// --- 2. BUSINESS LOGIC HELPERS ---

export const calculateGrade = (total: number): { letter: string; point: number } => {
  if (total >= 80) return { letter: 'A+', point: 4.0 };
  if (total >= 75) return { letter: 'A', point: 3.75 };
  if (total >= 70) return { letter: 'A-', point: 3.5 };
  if (total >= 65) return { letter: 'B+', point: 3.25 };
  if (total >= 60) return { letter: 'B', point: 3.0 };
  if (total >= 55) return { letter: 'B-', point: 2.75 };
  if (total >= 50) return { letter: 'C+', point: 2.5 };
  if (total >= 45) return { letter: 'C', point: 2.25 };
  if (total >= 40) return { letter: 'D', point: 2.0 };
  return { letter: 'F', point: 0.0 };
};

// --- 3. MOCK API SERVICE ---

export const MockDB = {
  login: async (email: string) => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    return user;
  },

  // Teacher APIs
  getTeacherCourses: async (teacherId: string) => {
    const allocations = MOCK_ALLOCATIONS.filter(a => a.teacherId === teacherId);
    return allocations.map(a => MOCK_COURSES.find(c => c.id === a.courseId)!);
  },

  getStudentsForCourse: async (courseId: string) => {
    // In a real DB, check enrollments. Here assuming all students take all courses for simplicity
    const students = MOCK_USERS.filter(u => u.role === Role.STUDENT);
    
    // Merge with existing marks
    return students.map(student => {
      const existingMark = MOCK_MARKS.find(m => m.studentId === student.id && m.courseId === courseId);
      if (existingMark) return { student, mark: existingMark };
      
      // Return empty mark template
      const course = MOCK_COURSES.find(c => c.id === courseId)!;
      return {
        student,
        mark: {
          id: `new_${Date.now()}_${student.id}`,
          studentId: student.id,
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          credits: course.credits,
          semester: course.semester,
          theory: 0,
          lab: 0,
          total: 0,
          gradePoint: 0,
          gradeLetter: 'F',
          status: MarkStatus.DRAFT
        } as MarkRecord
      };
    });
  },

  saveMarks: async (marks: MarkRecord[]) => {
    // Upsert logic
    marks.forEach(newMark => {
      const idx = MOCK_MARKS.findIndex(m => m.studentId === newMark.studentId && m.courseId === newMark.courseId);
      
      // Recalculate Logic
      const total = Number(newMark.theory) + Number(newMark.lab);
      const { letter, point } = calculateGrade(total);
      const processedMark = { ...newMark, total, gradeLetter: letter, gradePoint: point };

      if (idx >= 0) {
        MOCK_MARKS[idx] = processedMark;
      } else {
        MOCK_MARKS.push(processedMark);
      }
    });
    return true;
  },

  // Admin APIs
  getAllPendingMarks: async () => {
    return MOCK_MARKS.filter(m => m.status === MarkStatus.SUBMITTED);
  },

  approveMarks: async (markIds: string[]) => {
    MOCK_MARKS = MOCK_MARKS.map(m => 
      markIds.includes(m.id) ? { ...m, status: MarkStatus.APPROVED } : m
    );
    return true;
  },

  rejectMarks: async (markIds: string[]) => {
    MOCK_MARKS = MOCK_MARKS.map(m => 
      markIds.includes(m.id) ? { ...m, status: MarkStatus.DRAFT } : m
    );
    return true;
  },

  getSystemStats: async () => {
    return {
      totalStudents: MOCK_USERS.filter(u => u.role === Role.STUDENT).length,
      totalCourses: MOCK_COURSES.length,
      pendingApprovals: MOCK_MARKS.filter(m => m.status === MarkStatus.SUBMITTED).length,
      avgGPA: 3.2 // Mock calc
    };
  },

  // Student APIs
  getStudentTranscript: async (studentId: string) => {
    const studentMarks = MOCK_MARKS.filter(m => m.studentId === studentId && m.status === MarkStatus.APPROVED);
    
    // Group by semester
    const semMap = new Map<number, MarkRecord[]>();
    studentMarks.forEach(m => {
      if (!semMap.has(m.semester)) semMap.set(m.semester, []);
      semMap.get(m.semester)?.push(m);
    });

    const semesters = Array.from(semMap.entries()).map(([sem, results]) => {
      const totalCredits = results.reduce((sum, r) => sum + r.credits, 0);
      const totalPoints = results.reduce((sum, r) => sum + (r.gradePoint * r.credits), 0);
      return {
        semester: sem,
        results,
        totalCredits,
        gpa: totalCredits ? (totalPoints / totalCredits) : 0
      };
    }).sort((a, b) => a.semester - b.semester);

    const allCredits = semesters.reduce((sum, s) => sum + s.totalCredits, 0);
    const allPoints = semesters.reduce((sum, s) => sum + (s.gpa * s.totalCredits), 0);

    return {
      student: MOCK_USERS.find(u => u.id === studentId)!,
      semesters,
      cgpa: allCredits ? (allPoints / allCredits) : 0
    };
  }
};