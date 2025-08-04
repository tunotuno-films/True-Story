import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { name, company, email, phone, inquiryType, message } = req.body;

    // サーバーサイドの環境変数を取得
    const GOOGLE_FORM_ACTION_URL = process.env.GOOGLE_FORM_ACTION_URL;
    const NAME_INPUT_NAME = process.env.GOOGLE_FORM_NAME_ID;
    const COMPANY_INPUT_NAME = process.env.GOOGLE_FORM_COMPANY_ID;
    const EMAIL_INPUT_NAME = process.env.GOOGLE_FORM_EMAIL_ID;
    const PHONE_INPUT_NAME = process.env.GOOGLE_FORM_PHONE_ID;
    const INQUIRY_TYPE_INPUT_NAME = process.env.GOOGLE_FORM_INQUIRY_TYPE_ID;
    const MESSAGE_INPUT_NAME = process.env.GOOGLE_FORM_MESSAGE_ID;

    if (!GOOGLE_FORM_ACTION_URL || !NAME_INPUT_NAME || !EMAIL_INPUT_NAME || !INQUIRY_TYPE_INPUT_NAME || !MESSAGE_INPUT_NAME) {
        console.error("Contact Form environment variables are not set. Check your .env.local file and Vercel project settings.");
        throw new Error("Server configuration error. Please contact support.");
    }

    const params = new URLSearchParams();
    params.append(NAME_INPUT_NAME, name);
    if (COMPANY_INPUT_NAME) params.append(COMPANY_INPUT_NAME, company);
    params.append(EMAIL_INPUT_NAME, email);
    if (PHONE_INPUT_NAME) params.append(PHONE_INPUT_NAME, phone);
    params.append(INQUIRY_TYPE_INPUT_NAME, inquiryType);
    params.append(MESSAGE_INPUT_NAME, message);

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
    console.error('Error submitting form:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: errorMessage });
  }
}
