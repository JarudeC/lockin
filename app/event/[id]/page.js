'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '../../../hooks/useWallet';
import { useAppState } from '../../../context/AppContext';
import RSVPButton from '../../../components/RSVPButton';
import Button from '../../../components/ui/Button';
import { formatDate, formatTimeRange, getEventStatus } from '../../../utils/helpers';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useWallet();
  const { events, isEventsLoading } = useAppState();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        
        // Find event from global state
        const eventData = events.find(e => e.id === parseInt(params.id));
        if (!eventData) {
          // If not found in state, event doesn't exist
          router.push('/');
          return;
        }
        
        setEvent(eventData);
      } catch (err) {
        console.error('Failed to load event details:', err);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isEventsLoading) {
      fetchEvent();
    }
  }, [params.id, router, events, isEventsLoading]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-6 w-2/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const progressPercentage = (event.currentAttendees / event.maxAttendees) * 100;
  const isFull = event.currentAttendees >= event.maxAttendees;
  const isNearCapacity = progressPercentage > 80;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                  <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {event.depositAmount} ETH
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {event.name}
                </h1>
                <p className="text-lg text-indigo-100 mb-4">
                  Organized by {event.organizer}
                </p>
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
                    {event.startTime && event.endTime ? formatTimeRange(event.startTime, event.endTime) : 'Time not specified'}
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
              
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {event.currentAttendees !== undefined ? event.currentAttendees : 0}/{event.maxAttendees}
                  </div>
                  <div className="text-sm text-indigo-200">attendees</div>
                </div>
                {isFull && (
                  <span className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    FULL
                  </span>
                )}
                {isNearCapacity && !isFull && (
                  <span className="bg-yellow-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    Almost Full
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                        <dd className="text-sm text-gray-900">{formatDate(event.date)} • {event.startTime && event.endTime ? formatTimeRange(event.startTime, event.endTime) : 'Time not specified'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="text-sm text-gray-900">{event.location}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Deposit Required</dt>
                        <dd className="text-sm text-gray-900">{event.depositAmount} ETH</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                        <dd className="text-sm text-gray-900">{event.maxAttendees} people</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Progress</h3>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Registered</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isFull 
                              ? 'bg-red-500' 
                              : isNearCapacity 
                                ? 'bg-yellow-500' 
                                : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {event.maxAttendees - event.currentAttendees} spots remaining
                    </p>
                  </div>

                  {isAdmin ? (
                    <div className="space-y-4">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => router.push(`/admin/${event.id}`)}
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        }
                      >
                        Manage Event
                      </Button>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <div>
                            <h4 className="text-sm font-medium text-purple-800 mb-1">Admin Access</h4>
                            <p className="text-xs text-purple-700">
                              You can manage attendees, mark attendance, and view detailed analytics for this event.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <RSVPButton event={event} size="lg" fullWidth />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className="text-sm font-medium text-blue-800 mb-1">Commitment Required</h4>
                            <p className="text-xs text-blue-700">
                              You'll stake {event.depositAmount} ETH to secure your spot. Get it back when you attend, 
                              or forfeit it if you don't show up.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}