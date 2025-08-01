// Mock email service for EventRSVP
import { simulateDelay, simulateError, formatDate, formatTimeRange } from './helpers';

// Email template generator
const generateEmailTemplate = (type, data) => {
  const templates = {
    rsvpConfirmation: {
      subject: `RSVP Confirmation - ${data.eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 RSVP Confirmed!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
              Hi ${data.userName || 'there'},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6;">
              Your RSVP has been confirmed for <strong>${data.eventName}</strong>. 
              We're excited to see you there!
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Event Details</h3>
              <p style="margin: 5px 0; color: #6b7280;"><strong>📅 Date:</strong> ${formatDate(data.eventDate)}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>⏰ Time:</strong> ${formatTimeRange(data.startTime, data.endTime)}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>📍 Location:</strong> ${data.location}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>💰 Stake:</strong> ${data.depositAmount} ETH</p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Important:</strong> Your ${data.depositAmount} ETH stake will be refunded when you attend the event. 
                No-shows will forfeit their stake.
              </p>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6;">
              Please save this confirmation email for your records. If you need to cancel your RSVP, 
              you can do so from your profile dashboard.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.eventUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Event Details
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              This is an automated email from LockIn Event Management.<br>
              Transaction Hash: ${data.transactionHash}
            </p>
          </div>
        </div>
      `,
      text: `
RSVP Confirmation - ${data.eventName}

Hi ${data.userName || 'there'},

Your RSVP has been confirmed for ${data.eventName}. We're excited to see you there!

Event Details:
- Date: ${formatDate(data.eventDate)}
- Time: ${formatTimeRange(data.startTime, data.endTime)}
- Location: ${data.location}
- Stake: ${data.depositAmount} ETH

Important: Your ${data.depositAmount} ETH stake will be refunded when you attend the event. No-shows will forfeit their stake.

Please save this confirmation email for your records.

Transaction Hash: ${data.transactionHash}

-- 
LockIn Event Management
      `
    },

    rsvpCancellation: {
      subject: `RSVP Cancelled - ${data.eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">❌ RSVP Cancelled</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
              Hi ${data.userName || 'there'},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6;">
              Your RSVP for <strong>${data.eventName}</strong> has been cancelled successfully.
            </p>
            
            <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #166534; font-size: 14px;">
                <strong>✅ Refund Processed:</strong> Your ${data.depositAmount} ETH stake has been refunded to your wallet.
              </p>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6;">
              We're sorry you can't make it to the event. You can always RSVP again if your plans change.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              This is an automated email from LockIn Event Management.<br>
              Refund Transaction Hash: ${data.refundHash}
            </p>
          </div>
        </div>
      `,
      text: `
RSVP Cancelled - ${data.eventName}

Hi ${data.userName || 'there'},

Your RSVP for ${data.eventName} has been cancelled successfully.

Refund Processed: Your ${data.depositAmount} ETH stake has been refunded to your wallet.

We're sorry you can't make it to the event. You can always RSVP again if your plans change.

Refund Transaction Hash: ${data.refundHash}

-- 
LockIn Event Management
      `
    },

    eventReminder: {
      subject: `Reminder: ${data.eventName} is tomorrow!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f59e0b; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Event Reminder</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
              Hi ${data.userName || 'there'},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6;">
              This is a friendly reminder that <strong>${data.eventName}</strong> is happening tomorrow!
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Event Details</h3>
              <p style="margin: 5px 0; color: #6b7280;"><strong>📅 Date:</strong> ${formatDate(data.eventDate)}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>⏰ Time:</strong> ${formatTimeRange(data.startTime, data.endTime)}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>📍 Location:</strong> ${data.location}</p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>💰 Don't forget:</strong> Attend the event to get your ${data.depositAmount} ETH stake refunded!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.eventUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Event Details
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
Reminder: ${data.eventName} is tomorrow!

Hi ${data.userName || 'there'},

This is a friendly reminder that ${data.eventName} is happening tomorrow!

Event Details:
- Date: ${formatDate(data.eventDate)}
- Time: ${formatTimeRange(data.startTime, data.endTime)}
- Location: ${data.location}

Don't forget: Attend the event to get your ${data.depositAmount} ETH stake refunded!

-- 
LockIn Event Management
      `
    },

    attendanceConfirmation: {
      subject: `Attendance Confirmed - ${data.eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #22c55e; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Attendance Confirmed</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
              Hi ${data.userName || 'there'},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6;">
              Thank you for attending <strong>${data.eventName}</strong>! Your attendance has been confirmed.
            </p>
            
            <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #166534; font-size: 14px;">
                <strong>💰 Stake Refunded:</strong> Your ${data.depositAmount} ETH stake has been refunded to your wallet.
              </p>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6;">
              We hope you enjoyed the event! Keep an eye out for future events from LockIn.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              This is an automated email from LockIn Event Management.<br>
              Refund Transaction Hash: ${data.refundHash}
            </p>
          </div>
        </div>
      `,
      text: `
Attendance Confirmed - ${data.eventName}

Hi ${data.userName || 'there'},

Thank you for attending ${data.eventName}! Your attendance has been confirmed.

Stake Refunded: Your ${data.depositAmount} ETH stake has been refunded to your wallet.

We hope you enjoyed the event! Keep an eye out for future events from LockIn.

Refund Transaction Hash: ${data.refundHash}

-- 
LockIn Event Management
      `
    }
  };

  return templates[type] || null;
};

