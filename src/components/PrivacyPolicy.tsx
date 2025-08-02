import React from 'react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] p-4 sm:p-8 md:p-12 overflow-y-auto">
      <div className="container mx-auto max-w-4xl text-neutral-300 font-noto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">個人情報の取り扱いについて</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="space-y-6 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. 個人情報の取得</h2>
            <p>当サービスでは、投票機能の不正利用防止のため、SMS認証を通じて電話番号を取得します。また、任意で投票者のお名前、応援メッセージをご提供いただくことがあります。</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. 個人情報の利用目的</h2>
            <p>ご提供いただいた個人情報は、以下の目的で利用いたします。</p>
            <ul className="list-disc list-inside pl-4 mt-2">
              <li>投票の重複防止および本人確認</li>
              <li>応援メッセージのサイト上での表示（お名前とメッセージのみ）</li>
              <li>サービスに関する重要なお知らせのご連絡</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. 個人情報の第三者提供</h2>
            <p>当サービスは、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. 個人情報の管理</h2>
            <p>取得した個人情報は、Supabaseの提供するセキュアなデータベース上で厳重に管理し、漏洩、滅失、改ざんの防止に努めます。</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. プライバシーポリシーの変更</h2>
            <p>本ポリシーは、法令の改正やサービスの変更に伴い、事前の予告なく改定されることがあります。変更後のポリシーは、本ページに掲載された時点から効力を生じるものとします。</p>
          </section>
        </div>
        <div className="text-center mt-12">
          <button onClick={onClose} className="bg-white text-black font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
