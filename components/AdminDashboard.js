'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { formatAddress } from '../utils/web3';

export default function AdminDashboard({ event, onUpdateAttendance }) {
  const { isAdmin } = useWallet();
  const [attendees, setAttendees] = useState(event?.attendees || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, attended, not-attended
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setAttendees(event?.attendees || []);
  }, [event]);

  const handleAttendanceToggle = async (attendeeId) => {
    setIsUpdating(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedAttendees = attendees.map(attendee => 
        attendee.id === attendeeId 
          ? { ...attendee, hasAttended: !attendee.hasAttended }
          : attendee
      );
      
      setAttendees(updatedAttendees);
      
      if (onUpdateAttendance) {
        onUpdateAttendance(attendeeId, updatedAttendees.find(a => a.id === attendeeId).hasAttended);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (attendee.name && attendee.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'attended' && attendee.hasAttended) ||
                         (filterStatus === 'not-attended' && !attendee.hasAttended);
    
    return matchesSearch && matchesFilter;
  });

  const attendedCount = attendees.filter(a => a.hasAttended).length;
  const attendanceRate = attendees.length > 0 ? (attendedCount / attendees.length) * 100 : 0;

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-600">You must be connected as an admin wallet to access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Event Management</h2>
          <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
            Admin Dashboard
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{attendees.length}</div>
            <div className="text-sm text-blue-600">Total RSVPs</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{attendedCount}</div>
            <div className="text-sm text-green-600">Attended</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{attendees.length - attendedCount}</div>
            <div className="text-sm text-red-600">No Shows</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{attendanceRate.toFixed(1)}%</div>
            <div className="text-sm text-purple-600">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Attendee Management */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendee Check-in</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by address or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                />
              </div>
              
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Attendees</option>
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
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No one has RSVP\'d to this event yet.'
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
                  <tr key={attendee.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attendee.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.depositAmount} ETH
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
                        onClick={() => handleAttendanceToggle(attendee.id)}
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

      {/* Admin Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Export Attendee List
          </button>
          <button className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Process Refunds
          </button>
          <button className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Send Notifications
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}