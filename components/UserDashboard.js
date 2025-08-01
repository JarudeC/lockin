'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAppState } from '../context/AppContext';
import { useNotifications } from './NotificationSystem';
import Button from './ui/Button';
import { InlineLoader } from './LoadingSpinner';
import {
  getUserRSVPs,
  formatDate,
  formatTimeRange,
  formatCurrency,
  getEventStatus,
  getTimeUntilEvent,
  calculateAttendanceRate,
  groupEventsByStatus,
  formatRelativeTime,
  getInitials,
  generateAvatar
} from '../utils/helpers';

const UserDashboard = () => {
  const { account, formatAddress } = useWallet();
  const { events, isEventsLoading } = useAppState();
  const notifications = useNotifications();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [userStats, setUserStats] = useState({
    totalRSVPs: 0,
    upcomingEvents: 0,
    attendedEvents: 0,
    totalStaked: 0,
    attendanceRate: 0
  });

  const userRSVPs = getUserRSVPs(events, account);
  const groupedEvents = groupEventsByStatus(userRSVPs);

  useEffect(() => {
    if (userRSVPs.length > 0) {
      const totalRSVPs = userRSVPs.length;
      const upcomingEvents = (groupedEvents.upcoming || []).length + (groupedEvents.today || []).length;
      const pastEvents = (groupedEvents.past || []).length;
      const attendedEvents = userRSVPs.filter(event => {
        const userAttendee = event.attendees.find(a => a.address.toLowerCase() === account.toLowerCase());
        return userAttendee?.hasAttended;
      }).length;
      const totalStaked = userRSVPs.reduce((sum, event) => sum + parseFloat(event.depositAmount), 0);
      const attendanceRate = pastEvents > 0 ? Math.round((attendedEvents / pastEvents) * 100) : 0;

      setUserStats({
        totalRSVPs,
        upcomingEvents,
        attendedEvents,
        totalStaked,
        attendanceRate
      });
    }
  }, [userRSVPs, groupedEvents, account]);

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V9z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-500">Please connect your wallet to view your event dashboard.</p>
      </div>
    );
  }

  if (isEventsLoading) {
    return <InlineLoader text="Loading your events..." />;
  }

  return (
    <div className="space-y-8">
      {/* User Profile Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${generateAvatar(account)}`}>
              {getInitials(formatAddress(account))}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Your Event Dashboard</h2>
              <p className="text-indigo-200">Connected: {formatAddress(account)}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalRSVPs}</div>
              <div className="text-sm text-blue-600">Total RSVPs</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.upcomingEvents}</div>
              <div className="text-sm text-green-600">Upcoming</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.attendedEvents}</div>
              <div className="text-sm text-purple-600">Attended</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{userStats.totalStaked.toFixed(3)}</div>
              <div className="text-sm text-yellow-600">ETH Staked</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{userStats.attendanceRate}%</div>
              <div className="text-sm text-indigo-600">Attendance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'upcoming', label: 'Upcoming Events', count: userStats.upcomingEvents },
              { key: 'past', label: 'Past Events', count: (groupedEvents.past || []).length },
              { key: 'all', label: 'All Events', count: userStats.totalRSVPs }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <EventsList 
            events={getFilteredEvents(userRSVPs, activeTab, groupedEvents)} 
            userAddress={account}
          />
        </div>
      </div>
    </div>
  );
};

const getFilteredEvents = (events, activeTab, groupedEvents) => {
  switch (activeTab) {
    case 'upcoming':
      return [...(groupedEvents.upcoming || []), ...(groupedEvents.today || [])];
    case 'past':
      return groupedEvents.past || [];
    case 'all':
    default:
      return events;
  }
};

const EventsList = ({ events, userAddress }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
        <p className="text-gray-500 mb-4">You haven't RSVPed to any events yet.</p>
        <Button variant="primary" size="sm">
          Browse Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} userAddress={userAddress} />
      ))}
    </div>
  );
};

const EventCard = ({ event, userAddress }) => {
  const userAttendee = event.attendees.find(a => a.address.toLowerCase() === userAddress.toLowerCase());
  const eventStatus = getEventStatus(event.date, event.startTime);
  const timeUntil = getTimeUntilEvent(event.date, event.startTime);

  const statusColors = {
    upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
    today: 'bg-green-50 text-green-700 border-green-200',
    past: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[eventStatus]}`}>
              {eventStatus === 'today' ? 'Today' : eventStatus}
            </span>
            {userAttendee?.hasAttended && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                ✓ Attended
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-3">{event.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
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
              </svg>
              {event.location}
            </div>
          </div>
        </div>

        <div className="text-right ml-6">
          <div className="text-lg font-semibold text-indigo-600">
            {formatCurrency(event.depositAmount)}
          </div>
          <div className="text-sm text-gray-500">Staked</div>
          {timeUntil && (
            <div className="text-sm text-gray-500 mt-2">
              in {timeUntil}
            </div>
          )}
        </div>
      </div>

      {/* RSVP Details */}
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="text-gray-500">RSVPed:</span>
              <span className="ml-1 font-medium">{formatRelativeTime(userAttendee?.timestamp)}</span>
            </div>
            {userAttendee?.name && (
              <div>
                <span className="text-gray-500">As:</span>
                <span className="ml-1 font-medium">{userAttendee.name}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-1 font-medium ${
                userAttendee?.hasAttended ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {userAttendee?.hasAttended ? 'Attended' : 'Confirmed'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/event/${event.id}`, '_blank')}
            >
              View Event
            </Button>
            {eventStatus === 'upcoming' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Handle cancel RSVP - would integrate with RSVPButton logic
                  console.log('Cancel RSVP for event', event.id);
                }}
              >
                Cancel RSVP
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;