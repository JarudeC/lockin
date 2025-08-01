// Utility functions for EventRSVP

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatTimeRange = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const formatCurrency = (amount, currency = 'ETH') => {
  return `${parseFloat(amount).toFixed(3)} ${currency}`;
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatAddressLong = (address) => {
  if (!address) return '';
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
};

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

export const generateTransactionHash = () => {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

export const isEventUpcoming = (eventDate) => {
  const now = new Date();
  const event = new Date(eventDate);
  return event > now;
};

export const isEventToday = (eventDate) => {
  const today = new Date();
  const event = new Date(eventDate);
  return today.toDateString() === event.toDateString();
};

export const isEventPast = (eventDate) => {
  const now = new Date();
  const event = new Date(eventDate);
  return event < now;
};

export const getEventStatus = (eventDate, startTime) => {
  const now = new Date();
  const eventDateTime = new Date(`${eventDate}T${startTime}`);
  
  if (eventDateTime > now) {
    return 'upcoming';
  } else if (isEventToday(eventDate)) {
    return 'today';
  } else {
    return 'past';
  }
};

export const getTimeUntilEvent = (eventDate, startTime) => {
  const now = new Date();
  const eventDateTime = new Date(`${eventDate}T${startTime}`);
  const diffMs = eventDateTime - now;
  
  if (diffMs < 0) return null;
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEthereumAddress = (address) => {
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethRegex.test(address);
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export const calculateAttendanceRate = (attendees) => {
  if (!attendees.length) return 0;
  const attended = attendees.filter(a => a.hasAttended).length;
  return Math.round((attended / attendees.length) * 100);
};

export const getEventCapacityColor = (current, max) => {
  const percentage = (current / max) * 100;
  if (percentage >= 90) return 'text-red-600 bg-red-50';
  if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};

export const sortEventsByDate = (events, ascending = true) => {
  return [...events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const groupEventsByStatus = (events) => {
  return events.reduce((acc, event) => {
    const status = getEventStatus(event.date, event.startTime);
    if (!acc[status]) acc[status] = [];
    acc[status].push(event);
    return acc;
  }, {});
};

export const getUserRSVPs = (events, userAddress) => {
  if (!userAddress) return [];
  
  return events.filter(event => 
    event.attendees.some(attendee => 
      attendee.address.toLowerCase() === userAddress.toLowerCase()
    )
  );
};

export const isUserRSVPed = (event, userAddress) => {
  if (!userAddress || !event.attendees) return false;
  
  return event.attendees.some(attendee => 
    attendee.address.toLowerCase() === userAddress.toLowerCase()
  );
};

export const getUserAttendeeInfo = (event, userAddress) => {
  if (!userAddress || !event.attendees) return null;
  
  return event.attendees.find(attendee => 
    attendee.address.toLowerCase() === userAddress.toLowerCase()
  );
};

export const simulateDelay = (min = 1000, max = 3000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const simulateError = (probability = 0.1) => {
  return Math.random() < probability;
};

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return formatShortDate(dateString);
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateAvatar = (address) => {
  // Generate a simple avatar color based on address
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  const index = parseInt(address.slice(-2), 16) % colors.length;
  return colors[index];
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};