'use client';

import { useState } from 'react';
import TimeSelect from './TimeSelect';

export default function CreateEventForm({ onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    depositAmount: '',
    maxAttendees: '',
    description: '',
    organizer: '',
    category: 'Technology'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const categories = [
    'Technology',
    'Conference',
    'Workshop',
    'Art & Culture',
    'Security',
    'Networking',
    'Education',
    'Business',
    'Other'
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length < 5 ? 'Event name must be at least 5 characters' : '';
      case 'date':
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today ? 'Event date must be in the future' : '';
      case 'startTime':
        return !value ? 'Start time is required' : '';
      case 'endTime':
        if (!value) return 'End time is required';
        if (formData.startTime && value <= formData.startTime) {
          return 'End time must be after start time';
        }
        return '';
      case 'location':
        return value.trim().length < 3 ? 'Location must be at least 3 characters' : '';
      case 'depositAmount':
        const amount = parseFloat(value);
        return isNaN(amount) || amount <= 0 || amount > 10 ? 'Deposit must be between 0.001 and 10 ETH' : '';
      case 'maxAttendees':
        const attendees = parseInt(value);
        return isNaN(attendees) || attendees < 1 || attendees > 1000 ? 'Max attendees must be between 1 and 1000' : '';
      case 'description':
        return value.trim().length < 20 ? 'Description must be at least 20 characters' : '';
      case 'organizer':
        return value.trim().length < 2 ? 'Organizer name must be at least 2 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const inputClasses = (fieldName) => {
    return `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
      errors[fieldName] && touched[fieldName]
        ? 'border-red-500 bg-red-50'
        : 'border-gray-300'
    }`;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Event</h2>
        <p className="text-gray-600">Fill out the details for your blockchain-secured event.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClasses('name')}
              placeholder="Enter event name"
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClasses('date')}
              />
              {errors.date && touched.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <TimeSelect
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                placeholder="Select start time"
                error={errors.startTime && touched.startTime}
              />
              {errors.startTime && touched.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <TimeSelect
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                placeholder="Select end time"
                error={errors.endTime && touched.endTime}
              />
              {errors.endTime && touched.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClasses('location')}
                placeholder="Event venue or address"
              />
              {errors.location && touched.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Required Deposit (ETH) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="depositAmount"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  step="0.001"
                  min="0.001"
                  max="10"
                  className={inputClasses('depositAmount')}
                  placeholder="0.1"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">ETH</span>
              </div>
              {errors.depositAmount && touched.depositAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.depositAmount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-2">
                Max Attendees *
              </label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleChange}
                onBlur={handleBlur}
                min="1"
                max="1000"
                className={inputClasses('maxAttendees')}
                placeholder="100"
              />
              {errors.maxAttendees && touched.maxAttendees && (
                <p className="mt-1 text-sm text-red-600">{errors.maxAttendees}</p>
              )}
            </div>

            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-2">
                Organizer *
              </label>
              <input
                type="text"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClasses('organizer')}
                placeholder="Your name or organization"
              />
              {errors.organizer && touched.organizer && (
                <p className="mt-1 text-sm text-red-600">{errors.organizer}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClasses('category')}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              className={inputClasses('description')}
              placeholder="Describe your event, what attendees can expect, agenda, etc."
            />
            {errors.description && touched.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-indigo-800 mb-1">How it works:</h4>
              <p className="text-sm text-indigo-700">
                Attendees will stake {formData.depositAmount || 'X'} ETH to RSVP. They get their deposit back when they attend, 
                but forfeit it if they don't show up. This ensures committed attendance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}