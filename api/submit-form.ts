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

    if (!GOOGLE_FORM_ACTION_URL) {
        throw new Error("Google Form URL is not configured on the server.");
    }

    const formData = new FormData();
    if (NAME_INPUT_NAME) formData.append(NAME_INPUT_NAME, name);
    if (COMPANY_INPUT_NAME) formData.append(COMPANY_INPUT_NAME, company);
    if (EMAIL_INPUT_NAME) formData.append(EMAIL_INPUT_NAME, email);
    if (PHONE_INPUT_NAME) formData.append(PHONE_INPUT_NAME, phone);
    if (INQUIRY_TYPE_INPUT_NAME) formData.append(INQUIRY_TYPE_INPUT_NAME, inquiryType);
    if (MESSAGE_INPUT_NAME) formData.append(MESSAGE_INPUT_NAME, message);

    const response = await fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      return res.status(200).json({ message: 'Form submitted successfully' });
    } else {
      throw new Error(`Google Forms submission failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({ message: 'An error occurred while submitting the form.' });
  }
}
