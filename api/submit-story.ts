import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { story } = req.body;

    // サーバーサイドの環境変数を取得
    const GOOGLE_FORM_ACTION_URL = process.env.TRUESTORY_FORM_ACTION_URL;
    const STORY_INPUT_NAME = process.env.TRUESTORY_INPUT_NAME;

    if (!GOOGLE_FORM_ACTION_URL || !STORY_INPUT_NAME) {
        console.error("TrueStory Google Form environment variables are not set. Check your .env.local file and Vercel project settings.");
        throw new Error("Server configuration error. Please contact support.");
    }

    const params = new URLSearchParams();
    params.append(STORY_INPUT_NAME, story);

    const response = await fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (response.ok || response.status === 302) {
      return res.status(200).json({ message: 'Form submitted successfully' });
    } else {
      throw new Error(`Google Forms submission failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error submitting story form:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: errorMessage });
  }
}
