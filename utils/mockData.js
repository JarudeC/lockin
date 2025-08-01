export const mockEvents = [
  {
    id: 1,
    name: "Web3 Developer Meetup",
    date: "2025-08-15",
    startTime: "18:00",
    endTime: "21:00",
    location: "Tech Hub Downtown",
    depositAmount: "0.1",
    maxAttendees: 100,
    currentAttendees: 45,
    description: "Join us for an evening of Web3 development discussions and networking. We'll cover the latest trends in blockchain development, smart contract best practices, and have plenty of time for Q&A and networking.",
    organizer: "Tech Hub Community",
    category: "Technology",
    imageUrl: "/api/placeholder/400/200",
    attendees: [
      { 
        id: 1, 
        address: "0x1234567890abcdef1234567890abcdef12345678", 
        name: "Alice Johnson",
        timestamp: "2025-08-01T10:00:00Z",
        hasAttended: true
      },
      { 
        id: 2, 
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", 
        name: "Bob Smith",
        timestamp: "2025-08-01T11:30:00Z",
        hasAttended: false
      },
      { 
        id: 3, 
        address: "0x9876543210fedcba9876543210fedcba98765432", 
        name: "Carol Davis",
        timestamp: "2025-08-02T09:15:00Z",
        hasAttended: true
      },
      { 
        id: 4, 
        address: "0x1111222233334444555566667777888899990000", 
        timestamp: "2025-08-02T14:20:00Z",
        hasAttended: false
      },
      { 
        id: 5, 
        address: "0xfedcbafedcbafedcbafedcbafedcbafedcbafed", 
        name: "David Wilson",
        timestamp: "2025-08-03T16:45:00Z",
        hasAttended: true
      }
    ],
    isActive: true,
    createdAt: "2025-07-20T09:00:00Z"
  },
  {
    id: 2,
    name: "Blockchain Conference 2025",
    date: "2025-08-22",
    startTime: "09:00",
    endTime: "17:00",
    location: "Convention Center",
    depositAmount: "0.25",
    maxAttendees: 200,
    currentAttendees: 120,
    description: "A full-day conference exploring the latest in blockchain technology. Featuring keynote speakers from major blockchain companies and hands-on workshops covering DeFi, NFTs, and emerging Web3 technologies.",
    organizer: "Blockchain Society",
    category: "Conference",
    imageUrl: "/api/placeholder/400/200",
    attendees: [
      { 
        id: 6, 
        address: "0x2222333344445555666677778888999900001111", 
        name: "Emma Brown",
        timestamp: "2025-08-05T08:30:00Z",
        hasAttended: false
      },
      { 
        id: 7, 
        address: "0x3333444455556666777788889999000011112222", 
        name: "Frank Miller",
        timestamp: "2025-08-05T12:15:00Z",
        hasAttended: true
      },
      { 
        id: 8, 
        address: "0x4444555566667777888899990000111122223333", 
        name: "Grace Lee",
        timestamp: "2025-08-06T10:45:00Z",
        hasAttended: false
      },
      { 
        id: 9, 
        address: "0x5555666677778888999900001111222233334444", 
        name: "Henry Taylor",
        timestamp: "2025-08-07T15:20:00Z",
        hasAttended: true
      }
    ],
    isActive: true,
    createdAt: "2025-07-15T14:00:00Z"
  },
  {
    id: 3,
    name: "DeFi Workshop",
    date: "2025-08-28",
    startTime: "14:00",
    endTime: "17:30",
    location: "Innovation Lab",
    depositAmount: "0.05",
    maxAttendees: 50,
    currentAttendees: 28,
    description: "Hands-on workshop covering DeFi protocols and smart contracts. Learn how to build and deploy your own DeFi applications using popular frameworks and tools.",
    organizer: "DeFi Academy",
    category: "Workshop",
    imageUrl: "/api/placeholder/400/200",
    attendees: [
      { 
        id: 10, 
        address: "0x6666777788889999000011112222333344445555", 
        name: "Isabella White",
        timestamp: "2025-08-10T09:30:00Z",
        hasAttended: true
      },
      { 
        id: 11, 
        address: "0x7777888899990000111122223333444455556666", 
        name: "Jack Chen",
        timestamp: "2025-08-11T14:15:00Z",
        hasAttended: false
      },
      { 
        id: 12, 
        address: "0x8888999900001111222233334444555566667777", 
        timestamp: "2025-08-12T11:45:00Z",
        hasAttended: true
      }
    ],
    isActive: true,
    createdAt: "2025-07-25T16:00:00Z"
  },
  {
    id: 4,
    name: "NFT Art Exhibition Opening",
    date: "2025-09-05",
    startTime: "19:00",
    endTime: "22:00",
    location: "Digital Art Gallery",
    depositAmount: "0.08",
    maxAttendees: 75,
    currentAttendees: 15,
    description: "Opening night for our digital art exhibition featuring NFT artists from around the world. Enjoy cocktails, networking, and exclusive first looks at upcoming NFT drops.",
    organizer: "Digital Art Collective",
    category: "Art & Culture",
    imageUrl: "/api/placeholder/400/200",
    attendees: [
      { 
        id: 13, 
        address: "0x9999000011112222333344445555666677778888", 
        name: "Kate Martinez",
        timestamp: "2025-08-15T16:20:00Z",
        hasAttended: false
      },
      { 
        id: 14, 
        address: "0x0000111122223333444455556666777788889999", 
        name: "Liam Garcia",
        timestamp: "2025-08-16T10:30:00Z",
        hasAttended: true
      }
    ],
    isActive: true,
    createdAt: "2025-07-30T12:00:00Z"
  },
  {
    id: 5,
    name: "Smart Contract Security Audit Workshop",
    date: "2025-09-12",
    startTime: "10:00",
    endTime: "16:00",
    location: "Cyber Security Institute",
    depositAmount: "0.15",
    maxAttendees: 30,
    currentAttendees: 8,
    description: "Learn the fundamentals of smart contract security auditing. This intensive workshop covers common vulnerabilities, audit methodologies, and hands-on practice with real-world contracts.",
    organizer: "CyberSec Academy",
    category: "Security",
    imageUrl: "/api/placeholder/400/200",
    attendees: [
      { 
        id: 15, 
        address: "0x1111222233334444555566667777888899990000", 
        name: "Maya Rodriguez",
        timestamp: "2025-08-20T13:45:00Z",
        hasAttended: false
      },
      { 
        id: 16, 
        address: "0x2222333344445555666677778888999900001111", 
        name: "Noah Kim",
        timestamp: "2025-08-21T09:10:00Z",
        hasAttended: true
      }
    ],
    isActive: true,
    createdAt: "2025-08-01T08:00:00Z"
  }
];

