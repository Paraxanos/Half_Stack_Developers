// app/api/meetups/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generateMeetupConfirmationEmail, generateMeetupRequestEmail } from '@/lib/email/templates';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';

// Email sending function using environment-based SMTP or API
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || process.env.EMAIL_SERVICE_API_KEY;

  // Try Resend API first (recommended for Vercel)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Ghost Collab <noreply@ghost-collab.tech>',
          to,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email via Resend');
      }

      return { success: true, provider: 'resend' };
    } catch (error: any) {
      console.error('Resend email failed:', error);
      // Fall through to try other providers
    }
  }

  // Try SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.EMAIL_FROM || 'noreply@ghost-collab.tech', name: 'Ghost Collab' },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to send email via SendGrid');
      }

      return { success: true, provider: 'sendgrid' };
    } catch (error: any) {
      console.error('SendGrid email failed:', error);
      // Fall through to try other providers
    }
  }

  // Try generic email service API
  if (process.env.EMAIL_SERVICE_API_KEY && process.env.EMAIL_SERVICE_URL) {
    try {
      const response = await fetch(process.env.EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      return { success: true, provider: 'custom' };
    } catch (error: any) {
      console.error('Custom email service failed:', error);
    }
  }

  // Development mode: log email instead of sending
  if (process.env.NODE_ENV !== 'production') {
    console.log('=== EMAIL (Development Mode) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('--- HTML Preview ---');
    console.log(html.substring(0, 500) + '...');
    console.log('=====================');
    return { success: true, provider: 'mock', message: 'Email logged in development mode' };
  }

  throw new Error('No email service configured. Set RESEND_API_KEY, SENDGRID_API_KEY, or EMAIL_SERVICE_API_KEY');
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { meetupId, type } = await request.json();

    if (!meetupId || typeof meetupId !== 'string') {
      return NextResponse.json({ error: 'Invalid meetup ID' }, { status: 400 });
    }

    if (!type || !['confirmation', 'request'].includes(type)) {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Fetch meetup details
    const meetupDoc = await adminDb.collection('meetups').doc(meetupId).get();
    if (!meetupDoc.exists) {
      return NextResponse.json({ error: 'Meetup not found' }, { status: 404 });
    }

    const meetupData = meetupDoc.data()!;

    // Fetch user emails if not already stored
    let proposerEmail = meetupData.proposerEmail;
    let recipientEmail = meetupData.recipientEmail;

    if (!proposerEmail && meetupData.proposerUid) {
      const proposerDoc = await adminDb.collection('users').doc(meetupData.proposerUid).get();
      if (proposerDoc.exists) {
        proposerEmail = proposerDoc.data()?.email;
      }
    }

    if (!recipientEmail && meetupData.recipientUid) {
      const recipientDoc = await adminDb.collection('users').doc(meetupData.recipientUid).get();
      if (recipientDoc.exists) {
        recipientEmail = recipientDoc.data()?.email;
      }
    }

    if (!proposerEmail || !recipientEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 });
    }

    // Format date for email
    const proposedDate = meetupData.proposedDate;
    const formattedDate = proposedDate
      ? new Date(proposedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBD';

    const emailData = {
      proposerName: meetupData.proposerName || 'User',
      proposerEmail,
      recipientName: meetupData.recipientName || 'User',
      projectName: meetupData.projectName || 'Untitled Project',
      date: proposedDate || 'TBD',
      time: meetupData.proposedTime || 'TBD',
      location: meetupData.campusSpot || 'library',
      message: meetupData.message || '',
    };

    if (type === 'confirmation') {
      // Send confirmation emails to both parties
      const { subject, html, text } = generateMeetupConfirmationEmail(emailData);

      // Send to proposer
      await sendEmail({
        to: proposerEmail,
        subject: subject,
        html,
        text,
      });

      // Send to recipient
      await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text,
      });

      // Update meetup document to mark email as sent
      await adminDb.collection('meetups').doc(meetupId).update({
        confirmationEmailSent: true,
        emailSentAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Confirmation emails sent to both parties',
      });
    } else if (type === 'request') {
      // Send request notification to recipient
      const { subject, html, text } = generateMeetupRequestEmail(emailData);

      await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text,
      });

      // Update meetup document to mark request email as sent
      await adminDb.collection('meetups').doc(meetupId).update({
        requestEmailSent: true,
        requestEmailSentAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Request notification sent to recipient',
      });
    }

    return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
  } catch (error: any) {
    console.error('Send email error:', error);

    // Don't fail in development if email service is not configured
    if (process.env.NODE_ENV !== 'production' && error.message?.includes('No email service configured')) {
      return NextResponse.json({
        success: true,
        message: 'Email would be sent in production (logged in development)',
        development: true,
      });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
