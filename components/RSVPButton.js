'use client';

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAppState, useAppActions } from '../context/AppContext';
import { useNotifications } from './NotificationSystem';
import Button from './ui/Button';
import Modal, { ConfirmDialog } from './ui/Modal';
import { 
  isUserRSVPed, 
  getUserAttendeeInfo, 
  formatCurrency, 
  generateTransactionHash,
  simulateDelay,
  simulateError 
} from '../utils/helpers';
import emailService from '../utils/emailService';

const RSVPButton = ({ event, size = 'md', fullWidth = false }) => {
  const { account, isAdmin } = useWallet();
  const { user } = useAppState();
  const { addRSVP, removeRSVP, updateEvent } = useAppActions();
  const notifications = useNotifications();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userName, setUserName] = useState(user?.name || '');

  const isRSVPed = isUserRSVPed(event, account);
  const attendeeInfo = getUserAttendeeInfo(event, account);
  const isEventFull = event.currentAttendees >= event.maxAttendees;
  const eventDateTime = new Date(`${event.date}T${event.startTime}`);
  const isEventClosed = eventDateTime < new Date();
  const isCancellationCutoff = eventDateTime - new Date() <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const handleRSVP = async () => {
    if (!account) {
      notifications.error('Wallet Required', 'Please connect your wallet to RSVP');
      return;
    }

    setShowRSVPModal(true);
  };

  const processRSVP = async () => {
    if (!userEmail.trim()) {
      notifications.error('Email Required', 'Please enter your email address');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate blockchain transaction
      notifications.info('Processing RSVP', 'Confirming transaction on blockchain...');
      await simulateDelay(2000, 4000);
      
      // Simulate transaction failure (5% chance)
      if (simulateError(0.05)) {
        throw new Error('Transaction failed. Please try again.');
      }

      const transactionHash = generateTransactionHash();
      const timestamp = new Date().toISOString();
      
      // Create attendee object
      const newAttendee = {
        id: Date.now(),
        address: account,
        name: userName.trim() || null,
        email: userEmail.trim(),
        timestamp,
        hasAttended: false,
        transactionHash
      };

      // Add RSVP to state
      addRSVP(event.id, newAttendee);
      
      // Update event capacity
      const updatedEvent = {
        ...event,
        currentAttendees: event.currentAttendees + 1,
        attendees: [...event.attendees, newAttendee]
      };
      updateEvent(updatedEvent);

      // Send confirmation email
      try {
        await emailService.sendRSVPConfirmation(
          userEmail,
          {
            ...event,
            userName: userName.trim()
          },
          { hash: transactionHash }
        );
        notifications.success('RSVP Confirmed!', 'Confirmation email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        notifications.warning('RSVP Confirmed', 'RSVP successful, but confirmation email failed to send');
      }

      setShowRSVPModal(false);
      
    } catch (error) {
      console.error('RSVP failed:', error);
      notifications.error('RSVP Failed', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRSVP = () => {
    setShowCancelModal(true);
  };

  const processCancelRSVP = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate refund transaction
      notifications.info('Processing Cancellation', 'Processing refund transaction...');
      await simulateDelay(1500, 3000);
      
      // Simulate transaction failure (3% chance)
      if (simulateError(0.03)) {
        throw new Error('Refund transaction failed. Please try again.');
      }

      const refundHash = generateTransactionHash();
      
      // Remove RSVP from state
      removeRSVP(event.id, account);
      
      // Update event capacity
      const updatedEvent = {
        ...event,
        currentAttendees: event.currentAttendees - 1,
        attendees: event.attendees.filter(a => a.address !== account)
      };
      updateEvent(updatedEvent);

      // Send cancellation email
      try {
        await emailService.sendRSVPCancellation(
          attendeeInfo.email,
          {
            ...event,
            userName: attendeeInfo.name
          },
          { hash: refundHash }
        );
        notifications.success('RSVP Cancelled', 'Refund processed and confirmation email sent');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        notifications.success('RSVP Cancelled', 'Refund processed successfully');
      }

      setShowCancelModal(false);
      
    } catch (error) {
      console.error('Cancel RSVP failed:', error);
      notifications.error('Cancellation Failed', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't show button for admin or if event is closed
  if (isAdmin || isEventClosed) {
    return null;
  }

  // Already RSVPed - show cancel button or locked status
  if (isRSVPed) {
    if (isCancellationCutoff) {
      return (
        <Button
          variant="secondary"
          size={size}
          fullWidth={fullWidth}
          disabled
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        >
          RSVP Locked
        </Button>
      );
    }

    return (
      <>
        <Button
          variant="danger"
          size={size}
          fullWidth={fullWidth}
          onClick={handleCancelRSVP}
          disabled={isProcessing}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        >
          Cancel RSVP
        </Button>

        <ConfirmDialog
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={processCancelRSVP}
          title="Cancel RSVP"
          message={`Are you sure you want to cancel your RSVP for "${event.name}"? Your ${formatCurrency(event.depositAmount)} stake will be refunded.`}
          confirmText="Cancel RSVP"
          cancelText="Keep RSVP"
          variant="danger"
          loading={isProcessing}
        />
      </>
    );
  }

  // Event is full
  if (isEventFull) {
    return (
      <Button
        variant="secondary"
        size={size}
        fullWidth={fullWidth}
        disabled
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      >
        Event Full
      </Button>
    );
  }

  // Show RSVP button
  return (
    <>
      <Button
        variant="primary"
        size={size}
        fullWidth={fullWidth}
        onClick={handleRSVP}
        disabled={!account}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        RSVP ({formatCurrency(event.depositAmount)})
      </Button>

      <Modal
        isOpen={showRSVPModal}
        onClose={() => setShowRSVPModal(false)}
        title={`RSVP to ${event.name}`}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowRSVPModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={processRSVP}
              loading={isProcessing}
            >
              Confirm RSVP
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Event Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Event Summary</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Event:</span>
                <span className="font-medium">{event.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Stake Required:</span>
                <span className="font-medium text-indigo-600">{formatCurrency(event.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Spots:</span>
                <span className="font-medium">{event.maxAttendees - event.currentAttendees} of {event.maxAttendees}</span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send your confirmation and event reminders here
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be visible to event organizers
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h5 className="font-medium text-yellow-800">Important Information</h5>
                <div className="text-sm text-yellow-700 mt-1 space-y-2">
                  <p>
                    By RSVPing, you agree to stake {formatCurrency(event.depositAmount)} which will be refunded when you attend the event. 
                    No-shows forfeit their stake to prevent event no-shows.
                  </p>
                  <p>
                    <strong>Cancellation Policy:</strong> You can cancel your RSVP and get a full refund up to 24 hours before the event starts. 
                    After that, cancellations are not allowed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V9z" />
              </svg>
              <span>Connected wallet: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RSVPButton;