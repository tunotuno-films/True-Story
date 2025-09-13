import React from 'react';
import clsx from 'clsx';

const steps = [
	{
		label: '第1フェーズ',
		description: '2025年9月〜',
		unlocked: false,
		details: ['実話募集', 'アーティスト募集', 'スポンサーシップ募集（1次）'],
	},
	{
		label: '第2フェーズ',
		description: '2025年11月〜',
		unlocked: false,
		details: ['実話審査と決定', 'アーティスト募集書類審査', 'スポンサーシップ決定（1次）'],
	},
	{
		label: '第3フェーズ',
		description: '2025年12月〜',
		unlocked: false,
		details: ['アーティストSNS一般投票', 'スポンサーシップ募集（2次）'],
	},
	{
		label: '第4フェーズ',
		description: '2026年1月〜',
		unlocked: false,
		details: ['アーティスト最終審査', '出演者募集', 'スポンサーシップ決定（2次）'],
	},
	{
		label: '第5フェーズ',
		description: '2026年2月〜',
		unlocked: false,
		details: ['楽曲制作期間', '出演者選考期間'],
	},
	{
		label: '第6フェーズ',
		description: '2026年3月〜',
		unlocked: false,
		details: ['楽曲完成', 'クラウドファンディング開始', 'スポンサーシップ募集、決定（3次）'],
	},
	{
		label: '第7フェーズ',
		description: '2026年5月〜',
		unlocked: false,
		details: ['ミュージックビデオ撮影、編集'],
	},
	{
		label: '第8フェーズ',
		description: '2026年7月〜',
		unlocked: false,
		details: ['クラウドファンディングリターン発送', '本編公開', 'メイキング等コンテンツ公開'],
	},
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
				<h2 className="section-title text-3xl md:text-5xl text-center mb-6 gradient-text">
					SCHEDULE
				</h2>

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
								className={clsx(
									'relative rounded-2xl border p-5 transition overflow-hidden',
									{
										'border-emerald-500/30 bg-emerald-500/5': isDone,
										'border-amber-400/30 bg-amber-400/5': isCurrent,
										'border-neutral-700 bg-neutral-800/40': isFuture,
									}
								)}
							>
								{/* 上部アクセントバー（図形感の強調） */}
								<div
									className={clsx(
										'absolute top-0 left-0 h-1.5 w-full',
										{
											'bg-gradient-to-r from-emerald-500 to-teal-500': isDone,
											'bg-gradient-to-r from-amber-400 to-yellow-400': isCurrent,
											'bg-neutral-700': isFuture,
										}
									)}
								/>
								{/* 角にデコ（図形のニュアンス） */}
								<div
									className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rotate-45 opacity-10"
									style={{
										background: isDone
											? '#10B981'
											: isCurrent
											? '#F59E0B'
											: '#525252',
									}}
								/>

								{/* ヘッダー（番号/チェック＋ラベル） */}
								<div className="flex items-center gap-3">
									<div
										className={clsx(
											'flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold',
											{
												'bg-gradient-to-r from-emerald-500 to-teal-500 text-white':
													isDone,
												'bg-neutral-900 text-amber-300 border-2 border-amber-300':
													isCurrent,
												'bg-neutral-700 text-neutral-400': isFuture,
											}
										)}
									>
										{isDone ? (
											<svg
												className="h-6 w-6"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
											>
												<path
													d="M20 6L9 17l-5-5"
													strokeWidth="2.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										) : (
											idx + 1
										)}
									</div>
									<div className="flex-1">
										<div className="font-noto text-white font-bold">
											{step.label}
										</div>
										<div className="text-neutral-400 text-sm">
											{step.description}
										</div>
									</div>
								</div>

								{/* ステータスバッジ */}
								<div className="mt-3">
									<span
										className={clsx(
											'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
											{
												'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20':
													isDone,
												'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20':
													isCurrent,
												'bg-neutral-700/50 text-neutral-400 ring-1 ring-white/10':
													isFuture,
											}
										)}
									>
										{isDone ? '完了' : isCurrent ? '進行中' : '予定'}
									</span>
								</div>

								{/* 詳細（常時表示） */}
								<div className="mt-4">
									<div className="mt-3 rounded-lg border border-white/10 bg-neutral-900/40 p-3">
										{Array.isArray(step.details) &&
										step.details.length > 0 ? (
											<ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
												{step.details.map((d: string) => (
													<li key={d}>{d}</li>
												))}
											</ul>
										) : (
											<p className="text-sm text-neutral-400">
												詳細は未設定です。
											</p>
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