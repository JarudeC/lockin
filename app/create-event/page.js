'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateEventForm from '../../components/CreateEventForm';
import { addEvent } from '../../utils/mockData';

export default function CreateEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvent = addEvent(formData);
      
      // Redirect to the new event page
      router.push(`/event/${newEvent.id}`);
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error('Error creating event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Event
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Set up a blockchain-secured event with ETH deposits to ensure committed attendance.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <CreateEventForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Event Creation Guidelines
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="text-indigo-600 font-medium mr-2">•</span>
                <span>Choose a deposit amount that's meaningful but not prohibitive (typically 0.05-0.25 ETH)</span>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 font-medium mr-2">•</span>
                <span>Set realistic attendance limits based on your venue capacity</span>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 font-medium mr-2">•</span>
                <span>Provide clear event details to help attendees make informed decisions</span>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 font-medium mr-2">•</span>
                <span>Plan check-in procedures to verify attendance and release deposits</span>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 font-medium mr-2">•</span>
                <span>Consider creating a backup communication channel for attendees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}