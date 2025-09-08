import React from 'react';

const steps = [
	{ label: '企画開始', description: '2025年8月', unlocked: false, details: ['コンセプト決定', 'チーム編成', '法務・権利確認'] },
	{ label: 'クラウドファンディング', description: '2025年10月', unlocked: false, details: ['リワード設計', '告知準備', 'ランディングページ制作'] },
	{ label: '制作開始', description: '2025年12月', unlocked: false, details: ['脚本・絵コンテ', 'キャスティング', 'ロケハン・撮影準備'] },
	{ label: '完成・公開', description: '2026年2月', unlocked: false, details: ['仕上げ（編集/MA/色）', '配信・公開準備', '各種リリース'] },
];

const Schedule: React.FC = () => {
	// 進捗算出
	const total = steps.length;
	const completed = steps.filter((s) => s.unlocked).length;
	const progressPct = Math.round((completed / total) * 100);
	const activeIndex = Math.min(completed, total - 1);

	return (
		<section className="py-20 md:py-32 bg-neutral-900">
			<div className="container mx-auto px-6 md:px-12">
				<h2 className="section-title text-3xl md:text-5xl text-center mb-6 gradient-text">SCHEDULE</h2>

				{/* 全体進捗バッジ */}
				<div className="mb-10 flex items-center justify-center gap-3">
					<div className="inline-flex items-center gap-2 rounded-full bg-neutral-800/70 px-4 py-2 text-neutral-200 text-sm ring-1 ring-white/10">
						<span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
						進捗 {progressPct}%（{completed}/{total}）
					</div>
				</div>

				{/* カード型スケジュール */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					{steps.map((step, idx) => {
						const isDone = step.unlocked;
						const isCurrent = !isDone && idx === activeIndex;
						const isFuture = !isDone && !isCurrent;
						return (
							<div
								key={step.label}
								className={[
									'relative rounded-2xl border p-5 transition overflow-hidden',
									isDone && 'border-emerald-500/30 bg-emerald-500/5',
									isCurrent && 'border-amber-400/30 bg-amber-400/5',
									isFuture && 'border-neutral-700 bg-neutral-800/40',
								].join(' ')}
							>
								{/* 上部アクセントバー（図形感の強調） */}
								<div
									className={[
										'absolute top-0 left-0 h-1.5 w-full',
										isDone && 'bg-gradient-to-r from-emerald-500 to-teal-500',
										isCurrent && 'bg-gradient-to-r from-amber-400 to-yellow-400',
										isFuture && 'bg-neutral-700',
									].join(' ')}
								/>
								{/* 角にデコ（図形のニュアンス） */}
								<div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rotate-45 opacity-10"
									style={{ background: isDone ? '#10B981' : isCurrent ? '#F59E0B' : '#525252' }} />

								{/* ヘッダー（番号/チェック＋ラベル） */}
								<div className="flex items-center gap-3">
									<div
										className={[
											'flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold',
											isDone && 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
											isCurrent && 'bg-neutral-900 text-amber-300 border-2 border-amber-300',
											isFuture && 'bg-neutral-700 text-neutral-400',
										].join(' ')}
									>
										{isDone ? (
											<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										) : (
											idx + 1
										)}
									</div>
									<div className="flex-1">
										<div className="font-noto text-white font-bold">{step.label}</div>
										<div className="text-neutral-400 text-sm">{step.description}</div>
									</div>
								</div>

								{/* ステータスバッジ */}
								<div className="mt-3">
									<span
										className={[
											'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
											isDone && 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20',
											isCurrent && 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20',
											isFuture && 'bg-neutral-700/50 text-neutral-400 ring-1 ring-white/10',
										].join(' ')}
									>
										{isDone ? '完了' : isCurrent ? '進行中' : '予定'}
									</span>
								</div>

								{/* 詳細（常時表示） */}
								<div className="mt-4">
									<div className="mt-3 rounded-lg border border-white/10 bg-neutral-900/40 p-3">
										{Array.isArray(step.details) && step.details.length > 0 ? (
											<ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
												{step.details.map((d: string, i: number) => (
													<li key={i}>{d}</li>
												))}
											</ul>
										) : (
											<p className="text-sm text-neutral-400">詳細は未設定です。</p>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default Schedule;