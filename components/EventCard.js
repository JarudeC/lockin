import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';
import RSVPButton from './RSVPButton';
import { formatDate, formatTimeRange } from '../utils/helpers';

export default function EventCard({ event }) {
  const { isAdmin } = useWallet();
  const progressPercentage = (event.currentAttendees / event.maxAttendees) * 100;
  const isNearCapacity = progressPercentage > 80;
  const isFull = event.currentAttendees >= event.maxAttendees;

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Link href={`/event/${event.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1">
                {event.name}
              </h3>
            </Link>
            <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full mt-2">
              {event.category}
            </span>
          </div>
          <div className="flex flex-col items-end ml-4">
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
              {event.depositAmount} ETH
            </span>
            {isFull && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full mt-1">
                FULL
              </span>
            )}
            {isNearCapacity && !isFull && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full mt-1">
                Almost Full
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatShortDate(event.date)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTimeRange(event.startTime, event.endTime)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{event.currentAttendees}/{event.maxAttendees} attending</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">by {event.organizer}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Capacity</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
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
        
        <div className="flex gap-2">
          <Link 
            href={`/event/${event.id}`}
            className={`${isAdmin ? 'flex-1' : 'flex-1'} bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center text-sm`}
          >
            View Details
          </Link>
          {isAdmin ? (
            <Link 
              href={`/admin/${event.id}`}
              className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center text-sm"
            >
              Manage
            </Link>
          ) : (
            <div className="flex-1">
              <RSVPButton event={event} size="sm" fullWidth />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}