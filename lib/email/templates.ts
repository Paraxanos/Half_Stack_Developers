// Email template utilities for meetup notifications

interface MeetupEmailData {
  proposerName: string;
  proposerEmail: string;
  recipientName: string;
  projectName: string;
  date: string;
  time: string;
  location: string;
  message?: string;
}

const locationNames: Record<string, string> = {
  library: 'Library',
  cafe: 'Central Cafe',
  lab: 'Computer Lab',
  quad: 'Main Quad',
  auditorium: 'Auditorium',
  cafeteria: 'Cafeteria',
};

const locationEmojis: Record<string, string> = {
  library: '📚',
  cafe: '☕',
  lab: '💻',
  quad: '🌳',
  auditorium: '🎭',
  cafeteria: '🍽️',
};

/**
 * Generate HTML email for meetup confirmation
 */
export function generateMeetupConfirmationEmail(data: MeetupEmailData): { subject: string; html: string; text: string } {
  const locationName = locationNames[data.location] || data.location;
  const locationEmoji = locationEmojis[data.location] || '📍';

  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Meetup Confirmed: ${data.projectName} with ${data.proposerName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meetup Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(177, 158, 239, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #B19EEF 0%, #8B7BD4 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🤝</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0a0a0f;">Meetup Confirmed!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: rgba(10, 10, 15, 0.8);">Your collaboration session is scheduled</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Hi ${data.recipientName},
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Great news! <strong style="color: #B19EEF;">${data.proposerName}</strong> has confirmed a meetup to discuss 
                <strong style="color: #B19EEF;">${data.projectName}</strong>. Here are the details:
              </p>
              
              <!-- Meeting Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(177, 158, 239, 0.08); border-radius: 12px; border: 1px solid rgba(177, 158, 239, 0.2); margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding-bottom: 15px; border-bottom: 1px solid rgba(177, 158, 239, 0.15);">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="width: 40px; font-size: 24px;">📅</td>
                              <td>
                                <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Date</div>
                                <div style="font-size: 16px; font-weight: 600; color: #fff;">${formattedDate}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid rgba(177, 158, 239, 0.15);">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="width: 40px; font-size: 24px;">🕐</td>
                              <td>
                                <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Time</div>
                                <div style="font-size: 16px; font-weight: 600; color: #fff;">${data.time}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 15px;">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="width: 40px; font-size: 24px;">${locationEmoji}</td>
                              <td>
                                <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Location</div>
                                <div style="font-size: 16px; font-weight: 600; color: #fff;">${locationName}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Participants -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px;">
                    <div style="font-size: 14px; color: #888; margin-bottom: 10px;">Participants</div>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #B19EEF, #8B7BD4); display: flex; align-items: center; justify-content: center; font-weight: 600; color: #0a0a0f; font-size: 14px;">
                              ${data.proposerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <div style="font-size: 14px; font-weight: 600; color: #fff;">${data.proposerName}</div>
                              <div style="font-size: 12px; color: #888;">${data.proposerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td style="text-align: right;">
                          <div style="font-size: 12px; color: #888;">&</div>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <div style="display: flex; align-items: center; gap: 10px; justify-content: flex-end;">
                            <div>
                              <div style="font-size: 14px; font-weight: 600; color: #fff; text-align: right;">${data.recipientName}</div>
                              <div style="font-size: 12px; color: #888; text-align: right;">You</div>
                            </div>
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #B19EEF, #8B7BD4); display: flex; align-items: center; justify-content: center; font-weight: 600; color: #0a0a0f; font-size: 14px;">
                              ${data.recipientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${data.message ? `
              <div style="background: rgba(177, 158, 239, 0.05); border-left: 3px solid #B19EEF; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Message from ${data.proposerName}</div>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d0d0d0;">${data.message}</p>
              </div>
              ` : ''}
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                We're excited to see what you'll build together! Make sure to arrive on time and come prepared to share your ideas.
              </p>
              
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Best of luck,<br>
                <strong style="color: #B19EEF;">Ghost Collab Team</strong> 👻
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                This meetup was arranged through Ghost Collab
              </p>
              <p style="margin: 0; font-size: 12px; color: #444;">
                © ${new Date().getFullYear()} Ghost Collab. Built for student developers.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Meetup Confirmed! 🤝

Hi ${data.recipientName},

Great news! ${data.proposerName} has confirmed a meetup to discuss ${data.projectName}.

MEETING DETAILS:
📅 Date: ${formattedDate}
🕐 Time: ${data.time}
📍 Location: ${locationName}

PARTICIPANTS:
• ${data.proposerName} (${data.proposerEmail})
• ${data.recipientName} (You)

${data.message ? `MESSAGE FROM ${data.proposerName.toUpperCase()}:
${data.message}

` : ''}
We're excited to see what you'll build together! Make sure to arrive on time and come prepared to share your ideas.

Best of luck,
Ghost Collab Team 👻

---
This meetup was arranged through Ghost Collab
© ${new Date().getFullYear()} Ghost Collab. Built for student developers.
  `.trim();

  return { subject, html, text };
}

/**
 * Generate HTML email for meetup request notification (when someone requests a meetup)
 */
export function generateMeetupRequestEmail(data: MeetupEmailData): { subject: string; html: string; text: string } {
  const locationName = locationNames[data.location] || data.location;
  const locationEmoji = locationEmojis[data.location] || '📍';

  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `New Meetup Request: ${data.projectName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meetup Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(177, 158, 239, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #B19EEF 0%, #8B7BD4 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">📬</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0a0a0f;">New Meetup Request</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: rgba(10, 10, 15, 0.8);">Someone wants to collaborate with you</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Hi ${data.recipientName},
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                <strong style="color: #B19EEF;">${data.proposerName}</strong> wants to meet up to discuss 
                <strong style="color: #B19EEF;">${data.projectName}</strong>. Here are the proposed details:
              </p>
              
              <!-- Meeting Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(177, 158, 239, 0.08); border-radius: 12px; border: 1px solid rgba(177, 158, 239, 0.2); margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding-bottom: 15px; border-bottom: 1px solid rgba(177, 158, 239, 0.15);">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="width: 40px; font-size: 24px;">📅</td>
                              <td>
                                <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Proposed Date</div>
                                <div style="font-size: 16px; font-weight: 600; color: #fff;">${formattedDate}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid rgba(177, 158, 239, 0.15);">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="width: 40px; font-size: 24px;">🕐</td>
                              <td>
                                <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Proposed Time</div>
                                <div style="font-size: 16px; font-weight: 600; color: #fff;">${data.time}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 15px;">
                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td style="width: 40px; font-size: 24px;">${locationEmoji}</td>
                              <td>
                                <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Proposed Location</div>
                                <div style="font-size: 16px; font-weight: 600; color: #fff;">${locationName}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${data.message ? `
              <div style="background: rgba(177, 158, 239, 0.05); border-left: 3px solid #B19EEF; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Message from ${data.proposerName}</div>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d0d0d0;">${data.message}</p>
              </div>
              ` : ''}
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Log in to your Ghost Collab dashboard to accept or decline this request.
              </p>
              
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Happy building,<br>
                <strong style="color: #B19EEF;">Ghost Collab Team</strong> 👻
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                Manage your meetup requests in your dashboard
              </p>
              <p style="margin: 0; font-size: 12px; color: #444;">
                © ${new Date().getFullYear()} Ghost Collab. Built for student developers.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
New Meetup Request 📬

Hi ${data.recipientName},

${data.proposerName} wants to meet up to discuss ${data.projectName}.

PROPOSED MEETING DETAILS:
📅 Date: ${formattedDate}
🕐 Time: ${data.time}
📍 Location: ${locationName}

${data.message ? `MESSAGE FROM ${data.proposerName.toUpperCase()}:
${data.message}

` : ''}
Log in to your Ghost Collab dashboard to accept or decline this request.

Happy building,
Ghost Collab Team 👻

---
This meetup was arranged through Ghost Collab
© ${new Date().getFullYear()} Ghost Collab. Built for student developers.
  `.trim();

  return { subject, html, text };
}
