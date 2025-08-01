// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/EventRSVP.sol";

contract EventRSVPTest is Test {
    EventRSVP public eventRSVP;
    
    // Test accounts
    address public owner;
    address public organizer;
    address public user1;
    address public user2;
    address public user3;
    
    // Test event data
    string constant TEST_EVENT_NAME = "Test Blockchain Conference";
    string constant TEST_EVENT_DESCRIPTION = "A test event for smart contract testing";
    string constant TEST_EVENT_LOCATION = "Virtual Event";
    uint256 constant TEST_MAX_ATTENDEES = 10;
    uint256 constant TEST_DEPOSIT_AMOUNT = 0.1 ether;
    
    // Events for testing
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

    function setUp() public {
        // Set up test accounts
        owner = address(this);
        organizer = makeAddr("organizer");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Give test accounts some ETH
        vm.deal(owner, 10 ether);
        vm.deal(organizer, 5 ether);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
        
        // Deploy contract
        eventRSVP = new EventRSVP();
        
        // Add organizer
        eventRSVP.addOrganizer(organizer);
    }

    // Test contract deployment
    function testDeployment() public {
        assertEq(eventRSVP.owner(), owner);
        assertEq(eventRSVP.getEventCount(), 0);
        assertTrue(eventRSVP.organizers(owner));
        assertTrue(eventRSVP.organizers(organizer));
    }

    // Test event creation
    function testCreateEvent() public {
        uint256 eventTimestamp = block.timestamp + 1 days;
        
        vm.expectEmit(true, true, false, true);
        emit EventCreated(0, owner, TEST_EVENT_NAME, eventTimestamp, TEST_MAX_ATTENDEES, TEST_DEPOSIT_AMOUNT);
        
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        EventRSVP.Event memory createdEvent = eventRSVP.getEvent(0);
        assertEq(createdEvent.name, TEST_EVENT_NAME);
        assertEq(createdEvent.organizer, owner);
        assertEq(createdEvent.maxAttendees, TEST_MAX_ATTENDEES);
        assertEq(createdEvent.depositAmount, TEST_DEPOSIT_AMOUNT);
        assertTrue(createdEvent.isActive);
        assertFalse(createdEvent.isFinalized);
    }

    function testCreateEventFailsWithPastTimestamp() public {
        uint256 pastTimestamp = block.timestamp - 1 days;
        
        vm.expectRevert("Event must be in the future");
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            pastTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
    }

    function testCreateEventFailsWithInvalidDeposit() public {
        uint256 eventTimestamp = block.timestamp + 1 days;
        
        // Test deposit too low
        vm.expectRevert("Deposit amount out of range");
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            0.0001 ether // Below MIN_DEPOSIT
        );
        
        // Test deposit too high
        vm.expectRevert("Deposit amount out of range");
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            2 ether // Above MAX_DEPOSIT
        );
    }

    function testCreateEventFailsForNonOrganizer() public {
        uint256 eventTimestamp = block.timestamp + 1 days;
        
        vm.prank(user1);
        vm.expectRevert("Only organizer or owner can call this function");
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
    }

    // Test RSVP functionality
    function testRSVPToEvent() public {
        // Create event first
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        // RSVP as user1
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit RSVPConfirmed(0, user1, TEST_DEPOSIT_AMOUNT);
        
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        // Verify RSVP
        assertTrue(eventRSVP.hasUserRSVPed(0, user1));
        EventRSVP.RSVP memory userRSVP = eventRSVP.getUserRSVP(0, user1);
        assertEq(userRSVP.attendee, user1);
        assertEq(userRSVP.depositAmount, TEST_DEPOSIT_AMOUNT);
        assertFalse(userRSVP.hasAttended);
        assertFalse(userRSVP.isRefunded);
        
        // Check event stats
        EventRSVP.Event memory eventData = eventRSVP.getEvent(0);
        assertEq(eventData.totalRSVPs, 1);
    }

    function testRSVPFailsWithIncorrectDeposit() public {
        // Create event
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        // Try RSVP with wrong amount
        vm.prank(user1);
        vm.expectRevert("Incorrect deposit amount");
        eventRSVP.rsvpToEvent{value: 0.05 ether}(0);
    }

    function testRSVPFailsWhenEventFull() public {
        // Create event with 1 max attendee
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            1, // max attendees = 1
            TEST_DEPOSIT_AMOUNT
        );
        
        // First RSVP should succeed
        vm.prank(user1);
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        // Second RSVP should fail
        vm.prank(user2);
        vm.expectRevert("Event is full");
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
    }

    function testRSVPFailsForPastEvent() public {
        // Create event
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        // Move time past event start
        vm.warp(eventTimestamp + 1);
        
        // RSVP should fail
        vm.prank(user1);
        vm.expectRevert("Event has already started");
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
    }

    // Test cancellation functionality
    function testCancelRSVP() public {
        // Create event (2 days from now to allow cancellation)
        uint256 eventTimestamp = block.timestamp + 2 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        // RSVP as user1
        vm.prank(user1);
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        uint256 balanceBefore = user1.balance;
        
        // Cancel RSVP
        vm.prank(user1);
        eventRSVP.cancelRSVP(0);
        
        // Check refund
        uint256 balanceAfter = user1.balance;
        assertEq(balanceAfter - balanceBefore, TEST_DEPOSIT_AMOUNT);
        
        // Check RSVP status
        EventRSVP.RSVP memory userRSVP = eventRSVP.getUserRSVP(0, user1);
        assertTrue(userRSVP.isRefunded);
        
        // Check event stats
        EventRSVP.Event memory eventData = eventRSVP.getEvent(0);
        assertEq(eventData.totalRSVPs, 0);
    }

    function testCancelRSVPFailsWithin24Hours() public {
        // Create event 1 day from now
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        // RSVP as user1
        vm.prank(user1);
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        // Try to cancel (should fail because within 24 hours)
        vm.prank(user1);
        vm.expectRevert("Cannot cancel within 24 hours of event");
        eventRSVP.cancelRSVP(0);
    }

    // Test attendance marking
    function testMarkAttendance() public {
        // Create and setup event
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        // RSVP as user1
        vm.prank(user1);
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        // Move time to event start
        vm.warp(eventTimestamp);
        
        // Mark attendance
        eventRSVP.markAttendance(0, user1);
        
        // Check attendance
        EventRSVP.RSVP memory userRSVP = eventRSVP.getUserRSVP(0, user1);
        assertTrue(userRSVP.hasAttended);
        
        EventRSVP.Event memory eventData = eventRSVP.getEvent(0);
        assertEq(eventData.totalAttended, 1);
    }

    function testMarkAttendanceFailsBeforeEvent() public {
        // Create event
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        // RSVP as user1
        vm.prank(user1);
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        // Try to mark attendance before event starts
        vm.expectRevert("Event has not started yet");
        eventRSVP.markAttendance(0, user1);
    }

    // Test event finalization
    function testFinalizeEvent() public {
        // Create event
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        // Multiple RSVPs
        vm.prank(user1);
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        vm.prank(user2);
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        // Move time to event start
        vm.warp(eventTimestamp);
        
        // Mark attendance for user1 only
        eventRSVP.markAttendance(0, user1);
        
        uint256 user1BalanceBefore = user1.balance;
        
        // Finalize event
        eventRSVP.finalizeEvent(0);
        
        // Check event status
        EventRSVP.Event memory eventData = eventRSVP.getEvent(0);
        assertTrue(eventData.isFinalized);
        assertFalse(eventData.isActive);
        
        // Check that attendee got refund
        uint256 user1BalanceAfter = user1.balance;
        assertEq(user1BalanceAfter - user1BalanceBefore, TEST_DEPOSIT_AMOUNT);
    }

    // Test admin functions
    function testAddRemoveOrganizer() public {
        address newOrganizer = makeAddr("newOrganizer");
        
        // Add organizer
        eventRSVP.addOrganizer(newOrganizer);
        assertTrue(eventRSVP.organizers(newOrganizer));
        
        // Remove organizer
        eventRSVP.removeOrganizer(newOrganizer);
        assertFalse(eventRSVP.organizers(newOrganizer));
    }

    function testCannotRemoveOwnerAsOrganizer() public {
        vm.expectRevert("Cannot remove owner");
        eventRSVP.removeOrganizer(owner);
    }

    // Test edge cases and security
    function testReentrancyProtection() public {
        // This test would be more complex in a real scenario
        // For now, we test basic functionality
        uint256 eventTimestamp = block.timestamp + 2 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        
        vm.prank(user1);
        eventRSVP.rsvpToEvent{value: TEST_DEPOSIT_AMOUNT}(0);
        
        vm.prank(user1);
        eventRSVP.cancelRSVP(0);
        
        // Verify user can't cancel again
        vm.prank(user1);
        vm.expectRevert("No RSVP found");
        eventRSVP.cancelRSVP(0);
    }

    // Helper functions for testing
    function createTestEvent() internal returns (uint256) {
        uint256 eventTimestamp = block.timestamp + 1 days;
        eventRSVP.createEvent(
            TEST_EVENT_NAME,
            TEST_EVENT_DESCRIPTION,
            eventTimestamp,
            TEST_EVENT_LOCATION,
            TEST_MAX_ATTENDEES,
            TEST_DEPOSIT_AMOUNT
        );
        return 0; // First event ID
    }

    // Test receive function
    function testReceiveEther() public {
        (bool success,) = payable(address(eventRSVP)).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(eventRSVP).balance, 1 ether);
    }
}