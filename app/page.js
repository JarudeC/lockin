'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EventCard from '../components/EventCard';
import { CardSkeleton } from '../components/LoadingSpinner';
import { useAppState, useAppActions } from '../context/AppContext';
import Input from '../components/ui/Input';

export default function Home() {
  const { events, isEventsLoading, searchTerm } = useAppState();
  const { setSearchTerm } = useAppActions();
  
  const filteredEvents = searchTerm 
    ? events.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : events.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate >= today && event.isActive;
      });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to LockIn
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional Web3 event management with blockchain-based RSVPs. 
          Stake ETH to secure your attendance and prevent no-shows.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              className="w-full sm:w-64"
            />
          </div>
        </div>

        {isEventsLoading ? (
          <CardSkeleton count={6} />
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No upcoming events at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <div className="bg-indigo-100 rounded-full p-3 mb-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">1. Find Event</h4>
            <p className="text-sm text-gray-600">Browse upcoming events with required ETH stakes to secure your attendance.</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-indigo-100 rounded-full p-3 mb-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">2. Stake ETH to RSVP</h4>
            <p className="text-sm text-gray-600">Commit to attending by staking the required ETH amount.</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-indigo-100 rounded-full p-3 mb-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">3. Attend & Get Refunded</h4>
            <p className="text-sm text-gray-600">Show up to get your stake back. No-shows forfeit their ETH.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
