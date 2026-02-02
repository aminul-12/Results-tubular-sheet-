import React, { useEffect, useState } from 'react';
import { MockDB } from '../services/mockDatabase';
import { geminiService } from '../services/geminiService';
import { MarkRecord, MarkStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Check, X, Sparkles, Loader } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingMarks, setPendingMarks] = useState<MarkRecord[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  const fetchData = async () => {
    const s = await MockDB.getSystemStats();
    const p = await MockDB.getAllPendingMarks();
    setStats(s);
    setPendingMarks(p);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    await MockDB.approveMarks([id]);
    fetchData();
  };

  const handleReject = async (id: string) => {
    await MockDB.rejectMarks([id]);
    fetchData();
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    // Send pending marks to AI for analysis
    const result = await geminiService.processResultAnalysis(pendingMarks);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  // Prepare chart data
  const chartData = [
    { name: 'Pending', value: pendingMarks.length },
    { name: 'Processed', value: (stats?.totalStudents || 0) * (stats?.totalCourses || 0) - pendingMarks.length },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Controller of Examinations Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats?.totalStudents} color="bg-blue-500" />
        <StatCard label="Active Courses" value={stats?.totalCourses} color="bg-purple-500" />
        <StatCard label="Pending Approvals" value={stats?.pendingApprovals} color="bg-yellow-500" />
        <StatCard label="Avg GPA" value={stats?.avgGPA} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Pending Result Approvals</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {pendingMarks.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                 <tr>
                   <th className="p-3">Course</th>
                   <th className="p-3">Student</th>
                   <th className="p-3">Total</th>
                   <th className="p-3">Grade</th>
                   <th className="p-3 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {pendingMarks.length === 0 ? (
                   <tr><td colSpan={5} className="p-4 text-center text-gray-500">No pending approvals.</td></tr>
                 ) : (
                   pendingMarks.map(m => (
                     <tr key={m.id} className="hover:bg-gray-50">
                       <td className="p-3 text-sm font-medium">{m.courseCode}</td>
                       <td className="p-3 text-sm text-gray-600">{m.studentId}</td>
                       <td className="p-3 text-sm font-bold">{m.total}</td>
                       <td className="p-3 text-sm">{m.gradeLetter}</td>
                       <td className="p-3 flex justify-end gap-2">
                         <button onClick={() => handleApprove(m.id)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                           <Check size={18} />
                         </button>
                         <button onClick={() => handleReject(m.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                           <X size={18} />
                         </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>

        {/* AI & Chart Section */}
        <div className="space-y-6">
          {/* AI Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-purple-600" size={20} />
              <h3 className="font-bold text-gray-800">AI Result Insight</h3>
            </div>
            
            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Loader className="animate-spin mb-2" />
                <span className="text-xs">Processing data...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="text-sm text-gray-600 leading-relaxed bg-purple-50 p-3 rounded-lg border border-purple-100">
                {aiAnalysis}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">Generate insights on pending marks.</p>
                <button 
                  onClick={runAnalysis}
                  disabled={pendingMarks.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Analyze with Gemini
                </button>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-64">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Processing Status</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: any) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value ?? '-'}</p>
    </div>
    <div className={`w-2 h-10 ${color} rounded-full opacity-20`}></div>
  </div>
);