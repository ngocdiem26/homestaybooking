import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const tierStyles = {
  BRONZE: {
    label: 'Đồng',
    chip: 'bg-[#9A5A3C] text-white',
    softChip: 'bg-[#F7E8DE] text-[#7A432E]',
    ring: 'ring-[#B6784F]/40',
    accent: 'from-[#9A5A3C] to-[#C1845E]',
  },
  SILVER: {
    label: 'Bạc',
    chip: 'bg-[#77808C] text-white',
    softChip: 'bg-[#EEF0F3] text-[#5F6874]',
    ring: 'ring-[#AAB1BA]/50',
    accent: 'from-[#737B86] to-[#C7CCD3]',
  },
  GOLD: {
    label: 'Vàng',
    chip: 'bg-[#B98210] text-white',
    softChip: 'bg-[#FFF0C8] text-[#8A5B00]',
    ring: 'ring-[#D6A84C]/50',
    accent: 'from-[#B98210] to-[#F1C45B]',
  },
  DIAMOND: {
    label: 'Kim cương',
    chip: 'bg-[#295B83] text-white',
    softChip: 'bg-[#E8F3FB] text-[#23506E]',
    ring: 'ring-[#74B7D8]/50',
    accent: 'from-[#295B83] to-[#8C6ED8]',
  },
};

function getTierStyle(code) {
  return tierStyles[String(code || '').toUpperCase()] || tierStyles.BRONZE;
}

function getTierName(tier) {
  const code = String(tier?.tierCode || tier?.currentTierCode || '').toUpperCase();
  return tierStyles[code]?.label || tier?.tierName || tier?.currentTierName || 'Đồng';
}

function formatDiscount(promotion) {
  if (!promotion) return 'Ưu đãi thành viên Cozygo';

  const value = Number(promotion.discountValue || 0).toLocaleString('vi-VN');
  if (promotion.discountType === 'PERCENT') return 'Giảm ' + value + '% khi lưu trú';
  return 'Giảm ' + value + 'đ khi đặt homestay';
}

function formatDateTime(value) {
  if (!value) return 'Không giới hạn';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không giới hạn';
  return date.toLocaleDateString('vi-VN');
}

function getPromotionUsageState(promotion) {
  const status = String(promotion?.userPromotionStatus || '').toUpperCase();
  const usedCount = Number(promotion?.usedCount || 0);
  const usageLimit = Number(promotion?.usageLimit || 0);
  const usedUp = promotion?.usedByCurrentUser === true || status === 'USED_UP' || (usageLimit > 0 && usedCount >= usageLimit);

  if (status === 'EXPIRED') {
    return { unavailable: true, label: 'Đã hết hạn', tone: 'expired' };
  }
  if (status === 'REVOKED') {
    return { unavailable: true, label: 'Đã thu hồi', tone: 'expired' };
  }
  if (usedUp) {
    return { unavailable: true, label: 'Đã sử dụng', tone: 'used' };
  }
  return { unavailable: false, label: 'Sử dụng ngay', tone: 'active' };
}

function LockStatusIcon({ locked }) {
  return locked ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 7.3-2" />
    </svg>
  );
}

function TierBadge({ tier }) {
  const style = getTierStyle(tier?.currentTierCode || tier?.tierCode);

  return (
    <span className={'inline-flex items-center rounded-full px-3 py-1 text-xs font-black shadow-sm ' + style.chip}>
      Hạng {getTierName(tier)}
    </span>
  );
}

function TierProgressPill({ tier }) {
  const style = getTierStyle(tier.tierCode);
  const locked = !tier.unlocked;

  return (
    <div className="relative z-10 flex justify-center px-2 py-1">
      <div
        className={[
          'inline-flex min-w-[116px] items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-black shadow-sm',
          locked ? 'border-gray-200 bg-gray-50 text-gray-500' : 'border-[#E7C9B8] ' + style.softChip,
          tier.current ? 'ring-2 ring-offset-2 ring-offset-white ' + style.ring : '',
        ].join(' ')}
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/80">
          <LockStatusIcon locked={locked} />
        </span>
        <span>{getTierName(tier)}</span>
      </div>
    </div>
  );
}

