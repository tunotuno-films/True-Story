import React, { useState, useRef, useEffect } from 'react';

interface Props {
  exampleStory: string;
  story: string;
  setStory: (s: string) => void;
  storyTextareaRef: React.RefObject<HTMLTextAreaElement>;
  insertExampleToForm: () => void;
  handleStoryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  showError: boolean;
}

const StoryForm: React.FC<Props> = ({
  exampleStory,
  story,
  storyTextareaRef,
  insertExampleToForm,
  handleStoryChange,
  handleSubmit,
  isSubmitting,
  showError,
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [canAgree, setCanAgree] = useState(false);
  const noticeRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    // スクロール位置が一番下に近いかどうかを判定 (少し余裕を持たせる)
    if (!canAgree && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setCanAgree(true);
    }
  };

  // ネイティブリスナーを passive: false で登録して preventDefault を許可する
  useEffect(() => {
    const el = noticeRef.current;
    if (!el) return;

    const wheelHandler = (e: WheelEvent) => {
      const delta = (e as WheelEvent).deltaY;
      if ((delta > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight) ||
          (delta < 0 && el.scrollTop <= 0)) {
        e.preventDefault();
      }
    };

    const touchStartHandler = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const touchMoveHandler = (e: TouchEvent) => {
      const startY = touchStartY.current;
      if (startY === null) return;
      const currentY = e.touches[0]?.clientY ?? 0;
      const diff = startY - currentY; // 正：上スクロール、負：下スクロール
      if ((diff > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight) ||
          (diff < 0 && el.scrollTop <= 0)) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', wheelHandler, { passive: false });
    el.addEventListener('touchstart', touchStartHandler, { passive: true });
    el.addEventListener('touchmove', touchMoveHandler, { passive: false });

    return () => {
      el.removeEventListener('wheel', wheelHandler);
      el.removeEventListener('touchstart', touchStartHandler);
      el.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [noticeRef]);

  return (
    <>
      <div className="mb-8 max-w-7xl mx-auto">
        <h4 className="text-left text-xl text-white mb-3 font-bold">応募に関する注意事項</h4>
        <div
          ref={noticeRef}
          onScroll={handleScroll}
          className="h-64 overflow-y-auto bg-neutral-800/30 p-4 border border-neutral-700 rounded-lg text-neutral-300 text-sm space-y-4"
        >
          <p className="font-bold text-white">応募前に必ずご確認ください。</p>
          <div>
            <h5 className="font-bold text-white">1. 募集内容</h5>
            <p>True Story【実話の物語】制作委員会は、2026年夏公開予定の３作品目に関して、皆さまからの「実際に体験した物語」を広く募集いたします。いただいた実話を基に、音楽と映像による作品を制作し、多くの方へ届けたいと考えています。</p>
            <p>今回募集する実話のテーマは、以下の５つとします。</p>
            <ul className="list-disc list-inside pl-4">
              <li>学生時代の葛藤と成長</li>
              <li>恋愛や友情の転機</li>
              <li>家族との絆のすれ違い</li>
              <li>デジタル社会での葛藤</li>
              <li>夢と挫折、挑戦と成長</li>
            </ul>
            <p>この中から１つのテーマを選択し、True Story【実話の物語】公式ホームページからご応募いただけます。最終的に１つの実話を、True Story【実話の物語】制作委員会が決定を行います。</p>
          </div>
          <div>
            <h5 className="font-bold text-white">2. 応募資格</h5>
            <p>年齢：不問（ただし、未成年の場合は保護者の同意が必要となります）</p>
            <p>国籍：不問（ただし、日本語での応募と会話ができる方に限ります）<br />　　　→制作委員会との打ち合わせに関してコミュニケーションが行える方であれば、問題ございません。</p>
            <p>性別：不問</p>
          </div>
          <div>
            <h5 className="font-bold text-white">3. 応募方法</h5>
            <p>True Story【実話の物語】公式ホームページよりお申し込みください。<br />公式ホームページ：<a href="https://www.truestory.jp/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">https://www.truestory.jp/</a></p>
            <p>なお、申込送信後の修正等はシステム構築上、行えませんので、あらかじめご了承ください。</p>
            <p>※お手持ちのデバイスのメモ機能などに下書きをしていただき、コピー&ペーストすることを推奨しております。</p>
          </div>
          <div>
            <h5 className="font-bold text-white">4. 謝礼</h5>
            <p>ご提供いただきました実話が当選された場合、謝礼として5,000円分のQUOカードを贈呈いたします。</p>
            <p>※QUOカードは郵送させていただきますので、当選後に住所等をお伺いさせていただきます。</p>
          </div>
          <div>
            <h5 className="font-bold text-white">5. 審査基準</h5>
            <p>審査基準に関しては公開しておりません。お問い合わせいただいてもお答えいたしかねますので、あらかじめご了承ください。</p>
            <p>また、５つのテーマを設定しておりますが、最終的なテーマ等も募集段階では決まっておりません。True Story【実話の物語】制作委員会としても、最終的にどのテーマで制作を行うのかわからない状態ですので、ご理解いただきますようお願い申し上げます。</p>
          </div>
          <div>
            <h5 className="font-bold text-white">6. 当選インタビュー</h5>
            <p>当選とさせていただきました応募者の方に関しましては、インタビューをさせていただきたく存じます。実話から作品を制作するにあたり、必要な過程となりますので、ご理解いただけますと幸いです。対面またはオンライン（ZOOMなど）でのインタビューとさせていただきます。</p>
            <p>また、インタビューの様子等をドキュメンタリーやメイキング動画で一部使用させていただく場合がございます。実話に基づく作品となりますので、プライバシー等には最大限配慮させていただきますので、ご安心ください。</p>
            <p className="text-xs">※映像使用に関する承諾について<br />
            　当選後に実施するインタビューや取材の際、その様子を撮影させていただく場合があります。撮影した映像・写真・音声は、以下の目的に限り使用させていただきます。<br />
            　1. 本プロジェクト作品の制作過程を伝えるメイキング映像・ドキュメンタリー映像としての使用<br />
            　2. 公式ホームページ・SNS・パンフレット等における広報活動<br />
            　3. 将来開催される上映会やイベントでの紹介資料<br />
            ただし、応募者ご本人のプライバシーや肖像権を尊重し、承諾をいただいた範囲を超えて使用することはありません。撮影データの使用に関しては、インタビュー時に改めて書面または同意フォームにてご確認・ご承諾いただきます。使用を希望されない場合は、その旨を事前にお申し出いただければ、当選結果や謝礼に影響することはありません。</p>
          </div>
          <div>
            <h5 className="font-bold text-white">7. 秘密保持契約に関して</h5>
            <p>当選いたしましたら、秘密保持契約書（NDA）を締結させていただきます。<br />
            秘密保持契約書締結の理由：実話に基づいた作品となるため、他者やSNS上で書き込みをされた場合に、ストーリー構成が漏洩してしまい、約1年の長期プロジェクトとなるTrue Story【実話の物語】の構成上、不利益が大きいため。</p>
            <p>秘密保持契約に関してご理解いただけますよう、お願い申し上げます。</p>
          </div>
          <div>
            <h5 className="font-bold text-white">8. 個人情報の取り扱いに関して</h5>
            <p>本規定において「個人情報」とは、個人情報保護法第2条に定める、氏名、住所、電話番号、メールアドレス、勤務先、役職名、その他特定の個人を識別できる情報をいいます。応募者から取得した個人情報は、本プロジェクトの運営に必要な範囲（応募の受付、当選者への連絡、謝礼の送付、インタビュー実施の調整等）に限り利用します。取得した個人情報は、応募者の同意なく第三者に提供することはありません。</p>
            <p>ただし、法令に基づく場合を除きます。個人情報は、漏洩・紛失・改ざんを防止するために適切な安全管理措置を講じます。当制作委員会は、関係者にも適正な管理を義務付けます。提供いただいた個人情報は、利用目的達成後、一定期間（作品公開後6ヶ月で破棄）を経て適切に廃棄・消去します。</p>
          </div>
          <div className="border-t border-neutral-700 pt-4">
            <p>申し込み後の各種アナウンスや、True Story【実話の物語】制作委員会からのご連絡は登録いただいたメールアドレス宛に送信いたします。メーリングリストを利用する、メール転送等でメールを見落とさないようご注意ください。</p>
            <p>※ご提供いただきました実話が当選した場合は、個別に登録のメールアドレス宛にご連絡させていただきます。「info@truestory.jp」からのアドレスを受信できるようにあらかじめ設定をお願いいたします。</p>
            <p>実話を送信確定後に上記アドレスから、完了メールが届きます。迷惑メールフォルダーなどもご確認いただき、1日経っても届かない場合は、お手数ですがTrue Story【実話の物語】制作委員会までご連絡ください。</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <input
            type="checkbox"
            id="agreement"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
            disabled={!canAgree}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor="agreement" className={`ml-2 block text-sm ${canAgree ? 'text-neutral-300' : 'text-neutral-500'}`}>
            応募に関する注意事項に同意します
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-screen-2xl mx-auto">
        <div className="mb-8 md:mb-0 flex flex-col">
          <h4 className="text-left text-xl text-white mb-3 font-bold">例文</h4>
          <div className="relative flex flex-col h-full">
            <div
              className={`w-full p-4 bg-neutral-900/50 border border-dashed border-neutral-600 rounded-lg text-neutral-300 text-sm max-h-[60vh] overflow-y-auto whitespace-pre-wrap`}
            >
              {exampleStory}
            </div>
            <div className="text-right text-neutral-400 text-sm mt-2 pr-1">
              {exampleStory.length}文字
            </div>
            <div className="text-center mt-2 h-12 flex items-center justify-center">
              <span
                onClick={hasAgreed ? insertExampleToForm : undefined}
                role="button"
                aria-disabled={!hasAgreed}
                tabIndex={hasAgreed ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (hasAgreed) {
                      insertExampleToForm();
                    }
                  }
                }}
                className={`text-emerald-400 ${hasAgreed ? 'hover:underline cursor-pointer' : 'opacity-50 cursor-not-allowed'} text-sm font-semibold transition-opacity duration-200`}
              >
                この例文を元に書く
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <h4 className="text-left text-xl text-white mb-3 font-bold">応募フォーム</h4>
          <div className="relative flex-grow">
            <textarea
              ref={storyTextareaRef}
              value={story}
              onChange={handleStoryChange}
              placeholder="ここにあなたの物語を記入してください..."
              className={`w-full p-4 bg-neutral-900/50 border ${showError ? 'border-red-500' : 'border-dashed border-neutral-600'} rounded-lg text-neutral-300 text-lg min-h-[600px] resize-none`}
              disabled={!hasAgreed}
            />
            {!hasAgreed && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-900/80 rounded-lg">
                <span className="text-red-400 text-sm font-semibold text-center px-4">
                  注意事項を確認し、同意すると入力できます
                </span>
              </div>
            )}
          </div>
          <div className="text-right text-neutral-400 text-sm mt-2 pr-1">
            {story.length}文字
          </div>
          <div className="text-center mt-6 h-20 flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !hasAgreed}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              この物語を送信する
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default StoryForm;
