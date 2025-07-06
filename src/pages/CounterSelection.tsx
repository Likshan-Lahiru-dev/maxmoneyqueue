import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorIcon, LoaderIcon, LayoutGridIcon } from 'lucide-react';
import { getCountersByBranch, CounterApiResponse } from '../service/api/counter';
const CounterSelection: React.FC = () => {
  const [counters, setCounters] = useState<CounterApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const branchId = localStorage.getItem('branchId') || '1320429a-84e4-43dc-ac13-95f2e24fb3d6';
        const countersData = await getCountersByBranch(branchId);
        setCounters(countersData);
      } catch (err) {
        setError('Failed to load counters');
      } finally {
        setLoading(false);
      }
    };
    fetchCounters();
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-800">
            Try Again
          </button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Select Counter Display
          </h1>
          <button onClick={() => navigate('/display/all')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <LayoutGridIcon className="h-5 w-5" />
            View All Counters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counters.map(counter => <button key={counter.counterId} onClick={() => navigate(`/display/${counter.counterId}`)} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition-all duration-200 hover:shadow-lg group">
              <div className="flex items-center justify-between mb-4">
                <MonitorIcon className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-gray-500">
                  Counter #{counter.counterNumber}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {counter.counterName}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {counter.description}
              </p>
            </button>)}
        </div>
      </div>
    </div>;
};
export default CounterSelection;