export const getEventById = (id) => {
  return mockEvents.find(event => event.id === parseInt(id));
};

export const getUpcomingEvents = () => {
  const today = new Date();
  return mockEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && event.isActive;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const searchEvents = (query) => {
  return mockEvents.filter(event => 
    event.name.toLowerCase().includes(query.toLowerCase()) ||
    event.description.toLowerCase().includes(query.toLowerCase()) ||
    event.category.toLowerCase().includes(query.toLowerCase())
  );
};

export const addEvent = (eventData) => {
  const newEvent = {
    id: Math.max(...mockEvents.map(e => e.id)) + 1,
    ...eventData,
    currentAttendees: 0,
    attendees: [
      { 
        id: 6, 
        address: "0x2222333344445555666677778888999900001111", 
        name: "Emma Brown",
        timestamp: "2025-08-05T08:30:00Z",
        hasAttended: false
      },
      { 
        id: 7, 
        address: "0x3333444455556666777788889999000011112222", 
        name: "Frank Miller",
        timestamp: "2025-08-05T12:15:00Z",
        hasAttended: true
      },
      { 
        id: 8, 
        address: "0x4444555566667777888899990000111122223333", 
        timestamp: "2025-08-06T10:45:00Z",
        hasAttended: false
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString()
  };
  mockEvents.push(newEvent);
  return newEvent;
};

export const rsvpToEvent = (eventId, userAddress) => {
  const event = getEventById(eventId);
  if (!event) return null;
  
  if (event.currentAttendees >= event.maxAttendees) {
    throw new Error('Event is full');
  }
  
  const isAlreadyRegistered = event.attendees.some(
    attendee => attendee.address === userAddress
  );
  
  if (isAlreadyRegistered) {
    throw new Error('Already registered for this event');
  }
  
  event.attendees.push({
    id: event.attendees.length + 1,
    address: userAddress,
    timestamp: new Date().toISOString()
  });
  
  event.currentAttendees = event.attendees.length;
  
  return event;
};

export const cancelRSVP = (eventId, userAddress) => {
  const event = getEventById(eventId);
  if (!event) return null;
  
  event.attendees = event.attendees.filter(
    attendee => attendee.address !== userAddress
  );
  
  event.currentAttendees = event.attendees.length;
  
  return event;
};