function TierRewardCard({ tier, promotion, onUseNow }) {
  const style = getTierStyle(tier.tierCode);
  const locked = !tier.unlocked;
  const usageState = getPromotionUsageState(promotion);
  const validUntilText = formatDateTime(promotion?.userValidUntil);
  const usageText = promotion?.usageLimit
    ? `${Number(promotion.usedCount || 0)}/${Number(promotion.usageLimit)} lượt`
    : '';

  return (
    <article
      className={[
        'min-h-[178px] w-full rounded-2xl border p-4 transition duration-200',
        locked
          ? 'border-gray-200 bg-gray-100 text-gray-400'
          : 'border-gray-200 bg-white text-[#2C1E15] shadow-sm hover:-translate-y-0.5 hover:shadow-md',
      ].join(' ')}
    >
      <div className={'mb-4 h-1.5 rounded-full bg-gradient-to-r ' + (locked ? 'from-gray-300 to-gray-200' : style.accent)} />
      <div className="flex items-start justify-between gap-3">
        <span className={'rounded-full px-3 py-1 text-xs font-black ' + (locked ? 'bg-gray-200 text-gray-500' : style.softChip)}>
          {getTierName(tier)}
        </span>
        <span className={'text-lg font-black ' + (locked ? 'text-gray-300' : 'text-[#2C3E2B]')}>%</span>
      </div>

      <h4 className={'mt-4 min-h-[52px] text-base font-black leading-6 ' + (locked ? 'text-gray-400' : 'text-[#2C1E15]')}>
        {promotion ? formatDiscount(promotion) : locked ? 'Quyền lợi đang chờ mở khóa' : 'Quyền lợi thành viên Cozygo'}
      </h4>

      <p className={'mt-3 line-clamp-2 text-sm font-semibold leading-5 ' + (locked ? 'text-gray-400' : 'text-gray-600')}>
        {promotion?.promotionName || (locked ? 'Đặt thêm đơn hàng để mở khóa quyền lợi của hạng này.' : 'Cozygo sẽ tự động áp dụng khi có ưu đãi phù hợp.')}
      </p>

      {promotion?.promotionCode && (
        <p className={'mt-3 inline-flex rounded-lg px-2 py-1 font-mono text-xs font-black ' + (locked ? 'bg-gray-200 text-gray-500' : 'bg-[#F9F2E8] text-[#7A432E]')}>
          {promotion.promotionCode}
        </p>
      )}

      {promotion ? (
        <div className={'mt-3 space-y-1 rounded-xl px-3 py-2 text-xs font-bold leading-5 ' + (locked ? 'bg-gray-200 text-gray-500' : 'bg-[#F7F4EC] text-gray-600')}>
          <p>Hạn sử dụng: <span className={locked ? 'text-gray-500' : 'text-[#6c483a]'}>{validUntilText}</span></p>
          {usageText ? <p>Lượt dùng: <span className={locked ? 'text-gray-500' : 'text-[#6c483a]'}>{usageText}</span></p> : null}
        </div>
      ) : null}

      {!locked && promotion ? (
        <button
          type="button"
          disabled={usageState.unavailable}
          onClick={(event) => {
            event.stopPropagation();
            if (usageState.unavailable) return;
            onUseNow?.();
          }}
          className={[
            'mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm font-black shadow transition',
            usageState.unavailable
              ? usageState.tone === 'used'
                ? 'cursor-not-allowed bg-[#EDE5DF] text-[#7A432E]'
                : 'cursor-not-allowed bg-gray-200 text-gray-500'
              : 'bg-[#2C3E2B] text-white hover:bg-[#223523]',
          ].join(' ')}
        >
          {usageState.label}
        </button>
      ) : null}
    </article>
  );
}

