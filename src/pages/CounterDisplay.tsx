import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MonitorIcon } from 'lucide-react';
import { getCountersByBranch, CounterApiResponse } from '../service/api/counter';
import { getQueuesByBranch, getCurrentServingNumber } from '../service/api/queue';
import { formatQueueNumber } from '../service/api/utils';
const CounterDisplay: React.FC = () => {
  const {
    counterId
  } = useParams();
  const location = useLocation();
  const isAllCounters = location.pathname === '/display/all';
  const [counters, setCounters] = useState<CounterApiResponse[]>([]);
  const [currentNumbers, setCurrentNumbers] = useState<Record<string, string>>({});
  const [nextNumbers, setNextNumbers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchId = localStorage.getItem('branchId') || '1320429a-84e4-43dc-ac13-95f2e24fb3d6';
        const countersData = await getCountersByBranch(branchId);
        // Filter counters if specific counter is selected
        const filteredCounters = isAllCounters ? countersData : countersData.filter(counter => counter.counterId === counterId);
        setCounters(filteredCounters);
        // Fetch current numbers for all counters
        const numbers: Record<string, string> = {};
        for (const counter of filteredCounters) {
          try {
            const number = await getCurrentServingNumber(counter.counterId);
            numbers[counter.counterId] = number;
          } catch (err) {
            numbers[counter.counterId] = '0000';
          }
        }
        setCurrentNumbers(numbers);
        // Get queues and extract next 10 numbers
        const queuesData = await getQueuesByBranch(branchId);
        const pendingQueues = queuesData.filter(q => q.status === 'Pending').sort((a, b) => parseInt(a.queueNumber) - parseInt(b.queueNumber)).slice(0, 10).map(q => formatQueueNumber(q.queueNumber));
        setNextNumbers(pendingQueues);
      } catch (err) {
        setError('Failed to load counter data');
      }
    };
    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [counterId, isAllCounters]);
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl">{error}</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Grid of Counters */}
        <div className={`grid grid-cols-1 ${counters.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-6 mb-8`}>
          {counters.map(counter => <div key={counter.counterId} className="bg-[#1a1f2e] rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <MonitorIcon className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold">{counter.counterName}</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">Currently Serving</p>
              <div className="bg-[#131722] rounded-xl p-6">
                <div className="animate-appear">
                  <div className="text-7xl font-bold text-blue-400 leading-none tracking-wider text-center">
                    {formatQueueNumber(currentNumbers[counter.counterId] || '0000')}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
        {/* Next Queue Numbers */}
        {nextNumbers.length > 0 && (
            <div className="bg-[#1a1f2e] rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-semibold mb-4">Next Queue Numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...nextNumbers]
                    .sort((a, b) => a - b) // Sort in ascending order
                    .map((number, index) => (
                        <div key={index} className="bg-[#131722] rounded-xl p-4">
                          <div className="text-2xl font-bold text-blue-400 text-center">
                            {number}
                          </div>
                        </div>
                    ))}
              </div>
            </div>
        )}
      </div>
    </div>;
};
export default CounterDisplay;