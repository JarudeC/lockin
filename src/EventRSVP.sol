// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/console.sol";

/**
 * @title EventRSVP
 * @dev Smart contract for managing event RSVPs with deposit-based commitment
 * @author LockIn Team
 */
contract EventRSVP {
    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string name,
        uint256 eventTimestamp,
        uint256 maxAttendees,
        uint256 depositAmount
    );

    event RSVPConfirmed(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 depositAmount
    );

    event RSVPCancelled(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 refundAmount
    );

    event AttendanceMarked(
        uint256 indexed eventId,
        address indexed attendee,
        bool attended
    );

    event EventFinalized(
        uint256 indexed eventId,
        uint256 totalDepositsDistributed,
        uint256 noShowCount
    );

    // Structs
    struct Event {
        uint256 id;
        string name;
        string description;
        uint256 eventTimestamp;
        string location;
        uint256 maxAttendees;
        uint256 depositAmount;
        address organizer;
        bool isActive;
        bool isFinalized;
        uint256 totalRSVPs;
        uint256 totalAttended;
    }

    struct RSVP {
        address attendee;
        uint256 depositAmount;
        bool hasAttended;
        bool isRefunded;
        uint256 rsvpTimestamp;
    }

    // State variables
    uint256 private eventIdCounter;
    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => RSVP)) public eventRSVPs;
    mapping(uint256 => address[]) public eventAttendees;
    mapping(address => uint256[]) public userEvents;

    // Access control
    address public owner;
    mapping(address => bool) public organizers;

    // Constants
    uint256 public constant CANCELLATION_PERIOD = 24 hours;
    uint256 public constant MAX_DEPOSIT = 1 ether;
    uint256 public constant MIN_DEPOSIT = 0.001 ether;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyOrganizerOrOwner() {
        require(
            msg.sender == owner || organizers[msg.sender],
            "Only organizer or owner can call this function"
        );
        _;
    }

    modifier eventExists(uint256 _eventId) {
        require(_eventId < eventIdCounter, "Event does not exist");
        _;
    }

    modifier eventActive(uint256 _eventId) {
        require(events[_eventId].isActive, "Event is not active");
        _;
    }

    modifier canRSVP(uint256 _eventId) {
        Event memory eventData = events[_eventId];
        require(eventData.isActive, "Event is not active");
        require(block.timestamp < eventData.eventTimestamp, "Event has already started");
        require(eventData.totalRSVPs < eventData.maxAttendees, "Event is full");
        require(eventRSVPs[_eventId][msg.sender].attendee == address(0), "Already RSVPed");
        _;
    }

    modifier canCancelRSVP(uint256 _eventId) {
        Event memory eventData = events[_eventId];
        RSVP memory userRSVP = eventRSVPs[_eventId][msg.sender];
        
        require(userRSVP.attendee == msg.sender, "No RSVP found");
        require(!userRSVP.isRefunded, "Already refunded");
        require(
            block.timestamp < (eventData.eventTimestamp - CANCELLATION_PERIOD),
            "Cannot cancel within 24 hours of event"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        organizers[msg.sender] = true;
        eventIdCounter = 0;
    }

    /**
     * @dev Create a new event
     * @param _name Event name
     * @param _description Event description
     * @param _eventTimestamp Unix timestamp of event start
     * @param _location Event location
     * @param _maxAttendees Maximum number of attendees
     * @param _depositAmount Required deposit amount in wei
     */
    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _eventTimestamp,
        string memory _location,
        uint256 _maxAttendees,
        uint256 _depositAmount
    ) external onlyOrganizerOrOwner {
        require(_eventTimestamp > block.timestamp, "Event must be in the future");
        require(_maxAttendees > 0, "Max attendees must be greater than 0");
        require(_depositAmount >= MIN_DEPOSIT && _depositAmount <= MAX_DEPOSIT, 
                "Deposit amount out of range");
        require(bytes(_name).length > 0, "Event name cannot be empty");

        uint256 eventId = eventIdCounter;
        
        events[eventId] = Event({
            id: eventId,
            name: _name,
            description: _description,
            eventTimestamp: _eventTimestamp,
            location: _location,
            maxAttendees: _maxAttendees,
            depositAmount: _depositAmount,
            organizer: msg.sender,
            isActive: true,
            isFinalized: false,
            totalRSVPs: 0,
            totalAttended: 0
        });

        eventIdCounter++;

        emit EventCreated(
            eventId,
            msg.sender,
            _name,
            _eventTimestamp,
            _maxAttendees,
            _depositAmount
        );
    }

    /**
     * @dev RSVP to an event with required deposit
     * @param _eventId ID of the event to RSVP to
     */
    function rsvpToEvent(uint256 _eventId) 
        external 
        payable 
        eventExists(_eventId) 
        canRSVP(_eventId) 
    {
        Event storage eventData = events[_eventId];
        require(msg.value == eventData.depositAmount, "Incorrect deposit amount");

        // Create RSVP record
        eventRSVPs[_eventId][msg.sender] = RSVP({
            attendee: msg.sender,
            depositAmount: msg.value,
            hasAttended: false,
            isRefunded: false,
            rsvpTimestamp: block.timestamp
        });

        // Add to attendees list
        eventAttendees[_eventId].push(msg.sender);
        userEvents[msg.sender].push(_eventId);

        // Update event stats
        eventData.totalRSVPs++;

        emit RSVPConfirmed(_eventId, msg.sender, msg.value);
    }

    /**
     * @dev Cancel RSVP and receive refund (if within cancellation period)
     * @param _eventId ID of the event to cancel RSVP for
     */
    function cancelRSVP(uint256 _eventId) 
        external 
        eventExists(_eventId) 
        canCancelRSVP(_eventId) 
    {
        RSVP storage userRSVP = eventRSVPs[_eventId][msg.sender];
        Event storage eventData = events[_eventId];
        
        uint256 refundAmount = userRSVP.depositAmount;
        userRSVP.isRefunded = true;
        eventData.totalRSVPs--;

        // Remove from attendees list
        _removeAttendeeFromList(_eventId, msg.sender);

        // Send refund
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund failed");

        emit RSVPCancelled(_eventId, msg.sender, refundAmount);
    }

    /**
     * @dev Mark attendance for an attendee (organizer only)
     * @param _eventId ID of the event
     * @param _attendee Address of the attendee
     */
    function markAttendance(uint256 _eventId, address _attendee) 
        external 
        eventExists(_eventId) 
        onlyOrganizerOrOwner 
    {
        Event storage eventData = events[_eventId];
        RSVP storage attendeeRSVP = eventRSVPs[_eventId][_attendee];
        
        require(attendeeRSVP.attendee == _attendee, "No RSVP found for attendee");
        require(!attendeeRSVP.hasAttended, "Attendance already marked");
        require(block.timestamp >= eventData.eventTimestamp, "Event has not started yet");

        attendeeRSVP.hasAttended = true;
        eventData.totalAttended++;

        emit AttendanceMarked(_eventId, _attendee, true);
    }

    /**
     * @dev Finalize event and distribute deposits (organizer only)
     * @param _eventId ID of the event to finalize
     */
    function finalizeEvent(uint256 _eventId) 
        external 
        eventExists(_eventId) 
        onlyOrganizerOrOwner 
    {
        Event storage eventData = events[_eventId];
        require(!eventData.isFinalized, "Event already finalized");
        require(block.timestamp >= eventData.eventTimestamp, "Event has not started yet");

        eventData.isFinalized = true;
        eventData.isActive = false;

        uint256 totalDeposits = 0;
        uint256 attendeeCount = 0;
        uint256 noShowCount = 0;

        // Calculate totals and refund attendees
        address[] memory attendees = eventAttendees[_eventId];
        for (uint256 i = 0; i < attendees.length; i++) {
            address attendee = attendees[i];
            RSVP storage rsvp = eventRSVPs[_eventId][attendee];
            
            if (!rsvp.isRefunded) {
                totalDeposits += rsvp.depositAmount;
                
                if (rsvp.hasAttended) {
                    attendeeCount++;
                    // Refund deposit to attendees
                    (bool success, ) = payable(attendee).call{value: rsvp.depositAmount}("");
                    require(success, "Refund to attendee failed");
                } else {
                    noShowCount++;
                    // No-show deposits remain in contract (could be distributed to attendees or organizer)
                }
            }
        }

        emit EventFinalized(_eventId, totalDeposits, noShowCount);
    }

    // View functions
    function getEvent(uint256 _eventId) external view eventExists(_eventId) returns (Event memory) {
        return events[_eventId];
    }

    function getEventCount() external view returns (uint256) {
        return eventIdCounter;
    }

    function hasUserRSVPed(uint256 _eventId, address _user) external view returns (bool) {
        return eventRSVPs[_eventId][_user].attendee == _user;
    }

    function getUserRSVP(uint256 _eventId, address _user) external view returns (RSVP memory) {
        return eventRSVPs[_eventId][_user];
    }

    function getEventAttendees(uint256 _eventId) external view returns (address[] memory) {
        return eventAttendees[_eventId];
    }

    function getUserEvents(address _user) external view returns (uint256[] memory) {
        return userEvents[_user];
    }

    // Admin functions
    function addOrganizer(address _organizer) external onlyOwner {
        organizers[_organizer] = true;
    }

    function removeOrganizer(address _organizer) external onlyOwner {
        require(_organizer != owner, "Cannot remove owner");
        organizers[_organizer] = false;
    }

    function deactivateEvent(uint256 _eventId) external eventExists(_eventId) onlyOrganizerOrOwner {
        events[_eventId].isActive = false;
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // Internal functions
    function _removeAttendeeFromList(uint256 _eventId, address _attendee) internal {
        address[] storage attendees = eventAttendees[_eventId];
        for (uint256 i = 0; i < attendees.length; i++) {
            if (attendees[i] == _attendee) {
                attendees[i] = attendees[attendees.length - 1];
                attendees.pop();
                break;
            }
        }
    }

    // Receive function to accept Ether
    receive() external payable {}
    
    // Fallback function
    fallback() external payable {}
}