'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../hooks/useWallet';
import { getContract } from '../../utils/contract';
import { ethers } from 'ethers';
import WalletConnect from '../../components/WalletConnect';
import { formatAddress } from '../../utils/web3';
import CreateEventForm from '../../components/CreateEventForm';

export default function AdminPage() {
  const router = useRouter();
  const { account, isMetaMaskInstalled } = useWallet();
  const ADMIN_ADDRESS = "0xb05542907644713d95004f9e5984fcb706165937";
  const isAdmin = account && account.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventId, setFilterEventId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, attended, not-attended
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [allAttendees, setAllAttendees] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = getContract(signer);
          const eventCount = await contract.getEventCount();
          const eventsArr = [];
          for (let i = 0; i < Number(eventCount); i++) {
            const event = await contract.events(i);
            eventsArr.push({
              id: Number(event[0]),
              name: event[1],
              description: event[2],
              date: new Date(Number(event[3]) * 1000).toISOString().slice(0, 10),
              location: event[4],
              maxAttendees: Number(event[5]),
              depositAmount: ethers.formatEther(BigInt(event[6].toString())),
              organizer: event[7],
              isActive: event[8],
              isFinalized: event[9],
              totalRSVPs: Number(event[10]),
              totalAttended: Number(event[11]),
              category: '',
              attendees: [],
              currentAttendees: 0
            });
          }
          setEvents(eventsArr);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [account]);

  // Only show admin dashboard if isAdmin is true
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="mb-4">You must be logged in as the contract owner to view the admin dashboard.</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleAttendanceToggle = async (attendeeId, eventId) => {
    setIsUpdating(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update in allAttendees
      const updatedAttendees = allAttendees.map(attendee => 
        attendee.id === attendeeId && attendee.eventId === eventId
          ? { ...attendee, hasAttended: !attendee.hasAttended }
          : attendee
      );
      setAllAttendees(updatedAttendees);
      
      // Update in events
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            attendees: event.attendees.map(attendee =>
              attendee.id === attendeeId
                ? { ...attendee, hasAttended: !attendee.hasAttended }
                : attendee
            )
          };
        }
        return event;
      });
      setEvents(updatedEvents);
      
      console.log(`Updated attendance for attendee ${attendeeId} in event ${eventId}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAttendees = allAttendees.filter(attendee => {
    const matchesSearch = attendee.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (attendee.name && attendee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         attendee.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventFilter = filterEventId === 'all' || attendee.eventId === parseInt(filterEventId);
    
    const matchesStatusFilter = filterStatus === 'all' || 
                               (filterStatus === 'attended' && attendee.hasAttended) ||
                               (filterStatus === 'not-attended' && !attendee.hasAttended);
    
    return matchesSearch && matchesEventFilter && matchesStatusFilter;
  });

  const totalAttendees = allAttendees.length;
  const totalAttended = allAttendees.filter(a => a.hasAttended).length;
  const attendanceRate = totalAttendees > 0 ? (totalAttended / totalAttendees) * 100 : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showCreateForm && (
            <div className="mb-8">
              <CreateEventForm />
            </div>
          )}
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
              <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
              <div className="h-40 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
              <p className="text-gray-600">Please connect your admin wallet to access the admin dashboard.</p>
            </div>
            
            <WalletConnect variant="card" />
            
            {!isMetaMaskInstalled && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">MetaMask Required</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Install MetaMask browser extension and connect with the admin wallet address.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Unauthorized Access</h2>
            <p className="text-red-600 mb-4">
              This wallet does not have admin privileges. Only the admin wallet can access this dashboard.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Go Back Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div>
      <div className="max-w-2xl mx-auto mt-4 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <div><strong>Connected Wallet:</strong> {account || 'Not connected'}</div>
        <div><strong>Admin Address:</strong> {ADMIN_ADDRESS}</div>
        <div><strong>Admin Status:</strong> {isAdmin ? 'You are admin' : 'Not admin'}</div>
      </div>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showCreateForm && (
          <div className="mb-8">
            <CreateEventForm onSubmit={() => setShowCreateForm(false)} />
          </div>
        )}
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                    Admin Dashboard
                  </span>
                  <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    All Events
                  </span>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-1 rounded-full transition-colors flex items-center gap-2"
                  >
                    <span>{showCreateForm ? 'Close Form' : '+ Create Event'}</span>
                  </button>
                </div>
                <h1 className="text-3xl font-bold mb-2">Event Management System</h1>
                <p className="text-purple-100">Manage all events and attendees from one central dashboard</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{events.length}</div>
                <div className="text-sm text-purple-200">Total Events</div>
                <div className="text-lg font-semibold mt-1">{totalAttendees}</div>
                <div className="text-sm text-purple-200">Total Attendees</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{totalAttendees}</div>
              <div className="text-sm text-blue-600">Total RSVPs</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{totalAttended}</div>
              <div className="text-sm text-green-600">Total Attended</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{totalAttendees - totalAttended}</div>
              <div className="text-sm text-red-600">Total No Shows</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{attendanceRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-600">Overall Attendance Rate</div>
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      event.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {event.totalRSVPs}/{event.maxAttendees} RSVPs
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.depositAmount} ETH deposit
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/event/${event.id}`)}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/admin/${event.id}`)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Manage Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendee Management */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">All Attendees</h3>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by address, name, or event..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-72"
                  />
                </div>
                
                {/* Event Filter */}
                <select
                  value={filterEventId}
                  onChange={(e) => setFilterEventId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Events</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="attended">Attended</option>
                  <option value="not-attended">Not Attended</option>
                </select>
              </div>
            </div>
          </div>

          {filteredAttendees.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2m0 0v-5a3 3 0 016 0v5m-3-5a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees found</h3>
              <p className="text-gray-500">
                {searchTerm || filterEventId !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No one has RSVP\'d to any events yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RSVP Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stake Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendees.map((attendee) => (
                    <tr key={`${attendee.eventId}-${attendee.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {formatAddress(attendee.address).slice(0, 2)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {attendee.name || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {formatAddress(attendee.address)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {attendee.eventName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(attendee.eventDate)} • {attendee.eventLocation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(attendee.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendee.depositAmount} ETH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attendee.hasAttended
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attendee.hasAttended ? 'Attended' : 'Not Attended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleAttendanceToggle(attendee.id, attendee.eventId)}
                          disabled={isUpdating}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            attendee.hasAttended
                              ? 'bg-red-100 hover:bg-red-200 text-red-700'
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          }`}
                        >
                          {isUpdating ? 'Updating...' : attendee.hasAttended ? 'Mark Absent' : 'Mark Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}