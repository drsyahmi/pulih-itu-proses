import { useState } from 'react';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <>
      {isAdmin ? (
        <AdminDashboard onToggleLanding={() => setIsAdmin(false)} />
      ) : (
        <LandingPage onToggleAdmin={() => setIsAdmin(true)} />
      )}
    </>
  );
}

export default App;
