import React, { useState } from 'react';

interface ContactProps {
    onShowPrivacyPolicy: () => void;
}

const Contact: React.FC<ContactProps> = ({ onShowPrivacyPolicy }) => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        inquiryType: '',
        message: '',
    });
    const [messageLength, setMessageLength] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Googleフォームの情報を環境変数から取得
    const GOOGLE_FORM_ACTION_URL = import.meta.env.VITE_GOOGLE_FORM_ACTION_URL || '';
    const NAME_INPUT_NAME = import.meta.env.VITE_GOOGLE_FORM_NAME_ID || '';
    const COMPANY_INPUT_NAME = import.meta.env.VITE_GOOGLE_FORM_COMPANY_ID || '';
    const EMAIL_INPUT_NAME = import.meta.env.VITE_GOOGLE_FORM_EMAIL_ID || '';
    const PHONE_INPUT_NAME = import.meta.env.VITE_GOOGLE_FORM_PHONE_ID || '';
    const INQUIRY_TYPE_INPUT_NAME = import.meta.env.VITE_GOOGLE_FORM_INQUIRY_TYPE_ID || '';
    const MESSAGE_INPUT_NAME = import.meta.env.VITE_GOOGLE_FORM_MESSAGE_ID || '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message || !formData.inquiryType) {
            setErrorMessage('必須項目をすべて入力してください。');
            setIsError(true);
            setTimeout(() => setIsError(false), 3000);
            return;
        }

        const phoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{4}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            setErrorMessage('有効な電話番号の形式ではありません。');
            setIsError(true);
            setTimeout(() => setIsError(false), 3000);
            return;
        }

        setIsSubmitting(true);
        setIsError(false);
        setErrorMessage('');

        const googleFormData = new FormData();
        googleFormData.append(NAME_INPUT_NAME, formData.name);
        googleFormData.append(COMPANY_INPUT_NAME, formData.company);
        googleFormData.append(EMAIL_INPUT_NAME, formData.email);
        googleFormData.append(PHONE_INPUT_NAME, formData.phone);
        googleFormData.append(INQUIRY_TYPE_INPUT_NAME, formData.inquiryType);
        googleFormData.append(MESSAGE_INPUT_NAME, formData.message);

        fetch(GOOGLE_FORM_ACTION_URL, {
            method: 'POST',
            body: googleFormData,
            mode: 'no-cors',
        })
        .then(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            setErrorMessage('送信中にエラーが発生しました。');
            setIsError(true);
            setIsSubmitting(false);
        });
    };

    return (
        <section id="contact" className="py-20 md:py-32 bg-black">
            <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
                    CONTACT
                </h2>
                <p className="font-noto text-lg text-center text-neutral-300 mb-12">
                    プロジェクトに関するお問い合わせはこちらから
                </p>

                <div className="bg-neutral-900 p-8 rounded-lg shadow-lg">
                    {isSuccess ? (
                        <div className="text-center text-white p-8">
                            <h3 className="text-2xl font-bold mb-4 text-emerald-400">送信完了</h3>
                            <p>お問い合わせいただきありがとうございます。</p>
                            <p>内容を確認の上、担当者よりご連絡いたします。</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6 mb-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                                        お名前<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-gray-500"
                                        placeholder="山田 太郎"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                                        会社名
                                    </label>
                                    <input
                                        type="text"
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-gray-500"
                                        placeholder="株式会社TrueStory"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                                        メールアドレス<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // 日本語の入力を防ぐ
                                            const filteredValue = value.replace(/[ぁ-んァ-ン一-龯]/g, '');
                                            setFormData({ ...formData, email: filteredValue });
                                        }}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-gray-500"
                                        placeholder="your.email@example.com"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                        電話番号
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // 数字とハイフン以外の入力を防ぐ
                                            const filteredValue = value.replace(/[^0-9-]/g, '');
                                            setFormData({ ...formData, phone: filteredValue });
                                        }}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-gray-500"
                                        placeholder="090-1234-5678"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="inquiryType" className="block text-sm font-medium mb-2">
                                        お問い合わせの種類<span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        id="inquiryType"
                                        value={formData.inquiryType}
                                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                                        disabled={isSubmitting}
                                    >
                                        <option value="" disabled>選択してください</option>
                                        <option value="プロジェクトについて">プロジェクトについて</option>
                                        <option value="スポンサーについて">スポンサーについて</option>
                                        <option value="取材・メディア関連">取材・メディア関連</option>
                                        <option value="その他">その他</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-medium mb-2">
                                    お問い合わせ内容<span className="text-red-500 ml-1">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => {
                                        setFormData({ ...formData, message: e.target.value });
                                        setMessageLength(e.target.value.length);
                                    }}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-gray-500"
                                    placeholder="お問い合わせ内容を入力してください"
                                    disabled={isSubmitting}
                                />
                                <div className="flex justify-end mt-1">
                                    <span className="text-sm text-gray-400">
                                        {messageLength}文字
                                    </span>
                                </div>
                            </div>

                            <div className="text-center text-xs text-neutral-400 mb-4">
                                <p>
                                    「送信する」ボタンを押すことにより、
                                    <button type="button" onClick={onShowPrivacyPolicy} className="text-cyan-400 hover:underline">個人情報の取り扱い</button>
                                    について同意したものとみなします。
                                </p>
                            </div>

                            <div className="text-center mt-8">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50"
                                >
                                    {isSubmitting ? '送信中...' : '送信する'}
                                </button>
                            </div>
                            {isError && (
                                <p className="text-center text-red-500 mt-4">
                                    {errorMessage}
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Contact;
