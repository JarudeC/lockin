'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '../../../hooks/useWallet';
import { getEventById, updateEventAttendance } from '../../../utils/mockData';
import AdminDashboard from '../../../components/AdminDashboard';
import WalletConnect from '../../../components/WalletConnect';

export default function AdminEventPage() {
  const params = useParams();
  const router = useRouter();
  const { account, isAdmin, isMetaMaskInstalled } = useWallet();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const eventData = getEventById(params.id);
        if (!eventData) {
          setError('Event not found');
          return;
        }
        
        setEvent(eventData);
      } catch (err) {
        setError('Failed to load event data');
        console.error('Error fetching event:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  // Remove auto redirect - let users see the unauthorized message and choose to leave manually

  const handleUpdateAttendance = async (attendeeId, hasAttended) => {
    try {
      // Update local state
      const updatedEvent = { ...event };
      updatedEvent.attendees = updatedEvent.attendees.map(attendee => 
        attendee.id === attendeeId 
          ? { ...attendee, hasAttended }
          : attendee
      );
      setEvent(updatedEvent);

      // Here you would typically make an API call to update the backend
      console.log(`Updated attendance for attendee ${attendeeId}: ${hasAttended}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeRange = (startTime, endTime) => {
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
              <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded mb-6 w-2/3"></div>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Event</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Go Back Home
            </button>
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
              <p className="text-gray-600">Please connect your admin wallet to access this event dashboard.</p>
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
                onClick={() => router.push(`/event/${params.id}`)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View Event Page
              </button>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                    Admin Dashboard
                  </span>
                  <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
                <p className="text-purple-100 mb-2">Organized by {event.organizer}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTimeRange(event.startTime, event.endTime)}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{event.currentAttendees}/{event.maxAttendees}</div>
                <div className="text-sm text-purple-200">RSVPs</div>
                <div className="text-lg font-semibold mt-1">{event.depositAmount} ETH</div>
                <div className="text-sm text-purple-200">Stake Amount</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Dashboard */}
        <AdminDashboard 
          event={event} 
          onUpdateAttendance={handleUpdateAttendance}
        />
      </div>
    </div>
  );
}