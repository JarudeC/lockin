'use client';

import { useState, useRef, useEffect } from 'react';

export default function TimeSelect({ value, onChange, placeholder = "Select time", error, id, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const dropdownRef = useRef(null);

  // Generate time options
  const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  // Parse existing value when component mounts or value changes
  useEffect(() => {
    if (value) {
      const [hourMinute] = value.split(':');
      const hour24 = parseInt(hourMinute);
      const minute = value.split(':')[1] || '00';
      
      if (hour24 === 0) {
        setSelectedHour('12');
        setSelectedPeriod('AM');
      } else if (hour24 === 12) {
        setSelectedHour('12');
        setSelectedPeriod('PM');
      } else if (hour24 > 12) {
        setSelectedHour((hour24 - 12).toString().padStart(2, '0'));
        setSelectedPeriod('PM');
      } else {
        setSelectedHour(hour24.toString().padStart(2, '0'));
        setSelectedPeriod('AM');
      }
      
      setSelectedMinute(minute);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayTime = () => {
    if (!selectedHour || !selectedMinute) return '';
    return `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
  };

  const convertTo24Hour = (hour12, minute, period) => {
    let hour24 = parseInt(hour12);
    
    if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  const handleTimeChange = (newHour, newMinute, newPeriod) => {
    if (newHour && newMinute && newPeriod) {
      const time24 = convertTo24Hour(newHour, newMinute, newPeriod);
      onChange({
        target: {
          name: name,
          value: time24
        }
      });
    }
  };

  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
    handleTimeChange(hour, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute);
    handleTimeChange(selectedHour, minute, selectedPeriod);
  };

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    handleTimeChange(selectedHour, selectedMinute, period);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-left flex justify-between items-center ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <span className={formatDisplayTime() ? 'text-gray-900' : 'text-gray-500'}>
          {formatDisplayTime() || placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Select Time</div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Hours */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Hour</div>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleHourSelect(hour)}
                      className={`w-full px-3 py-2 text-sm text-center rounded-md transition-all duration-150 ${
                        selectedHour === hour 
                          ? 'bg-indigo-100 text-indigo-700 font-semibold ring-2 ring-indigo-200' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Minute</div>
                <div className="space-y-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleMinuteSelect(minute)}
                      className={`w-full px-3 py-2 text-sm text-center rounded-md transition-all duration-150 ${
                        selectedMinute === minute 
                          ? 'bg-indigo-100 text-indigo-700 font-semibold ring-2 ring-indigo-200' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Period</div>
                <div className="space-y-1">
                  {periods.map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => handlePeriodSelect(period)}
                      className={`w-full px-3 py-2 text-sm text-center rounded-md transition-all duration-150 ${
                        selectedPeriod === period 
                          ? 'bg-indigo-100 text-indigo-700 font-semibold ring-2 ring-indigo-200' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}