export function CustomerTierSummary({ tier, userInfo, isLoading, errorMessage }) {
  const currentStyle = getTierStyle(tier?.currentTierCode);
  const currentTierName = getTierName({ tierCode: tier?.currentTierCode, tierName: tier?.currentTierName });
  const displayName = tier?.fullName || userInfo?.name || 'khách hàng Cozygo';
  const nextText = useMemo(() => {
    if (!tier) return '';
    if (!tier.nextTierName) return 'Bạn đã đạt hạng cao nhất của Cozygo.';

    const nextTierName = getTierName({ tierCode: tier.nextTierCode, tierName: tier.nextTierName });
    return 'Còn ' + tier.remainingBookingsToNextTier + ' đơn hoàn thành nữa để lên hạng ' + nextTierName + '.';
  }, [tier]);

  if (isLoading) {
    return <p className="text-sm font-black text-white/70">Đang tải hạng thành viên...</p>;
  }

  if (errorMessage) {
    return <p className="rounded-2xl bg-red-50/10 px-4 py-3 text-sm font-bold text-red-100 ring-1 ring-red-100/20">{errorMessage}</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1fr_1fr] lg:items-stretch">
      <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
        <p className="text-xs font-black uppercase text-[#F0B77A]">Cozygo Membership</p>
        <h2 className="mt-1 font-serif text-2xl font-black text-white">Hạng {currentTierName}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-white/75">
          {displayName} đã hoàn thành {tier?.completedBookings24m || 0} đơn kể từ khi tạo tài khoản.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 text-[#2C1E15] shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-gray-500">Tiến độ hiện tại</p>
            <p className="mt-1 text-2xl font-black">{tier?.completedBookings24m || 0} đơn</p>
          </div>
          <span className={'rounded-2xl px-4 py-2 text-sm font-black ' + currentStyle.chip}>{currentTierName}</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E7E2D8]">
          <div className={'h-full rounded-full bg-gradient-to-r ' + currentStyle.accent} style={{ width: Math.min(100, Math.max(0, tier?.progressPercent || 0)) + '%' }} />
        </div>
      </div>

      <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
        <p className="text-xs font-black uppercase text-[#F0B77A]">Mục tiêu tiếp theo</p>
        <p className="mt-2 text-sm font-black leading-6 text-white">{nextText}</p>
        <div className="mt-3">
          <TierBadge tier={{ tierCode: tier?.currentTierCode, tierName: currentTierName }} />
        </div>
      </div>
    </div>
  );
}

function TierRewardsSlider({ tiers }) {
  const navigate = useNavigate();
  const handleUseNow = () => navigate('/search');

  const rewards = useMemo(
    () =>
      tiers.flatMap((tier) => {
        if (tier.promotions?.length) {
          return tier.promotions.map((promotion) => ({ tier, promotion }));
        }
        return [{ tier, promotion: null }];
      }),
    [tiers],
  );

  return (
    <section className="mt-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-serif text-2xl font-black text-[#2C1E15] md:text-3xl">Quyền lợi theo hạng Cozygo</h3>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-gray-600">
            Các thẻ màu sáng là quyền lợi bạn được nhận. Các thẻ màu xám là quyền lợi sẽ được nhận khi bạn đặt hàng tiếp theo.
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto pb-2">
        <div className="relative mx-auto grid min-w-[760px] max-w-5xl grid-cols-4 items-center gap-4 px-6">
          <div className="absolute left-[9%] right-[9%] top-1/2 h-px -translate-y-1/2 bg-gray-200" />
          {tiers.map((tier) => (
            <TierProgressPill key={tier.tierId} tier={tier} />
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rewards.map(({ tier, promotion }, index) => (
          <TierRewardCard
            key={(promotion?.promotionId || 'tier') + '-' + tier.tierId + '-' + index}
            tier={tier}
            promotion={promotion}
            onUseNow={handleUseNow}
          />
        ))}
      </div>
    </section>
  );
}

export default function CustomerTierOverview({ tiers = [], isLoading = false, errorMessage = '' }) {
  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-black text-gray-500">Đang tải quyền lợi thành viên...</p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 text-sm font-bold text-amber-800">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-8">
      <TierRewardsSlider tiers={tiers} />
    </section>
  );
}
