import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, KeyIcon, LoaderIcon, MonitorIcon } from 'lucide-react';
import { getCountersByBranch, CounterApiResponse } from '../service/api/counter';
const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCounter, setSelectedCounter] = useState('');
  const [counters, setCounters] = useState<CounterApiResponse[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCounters, setIsLoadingCounters] = useState(true);
  const {
    signIn
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        setIsLoadingCounters(true);
        // Get branchId from localStorage or use default
        const branchId = localStorage.getItem('branchId') || '1320429a-84e4-43dc-ac13-95f2e24fb3d6';
        const countersData = await getCountersByBranch(branchId);
        setCounters(countersData);
        if (countersData.length > 0) {
          setSelectedCounter(countersData[0].counterId);
        }
      } catch (err) {
        setError('Failed to load counters');
      } finally {
        setIsLoadingCounters(false);
      }
    };
    fetchCounters();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounter) {
      setError('Please select a counter');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signIn(username, password, selectedCounter);
      navigate('/counter');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white p-8 border border-gray-300 rounded-lg shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Staff Sign In</h1>
            <p className="text-gray-600 mt-2">Sign in to manage queue system</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="counter" className="block text-sm font-medium text-gray-700 mb-1">
                Select Counter
              </label>
              <div className="relative">
                <MonitorIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select id="counter" value={selectedCounter} onChange={e => setSelectedCounter(e.target.value)} className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white" required disabled={isLoadingCounters}>
                  {isLoadingCounters ? <option>Loading counters...</option> : <>
                      <option value="">Select a counter</option>
                      {counters.map(counter => <option key={counter.counterId} value={counter.counterId}>
                          {counter.counterName}
                        </option>)}
                    </>}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter username" required />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter password" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading || isLoadingCounters || !selectedCounter} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex justify-center items-center disabled:bg-blue-300">
              {isLoading ? <>
                  <LoaderIcon className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>;
};
export default SignIn;