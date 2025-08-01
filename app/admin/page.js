'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../hooks/useWallet';
import { mockEvents } from '../../utils/mockData';
import WalletConnect from '../../components/WalletConnect';
import { formatAddress } from '../../utils/web3';

export default function AdminPage() {
  const router = useRouter();
  const { account, isAdmin, isMetaMaskInstalled } = useWallet();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventId, setFilterEventId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, attended, not-attended
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [allAttendees, setAllAttendees] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setEvents(mockEvents);
        
        // Flatten all attendees with event info
        const attendeesWithEvent = [];
        mockEvents.forEach(event => {
          event.attendees.forEach(attendee => {
            attendeesWithEvent.push({
              ...attendee,
              eventId: event.id,
              eventName: event.name,
              eventDate: event.date,
              eventLocation: event.location,
              depositAmount: event.depositAmount
            });
          });
        });
        setAllAttendees(attendeesWithEvent);
        
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Remove auto redirect - let users see the page and choose to leave manually

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
  );
}