// app/api/gemini/alignment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs'; // Changed from 'edge' to 'nodejs' due to firebase-admin compatibility
export const preferredRegion = 'iad1';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Firebase ID token
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
    const uid = decodedToken.uid;

    // 2. Parse request body
    const { projectId } = await request.json();
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // 3. Fetch user profile (with safety checks)
    console.log('Looking for user profile with UID:', uid); // Debug log
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.log('User profile not found for UID:', uid); // Debug log
      // Let's also check what user documents exist (for debugging)
      // Skip this check when using mock data to avoid the limit function issue
      if (typeof process.env.NODE_ENV !== 'production' &&
          (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY)) {
        console.log('Skipping user ID listing since using mock data'); // Debug log
      } else {
        const allUsers = await adminDb.collection('users').limit(10).get();
        const userIds = allUsers.docs.map(doc => doc.id);
        console.log('Available user IDs in DB:', userIds); // Debug log
      }

      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    const userProfile = userDoc.data() || {};
    console.log('Found user profile:', userProfile); // Debug log

    // 4. Fetch project details
    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const projectData = projectDoc.data() || {};

    // 5. Block analysis for owned projects
    if (projectData.ownerId === uid) {
      return NextResponse.json({
        alignment: "✨ This is your project! You're already perfectly aligned as the owner."
      });
    }

    // 6. Sanitize inputs for prompt (critical security step)
    const sanitize = (str: string, maxLength = 200) =>
      str?.replace(/[<>]/g, '').trim().slice(0, maxLength) || 'Not specified';

    const prompt = `
You are an expert technical matchmaker for developer projects. Analyze compatibility between a developer's profile and a project opportunity. Be concise, actionable, and encouraging.

USER PROFILE:
- Core Skills: ${sanitize(userProfile.skills?.join(', ') || '')}
- Work Style: ${sanitize(userProfile.workStyle || '')}
- Work Intensity: ${sanitize(userProfile.intensity || '')}
- Academic Background: ${sanitize(userProfile.department || '')}

PROJECT REQUIREMENTS:
- Title: ${sanitize(projectData.title || '')}
- Required Tech Stack: ${sanitize(projectData.Techstack?.join(', ') || '')}
- Needed Roles: ${sanitize(projectData.roleGaps?.join(', ') || '')}
- Project Stage: ${sanitize(projectData.currentprojectstage || '')}
- Timeline: ${sanitize(projectData.timeline ? new Date(projectData.timeline).toLocaleDateString() : '')}

ANALYSIS RULES:
1. Highlight 1-2 SPECIFIC matches (e.g., "Your TypeScript experience directly matches their frontend needs")
2. Address gaps constructively (e.g., "While Python isn't listed in your skills, your JavaScript background provides strong transferable concepts for their Flask API")
3. NEVER mention names, emails, or other PII
4. NEVER make up skills not in the profile
5. Respond with exactly 2 sentences - no more, no less
6. End with forward-looking encouragement
7. Output PLAIN TEXT ONLY - no markdown, asterisks, or labels
8. RESPONSE MUST BE EXACTLY 2 SENTENCES AND NO MORE - enforce this strictly
9. Each sentence should be concise and informative, focusing on the most relevant match points
10. Total response should fit within 1000 tokens

RESPONSE (EXACTLY 2 CONCISE SENTENCES):
`;

    // 7. Call Gemini API with timeout protection
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',  // Changed to 'gemini-2.5-flash' as requested
        generationConfig: {
          maxOutputTokens: 1000,  // Increased to 1000 for more detailed response
          temperature: 0.3,
          topP: 0.8,
        },
      });

      // Add timeout protection (10 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const result = await model.generateContent(prompt, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const response = await result.response;
        let alignmentText = response.text().trim();

        // Final sanitization
        alignmentText = alignmentText
          .replace(/[*_~`]/g, '')
          .replace(/\n+/g, ' ')
          .trim()
          .slice(0, 300); // Hard cap at 300 chars

        return NextResponse.json({ alignment: alignmentText || "Great potential match! Review the project details to see where your skills align." });
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error('Gemini API call timed out');
          return NextResponse.json({ error: 'Analysis timed out. Please try again.' }, { status: 408 });
        }
        console.error('Error calling Gemini API:', error);
        return NextResponse.json({ error: 'Failed to analyze with Gemini API' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error initializing Gemini API:', error);
      return NextResponse.json({ error: 'Failed to initialize Gemini API' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Alignment API error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // User-friendly errors
    const errorMessage =
      error.message?.includes('timed out') ? 'Analysis timed out. Please try again.' :
      error.message?.includes('quota') ? 'Service busy. Please try again in a minute.' :
      error.message?.includes('Invalid token') ? 'Session expired. Please refresh the page.' :
      'Could not generate analysis. Please try again later.';

    return NextResponse.json({ error: errorMessage }, { status: error.message?.includes('Unauthorized') ? 401 : 500 });
  }
}