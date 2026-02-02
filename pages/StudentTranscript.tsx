import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MockDB } from '../services/mockDatabase';
import { TranscriptData } from '../types';
import { Printer, Download } from 'lucide-react';

export const StudentTranscript: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState<TranscriptData | null>(null);

  useEffect(() => {
    if (user) {
      MockDB.getStudentTranscript(user.id).then(setData);
    }
  }, [user]);

  if (!data) return <div>Loading transcript...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-6 gap-2 no-print">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
        >
          <Printer size={18} /> Print / Save as PDF
        </button>
      </div>

      {/* The Printable Area */}
      <div className="bg-white p-12 shadow-lg print:shadow-none text-gray-900" id="transcript">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            {/* Logo placeholder */}
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white font-serif font-bold text-2xl">
              U
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-serif font-bold tracking-wide">GRAND UNIVERSITY</h1>
              <p className="text-sm font-medium tracking-widest uppercase">Office of the Controller of Examinations</p>
            </div>
          </div>
          <h2 className="text-xl font-bold uppercase mt-4 underline decoration-2 underline-offset-4">Official Grade Transcript</h2>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-8">
          <div>
            <p><span className="font-bold w-24 inline-block">Name:</span> {data.student.name}</p>
            <p><span className="font-bold w-24 inline-block">Student ID:</span> {data.student.studentId}</p>
          </div>
          <div className="text-right">
             <p><span className="font-bold">Department:</span> {data.student.department}</p>
             <p><span className="font-bold">Issue Date:</span> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Semesters */}
        <div className="space-y-8">
          {data.semesters.map((sem) => (
            <div key={sem.semester} className="break-inside-avoid">
              <div className="flex justify-between items-end mb-2 border-b border-gray-400 pb-1">
                <h3 className="font-bold text-lg">Semester {sem.semester}</h3>
                <span className="text-sm font-semibold">Semester GPA: {sem.gpa.toFixed(2)}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-1">Code</th>
                    <th className="py-1">Course Title</th>
                    <th className="py-1 text-center">Credit</th>
                    <th className="py-1 text-center">Grade</th>
                    <th className="py-1 text-center">Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sem.results.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2">{r.courseCode}</td>
                      <td className="py-2">{r.courseName}</td>
                      <td className="py-2 text-center">{r.credits}</td>
                      <td className="py-2 text-center font-bold">{r.gradeLetter}</td>
                      <td className="py-2 text-center">{r.gradePoint.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Footer Summary */}
        <div className="mt-12 pt-6 border-t-2 border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Grading Scale: 4.00</p>
              <p className="text-sm text-gray-500">Total Credits Completed: {data.semesters.reduce((acc,s) => acc + s.totalCredits, 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Cumulative GPA (CGPA)</p>
              <p className="text-4xl font-extrabold text-blue-900">{data.cgpa.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-20">
             <div className="border-t border-gray-400 pt-2 text-center text-xs">
               <p>Prepared By</p>
             </div>
             <div className="border-t border-gray-400 pt-2 text-center text-xs">
               <p>Controller of Examinations</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};