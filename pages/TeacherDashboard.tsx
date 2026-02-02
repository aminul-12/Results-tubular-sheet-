import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MockDB, calculateGrade } from '../services/mockDatabase';
import { Course, MarkRecord, MarkStatus } from '../types';
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [marksData, setMarksData] = useState<{ student: any, mark: MarkRecord }[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (user) {
      MockDB.getTeacherCourses(user.id).then(setCourses);
    }
  }, [user]);

  const handleCourseSelect = async (course: Course) => {
    setLoading(true);
    setSelectedCourse(course);
    const data = await MockDB.getStudentsForCourse(course.id);
    setMarksData(data);
    setLoading(false);
    setFeedback(null);
  };

  const handleMarkChange = (index: number, field: 'theory' | 'lab', value: string) => {
    const newData = [...marksData];
    const val = Math.min(Math.max(Number(value), 0), 100); // Clamp 0-100
    
    // Update field
    if (field === 'theory') newData[index].mark.theory = val;
    if (field === 'lab') newData[index].mark.lab = val;
    
    // Auto calculate local total/grade for preview
    const total = Number(newData[index].mark.theory) + Number(newData[index].mark.lab);
    const { letter } = calculateGrade(total);
    newData[index].mark.total = total;
    newData[index].mark.gradeLetter = letter;
    
    setMarksData(newData);
  };

  const saveMarks = async (submit: boolean) => {
    setLoading(true);
    const marksToSave = marksData.map(d => ({
      ...d.mark,
      status: submit ? MarkStatus.SUBMITTED : MarkStatus.DRAFT
    }));
    
    try {
      await MockDB.saveMarks(marksToSave);
      // Re-fetch to get updated status
      const data = await MockDB.getStudentsForCourse(selectedCourse!.id);
      setMarksData(data);
      setFeedback({ 
        type: 'success', 
        message: submit ? 'Marks submitted to Admin for approval.' : 'Marks saved as Draft.' 
      });
    } catch (e) {
      setFeedback({ type: 'error', message: 'Failed to save marks.' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Marks Entry</h2>
          <p className="text-gray-500">Select a course to manage student results.</p>
        </div>
      </div>

      {!selectedCourse ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div 
              key={course.id} 
              onClick={() => handleCourseSelect(course)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="text-blue-600 font-bold text-lg mb-1">{course.code}</div>
              <div className="font-semibold text-gray-800 mb-2">{course.name}</div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>{course.credits} Credits</span>
                <span className="group-hover:text-blue-600">Enter Marks &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <button onClick={() => setSelectedCourse(null)} className="text-sm text-gray-500 hover:text-gray-800">&larr; Back</button>
               <div>
                 <h3 className="font-bold text-lg">{selectedCourse.code} - {selectedCourse.name}</h3>
                 <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{selectedCourse.semester} Semester</span>
               </div>
            </div>
            
            <div className="flex gap-2">
               <button 
                 onClick={() => saveMarks(false)}
                 disabled={loading}
                 className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
               >
                 <Save size={16} /> Save Draft
               </button>
               <button 
                 onClick={() => saveMarks(true)}
                 disabled={loading}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
               >
                 <Send size={16} /> Submit for Approval
               </button>
            </div>
          </div>

          {feedback && (
            <div className={`p-4 mx-6 mt-6 rounded-lg flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {feedback.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
              {feedback.message}
            </div>
          )}

          <div className="overflow-x-auto p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-2">Student ID</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2 w-24">Theory (70)</th>
                  <th className="py-3 px-2 w-24">Lab (30)</th>
                  <th className="py-3 px-2 w-24">Total</th>
                  <th className="py-3 px-2">Grade</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marksData.map((row, idx) => (
                  <tr key={row.student.id} className="hover:bg-gray-50">
                    <td className="py-3 px-2 font-mono text-sm">{row.student.studentId}</td>
                    <td className="py-3 px-2 text-sm">{row.student.name}</td>
                    <td className="py-3 px-2">
                      <input 
                        type="number"
                        disabled={row.mark.status === MarkStatus.APPROVED || row.mark.status === MarkStatus.SUBMITTED}
                        value={row.mark.theory}
                        onChange={(e) => handleMarkChange(idx, 'theory', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                      />
                    </td>
                    <td className="py-3 px-2">
                       <input 
                        type="number"
                        disabled={row.mark.status === MarkStatus.APPROVED || row.mark.status === MarkStatus.SUBMITTED}
                        value={row.mark.lab}
                        onChange={(e) => handleMarkChange(idx, 'lab', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                      />
                    </td>
                    <td className="py-3 px-2 font-bold text-gray-700">{row.mark.total}</td>
                    <td className="py-3 px-2">
                      <span className={`font-bold ${row.mark.gradeLetter === 'F' ? 'text-red-600' : 'text-green-600'}`}>
                        {row.mark.gradeLetter}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${row.mark.status === MarkStatus.DRAFT ? 'bg-gray-100 text-gray-600' : 
                          row.mark.status === MarkStatus.SUBMITTED ? 'bg-yellow-100 text-yellow-700' :
                          row.mark.status === MarkStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {row.mark.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};