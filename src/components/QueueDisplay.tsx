import React, { useEffect, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ClockIcon, UsersIcon, BellIcon, MailIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from 'lucide-react';
import { sendQueueEmail } from '../service/api/email';
import { formatQueueNumber } from '../service/api/utils';
const QueueDisplay: React.FC = () => {
  const {
    queueNumber,
    currentServing,
    estimatedWaitTime,
    customerData
  } = useQueue();
  const [remainingTime, setRemainingTime] = useState(estimatedWaitTime);
  const [notified, setNotified] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // Calculate position in queue using formatted numbers
  const position = queueNumber ? parseInt(formatQueueNumber(queueNumber)) - parseInt(formatQueueNumber(currentServing)) : 0;
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('data');

    if (encodedData) {
      try {
        const decoded = decodeURIComponent(encodedData);
        const parsed = JSON.parse(decoded);
        const branchId = parsed.metadata?.branchId;
        if (branchId) {
          localStorage.setItem('branchId', branchId);
          console.log('Branch ID saved to localStorage:', branchId);
        }
      } catch (error) {
        console.error('Error parsing branchId from URL:', error);
      }
    }
  }, []);
  useEffect(() => {
    // Simulate countdown
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    // Simulate notification when 5th in line
    if (position <= 5 && !notified) {
      setNotified(true);
    }
  }, [position, notified]);
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();handleSendEmail
    if (!email) return;
    setEmailStatus('sending');
    setErrorMessage('');
    try {
      await sendQueueEmail({
        email,
        queueNumber: queueNumber || '',
        customerName: customerData.name || '',
        estimatedWaitTime: remainingTime
      });
      setEmailStatus('success');
      setEmail('');
      // Reset success message after 3 seconds
      setTimeout(() => {
        setEmailStatus('idle');
      }, 3000);
    } catch (error) {
      setEmailStatus('error');
      setErrorMessage('Failed to send email. Please try again.');
    }
  };
  return <div className="text-center">
      <div className="bg-blue-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
        <div>
          <p className="text-gray-500 text-sm">Your Number</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatQueueNumber(queueNumber)}
          </p>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        You're in the Queue!
      </h2>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-gray-700">Position in Queue</p>
          </div>
          <p className="font-bold">{position}</p>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-gray-700">Estimated Wait Time</p>
          </div>
          <p className="font-bold">{remainingTime} mins</p>
        </div>
     
      </div>
      {/* Email Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Get Queue Details via Email
        </h3>
        <form onSubmit={handleSendEmail} className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <button type="submit" disabled={emailStatus === 'sending'} className={`px-4 py-2 rounded-lg ${emailStatus === 'sending' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white flex items-center`}>
              {emailStatus === 'sending' ? <>
                  <LoaderIcon className="animate-spin h-4 w-4 mr-2" />
                  Sending...
                </> : 'Send'}
            </button>
          </div>
          {emailStatus === 'success' && <div className="flex items-center text-green-600 text-sm">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Queue details sent to your email!
            </div>}
          {emailStatus === 'error' && <div className="flex items-center text-red-600 text-sm">
              <XCircleIcon className="h-4 w-4 mr-1" />
              {errorMessage}
            </div>}
        </form>
      </div>
      <div className={`p-4 rounded-lg mb-6 ${notified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center">
          <BellIcon className={`h-5 w-5 mr-2 ${notified ? 'text-green-500' : 'text-yellow-500'}`} />
          <p className="text-sm">
            {notified ? "You're almost up! Please return to the counter area." : "Please return when you're 5 away to avoid missing your turn."}
          </p>
        </div>
      </div>
      <p className="text-gray-500 text-sm">
        Your queue number will be called at the counter.
        <br />
        Please have your IC/Passport ready.
      </p>
    </div>;
};
export default QueueDisplay;