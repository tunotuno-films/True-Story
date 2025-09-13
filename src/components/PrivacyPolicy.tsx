import React from 'react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] p-4 sm:p-8 md:p-12 overflow-y-auto">
      <div className="container mx-auto max-w-4xl text-neutral-300 font-noto text-xs md:text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">個人情報保護（プライバシーポリシー）</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        <div className="space-y-4 md:space-y-6 leading-relaxed">

          <p>
            True Story【実話の物語】（以下「当社」といいます）は、制作活動および会員サービス（会員マイページを含む）を提供する上で
            取扱うお客様・お取引先様・従業員等の個人情報を適切に保護することを社会的責務と認識し、以下の方針に基づき個人情報の保護に努めます。
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. 個人情報の定義</h2>
            <p>
              本方針において「個人情報」とは、個人情報保護法に定められた定義に従い、氏名、生年月日、住所、電話番号、メールアドレス、
              勤務先、ログインID、パスワード、利用履歴その他特定の個人を識別できるもの、ならびに他の情報と照合することで個人を識別できるものを指します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. 個人情報の取得方法</h2>
            <p>
              当社は、以下の方法で個人情報を取得します。
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>会員登録フォームや会員マイページでの入力</li>
              <li>ウェブサイトやメールフォーム、電話、書面等を通じた直接取得</li>
              <li>イベント、セミナー、アンケート等での取得</li>
              <li>業務委託先や取引先等から適法に提供を受けた場合</li>
              <li>公表された情報から適法に収集する場合</li>
            </ul>
            <p className="mt-2">取得の際には、利用目的を明確にし、適法かつ公正な手段で行います。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. 個人情報の利用目的</h2>
            <p>当社は、取得した個人情報を以下の目的で利用します。</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>サービスや商品の提供および契約履行</li>
              <li>会員登録、本人認証、会員マイページ機能の提供・管理</li>
              <li>会員向けサービス（履歴表示、ポイント、カスタマイズ機能等）の運営</li>
              <li>退会手続きおよび退会後の記録管理</li>
              <li>お問い合わせやご依頼への対応</li>
              <li>契約、取引、請求、支払い等の事務処理</li>
              <li>メールマガジン、ニュースレター、イベント案内等の送付</li>
              <li>アンケート調査、モニター募集等の実施</li>
              <li>法令や契約に基づく権利の行使または義務の履行</li>
              <li>防犯・安全管理のための記録・監視</li>
              <li>その他、事前に本人の同意を得た目的</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. 個人情報の第三者提供</h2>
            <p>
              当社は、以下の場合を除き、本人の同意なく第三者に個人情報を提供しません。
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要で、本人の同意を得ることが困難な場合</li>
              <li>公衆衛生の向上または児童の健全な育成推進のために特に必要な場合で、本人の同意を得ることが困難な場合</li>
              <li>国の機関や地方公共団体等が法令の定める事務を遂行するために協力する必要がある場合</li>
              <li>業務委託先に必要な範囲で提供する場合（委託先は適切に監督します）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. 個人情報の委託</h2>
            <p>
              当社は、事業運営に必要な範囲で業務を外部に委託する場合、委託先が個人情報を適切に取り扱うよう契約等により義務付け、
              必要かつ適切な監督を行います。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. 個人情報の安全管理措置</h2>
            <p>
              当社は、個人情報の漏えい、滅失、毀損、不正アクセス等を防止するため、以下の安全管理措置を講じます。
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>個人情報管理責任者の設置</li>
              <li>個人情報の利用制限とアクセス権限の管理</li>
              <li>パスワードや暗号化等の技術的対策</li>
              <li>社員教育や内部監査の実施</li>
              <li>保管期限を過ぎた個人情報の適切な廃棄・消去</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. クッキー（Cookie）およびローカルストレージ等の利用</h2>
            <p>
              当社ウェブサイトおよび会員マイページでは、利便性向上やアクセス解析等のために Cookie や類似技術を使用する場合があります。
              これにより取得される情報は、個人を特定するものではなく、設定により使用を制限できます。必要に応じて、Google Analytics 等の外部サービスを利用することがあります。
            </p>
            <p className="mt-2">
              また、会員マイページにおいては、ログイン状態の保持、表示設定の保存、利用状況の記録等のために、ブラウザの
              ローカルストレージ（LocalStorage・SessionStorage）を利用する場合があります。ローカルストレージに保存される情報は、
              利用者の端末上でのみ保持され、当社サーバーに自動的に送信されることはありません。
            </p>
            <p className="mt-2">
              利用者は、ご自身のブラウザ設定により、Cookieやローカルストレージの使用を制限または削除することができます。ただし、
              その場合、会員マイページの一部機能が正しく利用できない可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">8. 個人情報の開示・訂正・利用停止等</h2>
            <p>
              本人または代理人から、当社が保有する個人情報の開示・訂正・追加・削除・利用停止・第三者提供停止の請求があった場合は、
              法令に従い適切かつ速やかに対応します。請求の際には、本人確認のための書類提出をお願いする場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">9. 未成年の会員情報について</h2>
            <p>
              16歳未満の方が会員登録を行う場合は、必ず保護者の同意を得てください。当社は、保護者の同意が確認できない場合、
              会員サービスを提供できないことがあります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">10. 法令・規範の遵守</h2>
            <p>
              当社は、個人情報の取扱いに関して適用される法令、国が定める指針、その他の規範を遵守します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">11. 継続的改善</h2>
            <p>
              当社は、個人情報保護のための管理体制や取組を継続的に見直し、改善します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">12. お問い合わせ窓口</h2>
            <p>
              本方針および個人情報の取扱いに関するお問い合わせは、以下の窓口までお願いします。<br />
              True Story【実話の物語】<br />
              電話番号：090-9646-8942 （代表）<br />
              メールアドレス：info@truestory.jp<br />
              受付時間：平日 11:00〜19:00（土日祝・年末年始を除く）
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">13. 制定日・改訂日</h2>
            <p>制定日：2025年08月01日<br />改訂日：2025年09月13日</p>
          </section>
        </div>
        <div className="text-center mt-8 md:mt-12">
          <button onClick={onClose} className="bg-white text-black font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
