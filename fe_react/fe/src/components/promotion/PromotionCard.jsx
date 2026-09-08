import { useState } from 'react';
import { HiCalendarDays, HiClipboardDocument, HiSparkles, HiTicket } from 'react-icons/hi2';

const TEXT = {
  useNow: 'S\u1eed d\u1ee5ng ngay',
  notForYou: 'Kh\u00f4ng \u00e1p d\u1ee5ng cho b\u1ea1n',
  copyCode: 'Sao ch\u00e9p',
  copied: '\u0110\u00e3 sao ch\u00e9p',
  validUntil: 'H\u1ea1n',
  minimumOrder: '\u0110\u01a1n t\u1ed1i thi\u1ec3u',
  maxDiscount: 'T\u1ed1i \u0111a',
  remaining: 'C\u00f2n',
  appliesTo: '\u00c1p d\u1ee5ng',
  allHomes: 'To\u00e0n h\u1ec7 th\u1ed1ng',
  selectedHomes: 'Homestay \u0111\u01b0\u1ee3c ch\u1ecdn',
  currentTier: 'H\u1ea1ng th\u00e0nh vi\u00ean',
  privateUser: 'T\u00e0i kho\u1ea3n ri\u00eang',
  percent: 'Gi\u1ea3m',
  amount: 'Gi\u1ea3m',
};

const THEME_STYLES = {
  EMBER: { background: 'linear-gradient(135deg, #8a3a20 0%, #c65f28 55%, #f0a64d 100%)' },
  FOREST: { background: 'linear-gradient(135deg, #1f3d2a 0%, #17845f 55%, #77a47b 100%)' },
  LAGOON: { background: 'linear-gradient(135deg, #0f766e 0%, #1678a8 56%, #74add5 100%)' },
  PLUM: { background: 'linear-gradient(135deg, #5d287e 0%, #8b4dd8 55%, #c88be6 100%)' },
  SUNRISE: { background: 'linear-gradient(135deg, #9f2944 0%, #df6b2d 55%, #f1c36d 100%)' },
  MOSS: { background: 'linear-gradient(135deg, #365314 0%, #6b9422 55%, #a8c76f 100%)' },
};

function money(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' \u0111';
}

function dateText(value) {
  if (!value) return 'Không giới hạn';
  const date = new Date(String(value).slice(0, 10) + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('vi-VN');
}

function discountText(promotion) {
  const value = Number(promotion?.discountValue || 0);
  if (String(promotion?.discountType || '').toUpperCase() === 'PERCENT') {
    return TEXT.percent + ' ' + value.toLocaleString('vi-VN') + '%';
  }
  return TEXT.amount + ' ' + money(value);
}

function scopeText(promotion) {
  const scope = String(promotion?.promotionScope || 'GLOBAL').toUpperCase();
  if (scope.includes('HOMESTAY')) return promotion?.homestayNames || TEXT.selectedHomes;
  if (scope.includes('USER')) return TEXT.privateUser;
  if (scope.includes('TIER') || promotion?.tierNames) return promotion?.tierNames || TEXT.currentTier;
  return TEXT.allHomes;
}

function remainingText(promotion) {
  const limit = Number(promotion?.usageLimitTotal || 0);
  if (!limit) return '';
  const used = Number(promotion?.usedCountTotal || 0);
  return Math.max(0, limit - used).toLocaleString('vi-VN') + '/' + limit.toLocaleString('vi-VN');
}

function shouldShowDescription(description) {
  const text = String(description || '').trim();
  if (!text) return false;
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return !normalized.includes('uu dai dang duoc cozygo phat hanh');
}

export default function PromotionCard({ promotion, compact = false, onUse }) {
  const [copied, setCopied] = useState(false);
  const usable = promotion?.usable !== false;
  const themeStyle = THEME_STYLES[promotion?.theme] || THEME_STYLES.FOREST;
  const remaining = remainingText(promotion);
  const showDescription = shouldShowDescription(promotion?.promotionDescription);

  const copyCode = async (event) => {
    event.stopPropagation();
    try {
      await navigator.clipboard?.writeText(promotion?.promotionCode || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className={(compact ? 'h-[176px]' : 'h-[210px]') + ' relative overflow-hidden rounded-2xl border border-white/40 p-4 text-white shadow-lg shadow-[#2C1E15]/10'} style={themeStyle}>
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/18 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-black/10" />

      <div className="relative z-10 grid h-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_178px]">
        <div className="min-w-0 space-y-2.5 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white ring-1 ring-white/18">
              <HiSparkles className="h-3.5 w-3.5" /> {promotion?.promotionScope || 'GLOBAL'}
            </span>
            <button type="button" onClick={copyCode} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/16 px-2.5 text-[10px] font-black text-white ring-1 ring-white/18 transition hover:bg-white hover:text-[#2C1E15]">
              <HiClipboardDocument className="h-3.5 w-3.5" /> {copied ? TEXT.copied : TEXT.copyCode}
            </button>
          </div>

          <div className="space-y-2">
            <div className="inline-flex max-w-full items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-[#2C1E15] shadow-sm">
              <HiTicket className="h-4 w-4 shrink-0 text-[#B65C20]" />
              <span className="truncate text-[13px] font-black tracking-[0.12em]">{promotion?.promotionCode}</span>
            </div>
            <h3 className={(compact ? 'text-lg' : 'text-[19px]') + ' font-classic font-black leading-snug text-white line-clamp-2'}>{promotion?.promotionName}</h3>
          </div>

          {showDescription && !compact && <p className="line-clamp-1 text-[11px] font-semibold leading-5 text-white/82">{promotion.promotionDescription}</p>}

          <div className="flex flex-wrap gap-1.5 text-[10px] font-black">
            <span className="rounded-full bg-white/18 px-2.5 py-1.5 ring-1 ring-white/14">{discountText(promotion)}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1.5 ring-1 ring-white/14"><HiCalendarDays className="h-3.5 w-3.5" /> {TEXT.validUntil}: {dateText(promotion?.userValidUntil || promotion?.endDate)}</span>
            {remaining && <span className="rounded-full bg-white/18 px-2.5 py-1.5 ring-1 ring-white/14">{TEXT.remaining}: {remaining}</span>}
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-2 rounded-2xl bg-black/10 p-3.5 ring-1 ring-white/12">
          <div className="space-y-1.5 text-[10px] font-bold leading-4 text-white/84">
            <p><span className="text-white/58">{TEXT.minimumOrder}: </span>{money(promotion?.minOrderAmount)}</p>
            <p><span className="text-white/58">{TEXT.maxDiscount}: </span>{promotion?.maxDiscount ? money(promotion.maxDiscount) : '--'}</p>
            {!compact && <p className="line-clamp-1"><span className="text-white/58">{TEXT.appliesTo}: </span>{scopeText(promotion)}</p>}
          </div>
          <div className="space-y-1.5 text-left">
            {!usable && <p className="line-clamp-2 text-left text-[9px] font-black leading-4 text-white/90">{promotion?.unavailableReason || TEXT.notForYou}</p>}
            <button
              type="button"
              disabled={!usable}
              onClick={() => usable && onUse?.(promotion)}
              className={(usable ? 'bg-white text-[#2C1E15] hover:-translate-y-0.5 hover:shadow-xl' : 'cursor-not-allowed bg-white/24 text-white/75') + ' inline-flex min-h-9 w-full items-center justify-center rounded-xl px-3 py-2 text-[11px] font-black leading-4 transition'}
            >
              {usable ? TEXT.useNow : TEXT.notForYou}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}


