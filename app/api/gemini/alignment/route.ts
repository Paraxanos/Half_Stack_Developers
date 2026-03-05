// app/api/gemini/alignment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';

export const runtime = 'nodejs'; // Changed from 'edge' to 'nodejs' due to firebase-admin compatibility
export const preferredRegion = 'iad1';

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
};

const makeSignature = (payload: unknown) =>
  createHash('sha256').update(JSON.stringify(payload)).digest('hex');

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
    const { projectId, cacheOnly = false } = await request.json();
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

    // 6. Build content signatures used to invalidate cache when either side changes
    const profileSignature = makeSignature({
      skills: toStringArray(userProfile.skills),
      workStyle: String(userProfile.workStyle || '').trim(),
      intensity: String(userProfile.intensity || '').trim(),
      department: String(userProfile.department || '').trim(),
    });

    const projectSignature = makeSignature({
      title: String(projectData.title || '').trim(),
      Techstack: toStringArray(projectData.Techstack),
      roleGaps: toStringArray(projectData.roleGaps),
      currentprojectstage: String(projectData.currentprojectstage || '').trim(),
    });

    // 7. Check for cached alignment result
    const cacheDocId = `${uid}_${projectId}`;
    const cacheDoc = await adminDb.collection('alignment_cache').doc(cacheDocId).get();
    
    // Reuse cache only when both profile and project signatures still match.
    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const isProfileUnchanged = cacheData?.profileSignature === profileSignature;
      const isProjectUnchanged = cacheData?.projectSignature === projectSignature;

      if (isProfileUnchanged && isProjectUnchanged && typeof cacheData?.alignment === 'string') {
        console.log('Returning cached alignment result');
        return NextResponse.json({ alignment: cacheData.alignment });
      }

      console.log('Cache invalidated due to profile/project change');
    }

    if (cacheOnly) {
      return NextResponse.json({ alignment: null });
    }

    // 8. Sanitize inputs for prompt (critical security step)
    const sanitize = (str: string, maxLength = 150) =>
      str?.replace(/[<>]/g, '').trim().slice(0, maxLength) || 'Not specified';

    const prompt = `
You are an expert technical matchmaker for developer projects. Analyze compatibility between a developer's profile and a project opportunity.

USER PROFILE:
- Skills: ${sanitize(userProfile.skills?.join(', ') || '')}
- Work Style: ${sanitize(userProfile.workStyle || '')}
- Intensity: ${sanitize(userProfile.intensity || '')}
- Background: ${sanitize(userProfile.department || '')}

PROJECT:
- Title: ${sanitize(projectData.title || '')}
- Tech Stack: ${sanitize(projectData.Techstack?.join(', ') || '')}
- Needed Roles: ${sanitize(projectData.roleGaps?.join(', ') || '')}
- Stage: ${sanitize(projectData.currentprojectstage || '')}

TASK: Write exactly 2 concise sentences (max 250 characters total):
1. First sentence: Highlight the strongest skill/role match
2. Second sentence: Constructively address any gap OR add encouragement

RULES:
- Be specific about matches (e.g., "Your React skills match their frontend needs")
- Never mention names or emails
- Never invent skills not in the profile
- Plain text only - no markdown, quotes, or labels
- Keep it under 250 characters total
`;

    // 9. Call Gemini API with timeout protection
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // Use gemini-2.5-flash - latest advanced model
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',  // Latest advanced flash model
        generationConfig: {
          maxOutputTokens: 300,  // Reduced - we only need ~250 chars
          temperature: 0.2,      // Lower for more focused output
          topP: 0.9,
        },
      });

      // Add timeout protection (8 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const result = await model.generateContent(prompt, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const response = await result.response;
        let alignmentText = response.text().trim();

        // Smart truncation - respect sentence boundaries
        alignmentText = alignmentText
          .replace(/[*_~`"]/g, '')  // Remove markdown
          .replace(/\n+/g, ' ')      // Remove newlines
          .replace(/\s+/g, ' ')      // Normalize spaces
          .trim();

        // If over 280 chars, truncate at last sentence boundary (period)
        if (alignmentText.length > 280) {
          const truncated = alignmentText.slice(0, 280);
          const lastPeriod = truncated.lastIndexOf('.');
          if (lastPeriod > 100) {  // Only if we found a reasonable sentence
            alignmentText = truncated.slice(0, lastPeriod + 1).trim();
          } else {
            // Fallback: just truncate with ellipsis
            alignmentText = truncated.trim() + '...';
          }
        }

        // Ensure minimum useful length
        if (alignmentText.length < 50) {
          alignmentText = "Great potential match! Review the project details to see where your skills align.";
        }

        // Cache the result with signatures so future requests can skip Gemini if unchanged.
        await adminDb.collection('alignment_cache').doc(cacheDocId).set({
          alignment: alignmentText || "Great potential match! Review the project details to see where your skills align.",
          cachedAt: new Date(),
          userId: uid,
          projectId: projectId,
          profileSignature,
          projectSignature,
          userProfileSnapshot: {
            skills: userProfile.skills,
            workStyle: userProfile.workStyle,
            intensity: userProfile.intensity,
            department: userProfile.department,
            updatedAt: userProfile.updatedAt
          },
          projectSnapshot: {
            title: projectData.title,
            Techstack: projectData.Techstack,
            roleGaps: projectData.roleGaps,
            currentprojectstage: projectData.currentprojectstage,
            updatedAt: projectData.updatedAt,
            createdAt: projectData.createdAt,
          }
        });

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