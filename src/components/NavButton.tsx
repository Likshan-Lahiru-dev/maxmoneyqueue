import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MonitorIcon, UsersIcon } from 'lucide-react';
const NavButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCounterRoute = location.pathname === '/counter' || location.pathname === '/signin';
  const handleClick = () => {
    if (isCounterRoute) {
      navigate('/');
    } else {
      navigate('/signin');
    }
  };
  return <button onClick={handleClick} className="fixed bottom-6 right-6 bg-[#1e7cc3] hover:bg-[#246ba0] text-white p-3 rounded-full shadow-lg transition-colors z-50">
      {isCounterRoute ? <UsersIcon className="h-6 w-6" /> : <MonitorIcon className="h-6 w-6" />}
    </button>;
};
export default NavButton;