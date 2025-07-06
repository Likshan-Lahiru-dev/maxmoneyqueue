import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LogOutIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  LoaderIcon,
  MonitorIcon,
  SearchIcon,
} from 'lucide-react'
import { getCounters, CounterApiResponse } from '../service/api/counter'
import {
  getQueuesByBranch,
  QueueApiResponse, QueueCustomer,
  updateQueue,
} from '../service/api/queue'
import { formatQueueNumber } from '../service/api/utils'
import CustomerDetailsModal from '../components/CustomerDetailsModal'
import { checkNextFifthCustomer } from '../service/api/notification'
type TokenStatus = 'Pending' | 'Completed' | 'Canceled' | 'InProgress'
const Counter: React.FC = () => {
  const { staff, signOut } = useAuth()
  const navigate = useNavigate()
  const [selectedCounter, setSelectedCounter] =
      useState<CounterApiResponse | null>(null)
  const [counters, setCounters] = useState<CounterApiResponse[]>([])
  const [queueList, setQueueList] = useState<QueueApiResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [counterQueues, setCounterQueues] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [selectedCustomer, setSelectedCustomer] =
      useState<QueueCustomer | null>(null)
  const handleViewDetails = (customer: any) => {
    console.log('Customer Details:', {
      fullName: customer.fullName,
      idNumber: customer.idNumber,
      dateOfBirth: customer.dateOfBirth,
      nationality: customer.nationality,
      residentStatus: customer.residentStatus,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      country: customer.country,
      occupation: customer.occupation,
      natureOfBusiness: customer.natureOfBusiness,
      orderPurpose: customer.orderPurpose,
    })
    setSelectedCustomer(customer)
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchId =
            localStorage.getItem('branchId') ||
            '1320429a-84e4-43dc-ac13-95f2e24fb3d6'
        const [countersData, queuesData] = await Promise.all([
          getCounters(),
          getQueuesByBranch(branchId),
        ])
        // Filter counters to only show the selected counter
        const userCounter = countersData.find(
            (counter) => counter.counterId === staff?.counter,
        )
        setCounters(userCounter ? [userCounter] : [])
        if (userCounter) {
          setSelectedCounter(userCounter)
        }
        setQueueList(queuesData)
        // Initialize current queue numbers for each counter
        const activeQueues: Record<string, string> = {}
        queuesData.forEach((queue) => {
          if (queue.status === 'InProgress' && queue.counterId) {
            activeQueues[queue.counterId.counterId] = queue.queueNumber
          }
        })
        setCounterQueues(activeQueues)
        setLoading(false)
      } catch (err) {
        setError('Failed to load data. Please try again.')
        setLoading(false)
      }
    }
    fetchData()
  }, [staff?.counter])
  if (!staff) {
    navigate('/signin')
    return null
  }
  const handleSignOut = async () => {
    // Check if counter has any active queues
    const hasActiveQueues = Object.entries(counterQueues).some(
        ([counterId]) => counterId === staff?.counter,
    )
    if (hasActiveQueues) {
      setSignOutError(
          'Please complete or cancel all active queues before signing out.',
      )
      // Clear error after 3 seconds
      setTimeout(() => setSignOutError(null), 3000)
      return
    }
    const { success } = await signOut()
    if (success) {
      navigate('/signin')
    }
  }
  const handleCallNext = async () => {
    if (!selectedCounter) return
    // Check if counter already has an active queue
    const hasActiveQueue = Object.entries(counterQueues).some(
        ([counterId]) => counterId === selectedCounter.counterId,
    )
    if (hasActiveQueue) {
      setError(
          'Cannot assign new queue while counter has an active queue. Please complete or cancel the current queue first.',
      )
      setTimeout(() => setError(null), 3000)
      return
    }
    try {
      // Get branchId from localStorage
      const branchId =
          localStorage.getItem('branchId') ||
          '1320429a-84e4-43dc-ac13-95f2e24fb3d6'
      // Call the API to check for the next fifth customer before calling the next number
      await checkNextFifthCustomer(branchId)
      // Get all pending queues and sort them by queue number in ascending order
      const pendingQueues = queueList
          .filter((queue) => queue.status === 'Pending')
          .sort((a, b) => {
            const aNum = parseInt(a.queueNumber.split('-').pop() || '0')
            const bNum = parseInt(b.queueNumber.split('-').pop() || '0')
            return aNum - bNum // Sort ascending to get lowest number first
          })
      // Get the first (lowest) pending queue number
      const nextToken = pendingQueues[0]
      if (nextToken) {
        await updateTokenStatus(
            nextToken.queueId,
            nextToken.queueNumber,
            'InProgress',
        )
      }
    } catch (error) {
      console.error('Error checking next fifth customer:', error)
      // Continue with calling the next number even if the notification check fails
      const pendingQueues = queueList
          .filter((queue) => queue.status === 'Pending')
          .sort((a, b) => {
            const aNum = parseInt(a.queueNumber.split('-').pop() || '0')
            const bNum = parseInt(b.queueNumber.split('-').pop() || '0')
            return aNum - bNum
          })
      const nextToken = pendingQueues[0]
      if (nextToken) {
        await updateTokenStatus(
            nextToken.queueId,
            nextToken.queueNumber,
            'InProgress',
        )
      }
    }
  }
  const updateTokenStatus = async (
      queueId: string,
      queueNumber: string,
      newStatus: TokenStatus,
  ) => {
    try {
      const queue = queueList.find((q) => q.queueId === queueId)
      if (!queue) return
      // Get the current counter ID - either from the queue's existing counter or the selected counter
      const currentCounterId =
          queue.counterId?.counterId || selectedCounter?.counterId
      // Prepare update data with the correct structure
      const updateData = {
        branchId: queue.branch.branchId,
        queueTypeId: queue.queueTypeId,
        customerId: queue.customer.customerId,
        status: newStatus,
        counterId:
            newStatus === 'InProgress'
                ? selectedCounter?.counterId
                : currentCounterId,
        completedAt:
            newStatus === 'Completed' || newStatus === 'Canceled'
                ? new Date().toISOString()
                : null,
      }
      // Call API to update queue
      await updateQueue(queueId, updateData)
      // Update local state
      setQueueList((prev) =>
          prev.map((q) =>
              q.queueId === queueId
                  ? {
                    ...q,
                    status: newStatus,
                    counterId:
                        newStatus === 'InProgress' ? selectedCounter : q.counterId,
                    completedAt:
                        newStatus === 'Completed' || newStatus === 'Canceled'
                            ? new Date().toISOString()
                            : null,
                  }
                  : q,
          ),
      )
      // Update counter queues state
      if (currentCounterId) {
        if (newStatus === 'InProgress') {
          setCounterQueues((prev) => ({
            ...prev,
            [currentCounterId]: queueNumber,
          }))
        } else if (newStatus === 'Completed' || newStatus === 'Canceled') {
          setCounterQueues((prev) => {
            const newCounterQueues = {
              ...prev,
            }
            delete newCounterQueues[currentCounterId]
            return newCounterQueues
          })
        }
      }
    } catch (error) {
      console.error('Failed to update queue status:', error)
      setError('Failed to update queue status. Please try again.')
    }
  }
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pending',
        icon: ClockIcon,
      },
      InProgress: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'In Progress',
        icon: CheckIcon,
      },
      Completed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Completed',
        icon: CheckIcon,
      },
      Canceled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Canceled',
        icon: XIcon,
      },
    }
    const config = statusConfig[status as TokenStatus] || statusConfig.Pending
    const Icon = config.icon
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
        >
        <Icon className="w-3 h-3 mr-1" />
          {config.label}
      </span>
    )
  }
  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    )
  }
  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800"
            >
              Try Again
            </button>
          </div>
        </div>
    )
  }
  const filteredQueues = queueList
      .filter((queue) => (statusFilter ? queue.status === statusFilter : true))
      .filter((queue) =>
          searchQuery
              ? queue.queueNumber.toLowerCase().includes(searchQuery.toLowerCase())
              : true,
      )
      .sort((a, b) => {
        // Sort by queue number in descending order
        const aNum = parseInt(a.queueNumber.split('-').pop() || '0')
        const bNum = parseInt(b.queueNumber.split('-').pop() || '0')
        return bNum - aNum
      })
  const totalPages = Math.ceil(filteredQueues.length / itemsPerPage)
  const paginatedQueues = filteredQueues.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
  )
  return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#1e7cc3] text-white p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <img
                  src="https://uploadthingy.s3.us-west-1.amazonaws.com/ckG1TM4XkjPu1FJUzNcwFL/logo.svg"
                  alt="MaxMoney Logo"
                  className="h-8 mr-4"
              />
              <div>
                <h1 className="text-xl font-bold">Queue Management System</h1>
                <p className="text-sm">
                  {selectedCounter
                      ? selectedCounter.counterName
                      : 'Counter Not Assigned'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {signOutError && (
                  <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {signOutError}
                  </div>
              )}
              <button
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 bg-[#246ba0] rounded-lg hover:bg-[#1e7cc3] transition"
              >
                <LogOutIcon className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
            {/* Counter Status Overview */}
            <div className="sticky top-[72px] z-40 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Counter Status Overview
              </h2>
              <div className="flex justify-center">
                {counters.map((counter) => (
                    <div
                        key={counter.counterId}
                        className="w-full max-w-sm p-6 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-700 text-lg">
                      {counter.counterName}
                    </span>
                        <div className="relative">
                          <MonitorIcon className="h-6 w-6 text-blue-500" />
                          {counterQueues[counter.counterId] && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                      <div className="relative text-center">
                        {counterQueues[counter.counterId] ? (
                            <div>
                              <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 tracking-wider animate-appear">
                                {formatQueueNumber(counterQueues[counter.counterId])}
                              </div>
                              <div className="mt-2 text-sm text-blue-600 font-medium">
                                Currently Serving
                              </div>
                            </div>
                        ) : (
                            <div className="py-4">
                              <div className="text-4xl font-bold text-gray-300">
                                —
                              </div>
                              <div className="mt-2 text-sm text-gray-400 font-medium">
                                No Active Queue
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            </div>
            {/* Call Next Number / Active Queue Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-4">
              <div className="text-center">
                {selectedCounter && counterQueues[selectedCounter.counterId] ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium mb-2">
                          Currently Serving
                        </p>
                        <p className="text-3xl font-bold text-blue-700">
                          {formatQueueNumber(
                              counterQueues[selectedCounter.counterId],
                          )}
                        </p>
                      </div>
                      <div className="flex justify-center gap-3">
                        {queueList.map((queue) => {
                          if (
                              queue.queueNumber ===
                              counterQueues[selectedCounter.counterId]
                          ) {
                            return (
                                <div key={queue.queueId} className="flex gap-2">
                                  <button
                                      onClick={() =>
                                          setSelectedCustomer(queue.customer)
                                      }
                                      className="py-2 px-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                                  >
                                    View Details
                                  </button>
                                  <button
                                      onClick={() =>
                                          updateTokenStatus(
                                              queue.queueId,
                                              queue.queueNumber,
                                              'Completed',
                                          )
                                      }
                                      className="py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700"
                                  >
                                    Complete
                                  </button>
                                  <button
                                      onClick={() =>
                                          updateTokenStatus(
                                              queue.queueId,
                                              queue.queueNumber,
                                              'Canceled',
                                          )
                                      }
                                      className="py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                ) : (
                    <button
                        onClick={handleCallNext}
                        disabled={!selectedCounter}
                        className={`py-3 px-6 rounded-lg ${selectedCounter ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      Call Next Number
                    </button>
                )}
              </div>
            </div>
            {/* Queue Status Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Queue Status</h2>
                  <div className="relative">
                    <input
                        type="text"
                        placeholder="Search queue number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 p-2 pr-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                      onClick={() => setStatusFilter(null)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === null ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    All
                  </button>
                  <button
                      onClick={() => setStatusFilter('Pending')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Pending
                  </button>
                  <button
                      onClick={() => setStatusFilter('InProgress')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === 'InProgress' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    In Progress
                  </button>
                  <button
                      onClick={() => setStatusFilter('Completed')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Completed
                  </button>
                  <button
                      onClick={() => setStatusFilter('Canceled')}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === 'Canceled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Canceled
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Queue Number
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Counter
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  {paginatedQueues.map((queue) => (
                      <tr
                          key={queue.queueId}
                          className="border-b border-gray-100"
                      >
                        <td className="py-3 px-4 text-sm">
                          {formatQueueNumber(queue.queueNumber)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {getStatusBadge(queue.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {queue.counterId?.counterName || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                                onClick={() => handleViewDetails(queue.customer)}
                                className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                            >
                              View Details
                            </button>
                            {queue.status === 'InProgress' && (
                                <button
                                    onClick={() =>
                                        updateTokenStatus(
                                            queue.queueId,
                                            queue.queueNumber,
                                            'Completed',
                                        )
                                    }
                                    className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100"
                                >
                                  Complete
                                </button>
                            )}
                            {(queue.status === 'Pending' ||
                                queue.status === 'InProgress') && (
                                <button
                                    onClick={() =>
                                        updateTokenStatus(
                                            queue.queueId,
                                            queue.queueNumber,
                                            'Canceled',
                                        )
                                    }
                                    className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100"
                                >
                                  Cancel
                                </button>
                            )}
                          </div>
                        </td>
                      </tr>
                  ))}
                  {paginatedQueues.length === 0 && (
                      <tr>
                        <td
                            colSpan={4}
                            className="text-center py-8 text-gray-500"
                        >
                          No queues found matching your search criteria
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                {filteredQueues.length > itemsPerPage && (
                    <div className="flex justify-center items-center space-x-2 mt-4">
                      <button
                          onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                      <button
                          onClick={() =>
                              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                          }
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                      >
                        Next
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </main>
        {selectedCustomer && (
            <CustomerDetailsModal
                customer={selectedCustomer}
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                queueData={queueList.find(
                    (q) => q.customer.customerId === selectedCustomer.customerId,
                )}
            />
        )}
      </div>
  )
}
export default Counter
