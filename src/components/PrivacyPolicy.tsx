import React from 'react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] p-4 sm:p-8 md:p-12 overflow-y-auto">
      <div className="container mx-auto max-w-4xl text-neutral-300 font-noto text-xs md:text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">個⼈情報保護（プライバシーポリシー）</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        <div className="space-y-4 md:space-y-6 leading-relaxed">
          <section>
            <p>
              True Story【実話の物語】（以下「当社」といいます）は、制作活動を⾏う上で取扱うお客様・お取引先様・従業員等の個⼈情報を適切に保護することを社会的責務と認識し、以下の⽅針に基づき個⼈情報の保護に努めます。
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. 個⼈情報の定義</h2>
            <p>
              本⽅針において「個⼈情報」とは、個⼈情報保護法に定められた定義に従い、⽣存する個⼈に関する情報であって、⽒名、⽣年⽉⽇、住所、電話番号、メールアドレス、勤務先、その他特定の個⼈を識別できるもの、ならびに他の情報と照合することで個⼈を識別できるものを指します。
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. 個⼈情報の取得⽅法</h2>
            <p>
              当社は、以下の⽅法で個⼈情報を取得します。<br />
              ・ウェブサイトやメールフォーム、電話、書⾯等を通じた直接取得<br />
              ・イベント、セミナー、アンケート等での取得<br />
              ・業務委託先や取引先等から適法に提供を受けた場合<br />
              ・公表された情報から適法に収集する場合<br />
              取得の際には、利⽤⽬的を明確にし、適法かつ公正な⼿段で⾏います。
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. 個⼈情報の利⽤⽬的</h2>
            <p>当社は、取得した個⼈情報を以下の⽬的で利⽤します。</p>
            <ol className="list-decimal list-inside pl-4 mt-2 space-y-1">
              <li>サービスや商品の提供および契約履⾏</li>
              <li>お問い合わせやご依頼への対応</li>
              <li>契約、取引、請求、⽀払い等の事務処理</li>
              <li>メールマガジン、ニュースレター、イベント案内等の送付</li>
              <li>アンケート調査、モニター募集等の実施</li>
              <li>法令や契約に基づく権利の⾏使または義務の履⾏</li>
              <li>防犯・安全管理のための記録・監視</li>
              <li>その他、事前に本⼈の同意を得た⽬的</li>
            </ol>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. 個⼈情報の第三者提供</h2>
            <p>
              当社は、以下の場合を除き、本⼈の同意なく第三者に個⼈情報を提供しません。<br />
              ・法令に基づく場合<br />
              ・⼈の⽣命、⾝体または財産の保護のために必要で、本⼈の同意を得ることが困難な場合<br />
              ・公衆衛⽣の向上または児童の健全な育成推進のために特に必要な場合で、本⼈の同意を得ることが困難な場合<br />
              ・国の機関や地⽅公共団体等が法令の定める事務を遂⾏するために協⼒する必要がある場合<br />
              ・業務委託先に必要な範囲で提供する場合（委託先は適切に監督します）
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. 個⼈情報の委託</h2>
            <p>
              当社は、事業運営に必要な範囲で業務を外部に委託する場合、委託先が個⼈情報を適切に取り扱うよう契約等により義務付け、必要かつ適切な監督を⾏います。
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. 個⼈情報の安全管理措置</h2>
            <p>
              当社は、個⼈情報の漏えい、滅失、毀損、不正アクセス等を防⽌するため、以下の安全管理措置を講じます。<br />
              ・個⼈情報管理責任者の設置<br />
              ・個⼈情報の利⽤制限とアクセス権限の管理<br />
              ・パスワードや暗号化等の技術的対策<br />
              ・社員教育や内部監査の実施<br />
              ・保管期限を過ぎた個⼈情報の適切な廃棄・消去
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. クッキー（Cookie）等の利⽤</h2>
            <p>
              当社ウェブサイトでは、利便性向上やアクセス解析等のためCookieや類似技術を使⽤する場合があります。これにより取得される情報は、個⼈を特定するものではなく、設定により使⽤を制限できます。
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. 個⼈情報の開⽰・訂正・利⽤停⽌等</h2>
            <p>
              本⼈または代理⼈から、当社が保有する個⼈情報の開⽰・訂正・追加・削除・利⽤停⽌・第三者提供停⽌の請求があった場合は、法令に従い適切かつ速やかに対応します。<br />
              請求の際には、本⼈確認のための書類提出をお願いする場合があります。
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">9. 法令・規範の遵守</h2>
            <p>
              当社は、個⼈情報の取扱いに関して適⽤される法令、国が定める指針、その他の規範を遵守します。
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">10. 継続的改善</h2>
            <p>
              当社は、個⼈情報保護のための管理体制や取組を継続的に⾒直し、改善します。
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">11. お問い合わせ窓⼝</h2>
            <p>
              本⽅針および個⼈情報の取扱いに関するお問い合わせは、以下の窓⼝までお願いします。<br />
              True Story【実話の物語】<br />
              電話番号：090-9646-8942 （代表）<br />
              メールアドレス：info@truestory.jp<br />
              受付時間：平⽇ 11:00〜19:00（⼟⽇祝・年末年始を除く）
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">12. 制定⽇・改訂⽇</h2>
            <p>
              制定⽇：2025 年 08 ⽉ 01 ⽇
            </p>
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