// Mock email service class
class EmailService {
  constructor() {
    this.sentEmails = [];
    this.failureRate = 0.05; // 5% failure rate for simulation
  }

  async sendEmail(to, type, data) {
    console.log(`📧 Sending ${type} email to ${to}...`);
    
    // Simulate network delay
    await simulateDelay(500, 2000);
    
    // Simulate occasional failures
    if (simulateError(this.failureRate)) {
      throw new Error('Email service temporarily unavailable. Please try again later.');
    }
    
    const template = generateEmailTemplate(type, data);
    if (!template) {
      throw new Error(`Unknown email template: ${type}`);
    }
    
    const email = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      to,
      type,
      subject: template.subject,
      html: template.html,
      text: template.text,
      data,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    
    this.sentEmails.push(email);
    
    console.log(`✅ Email sent successfully to ${to}`);
    return email;
  }

  async sendRSVPConfirmation(userEmail, eventData, transactionData) {
    return this.sendEmail(userEmail, 'rsvpConfirmation', {
      userName: eventData.userName,
      eventName: eventData.name,
      eventDate: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      depositAmount: eventData.depositAmount,
      transactionHash: transactionData.hash,
      eventUrl: `${window.location.origin}/event/${eventData.id}`
    });
  }

  async sendRSVPCancellation(userEmail, eventData, refundData) {
    return this.sendEmail(userEmail, 'rsvpCancellation', {
      userName: eventData.userName,
      eventName: eventData.name,
      depositAmount: eventData.depositAmount,
      refundHash: refundData.hash
    });
  }

  async sendEventReminder(userEmail, eventData) {
    return this.sendEmail(userEmail, 'eventReminder', {
      userName: eventData.userName,
      eventName: eventData.name,
      eventDate: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      depositAmount: eventData.depositAmount,
      eventUrl: `${window.location.origin}/event/${eventData.id}`
    });
  }

  async sendAttendanceConfirmation(userEmail, eventData, refundData) {
    return this.sendEmail(userEmail, 'attendanceConfirmation', {
      userName: eventData.userName,
      eventName: eventData.name,
      depositAmount: eventData.depositAmount,
      refundHash: refundData.hash
    });
  }

  // Utility methods for testing/debugging
  getSentEmails(userEmail = null) {
    if (userEmail) {
      return this.sentEmails.filter(email => email.to === userEmail);
    }
    return this.sentEmails;
  }

  clearSentEmails() {
    this.sentEmails = [];
  }

  setFailureRate(rate) {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }

  // Simulate bulk email sending (for future features)
  async sendBulkEmails(recipients, type, data) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(recipient.email, type, {
          ...data,
          userName: recipient.name
        });
        results.push({ recipient: recipient.email, success: true, result });
      } catch (error) {
        results.push({ recipient: recipient.email, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;

// Export specific methods for easier use
export const {
  sendRSVPConfirmation,
  sendRSVPCancellation,
  sendEventReminder,
  sendAttendanceConfirmation
} = emailService;