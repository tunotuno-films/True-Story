import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { story, name, email, allowPublic, usageConsent } = await req.json();

    const GOOGLE_FORM_ACTION_URL = process.env.GOOGLE_STORY_FORM_ACTION_URL;
    const STORY_INPUT_NAME = process.env.GOOGLE_STORY_FORM_STORY_ID;
    const NAME_INPUT_NAME = process.env.GOOGLE_STORY_FORM_NAME_ID;
    const EMAIL_INPUT_NAME = process.env.GOOGLE_STORY_FORM_EMAIL_ID;
    const ALLOW_PUBLIC_INPUT_NAME = process.env.GOOGLE_STORY_FORM_ALLOW_PUBLIC_ID;
    const USAGE_CONSENT_INPUT_NAME = process.env.GOOGLE_STORY_FORM_USAGE_CONSENT_ID;

    if (!GOOGLE_FORM_ACTION_URL || !STORY_INPUT_NAME || !NAME_INPUT_NAME || !EMAIL_INPUT_NAME || !ALLOW_PUBLIC_INPUT_NAME || !USAGE_CONSENT_INPUT_NAME) {
        console.error("Story Form environment variables are not set. Check your .env.local file and Vercel project settings.");
        throw new Error("Server configuration error. Please contact support.");
    }

    const params = new URLSearchParams();
    params.append(STORY_INPUT_NAME, story);
    params.append(NAME_INPUT_NAME, name);
    params.append(EMAIL_INPUT_NAME, email);
    params.append(ALLOW_PUBLIC_INPUT_NAME, allowPublic);
    params.append(USAGE_CONSENT_INPUT_NAME, usageConsent);

    const response = await fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (response.ok || response.status === 302) {
      return NextResponse.json({ message: 'Story submitted successfully' }, { status: 200 });
    } else {
      throw new Error(`Google Forms submission failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error submitting story:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
