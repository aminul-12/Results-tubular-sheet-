import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentTranscript } from './pages/StudentTranscript';
import { Role } from './types';

const AppContent: React.FC = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      {user.role === Role.TEACHER && <TeacherDashboard />}
      {user.role === Role.ADMIN && <AdminDashboard />}
      {user.role === Role.STUDENT && <StudentTranscript />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;