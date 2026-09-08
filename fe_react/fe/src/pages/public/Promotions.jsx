import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowPath, HiCheckCircle, HiNoSymbol, HiTicket } from 'react-icons/hi2';
import UserLayout from '../../layouts/UserLayout';
import PromotionCard from '../../components/promotion/PromotionCard';
import { getPublicPromotions } from '../../services/promotionService';
import { buildSearchParams, saveSearchState } from '../../services/searchState';

const TEXT = {
  backHome: 'Quay l\u1ea1i trang ch\u1ee7',
  eyebrow: 'COZYGO DEALS',
  title: 'T\u1ea5t c\u1ea3 m\u00e3 khuy\u1ebfn m\u00e3i',
  subtitle: 'Xem c\u00e1c \u01b0u \u0111\u00e3i \u0111ang ph\u00e1t h\u00e0nh t\u1eeb Cozygo. M\u00e3 kh\u00f4ng \u0111\u1ee7 \u0111i\u1ec1u ki\u1ec7n s\u1ebd \u0111\u01b0\u1ee3c ghi r\u00f5 l\u00fd do.',
  all: 'T\u1ea5t c\u1ea3',
  usable: 'D\u00f9ng \u0111\u01b0\u1ee3c',
  unavailable: 'Kh\u00f4ng ph\u00f9 h\u1ee3p',
  refresh: 'L\u00e0m m\u1edbi',
  loading: '\u0110ang t\u1ea3i danh s\u00e1ch m\u00e3 khuy\u1ebfn m\u00e3i...',
  empty: 'Ch\u01b0a c\u00f3 m\u00e3 khuy\u1ebfn m\u00e3i n\u00e0o \u0111\u1ec3 hi\u1ec3n th\u1ecb.',
  useMessage: 'M\u00e3 \u0111\u00e3 \u0111\u01b0\u1ee3c l\u01b0u cho l\u01b0\u1ee3t t\u00ecm ki\u1ebfm. Ch\u1ecdn homestay v\u00e0o b\u01b0\u1edbc \u0111\u1eb7t ph\u00f2ng \u0111\u1ec3 \u00e1p d\u1ee5ng.',
};

export default function Promotions() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await getPublicPromotions();
      setPromotions(data);
    } catch (error) {
      setPromotions([]);
      setErrorMessage(error.message || 'Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c danh s\u00e1ch khuy\u1ebfn m\u00e3i.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const stats = useMemo(() => ({
    all: promotions.length,
    usable: promotions.filter((promotion) => promotion.usable !== false).length,
    unavailable: promotions.filter((promotion) => promotion.usable === false).length,
  }), [promotions]);

  const filteredPromotions = useMemo(() => {
    if (filter === 'USABLE') return promotions.filter((promotion) => promotion.usable !== false);
    if (filter === 'UNAVAILABLE') return promotions.filter((promotion) => promotion.usable === false);
    return promotions;
  }, [filter, promotions]);

  const usePromotion = (promotion) => {
    const saved = saveSearchState({ promotionCode: promotion.promotionCode });
    const params = buildSearchParams(saved);
    setNotice(TEXT.useMessage);
    navigate('/search' + (params.toString() ? '?' + params.toString() : ''));
  };

  const filters = [
    { key: 'ALL', label: TEXT.all, count: stats.all, icon: HiTicket },
    { key: 'USABLE', label: TEXT.usable, count: stats.usable, icon: HiCheckCircle },
    { key: 'UNAVAILABLE', label: TEXT.unavailable, count: stats.unavailable, icon: HiNoSymbol },
  ];

  return (
    <UserLayout>
      <main className="min-h-screen bg-[#F4F1EA] pb-20 pt-8 text-left text-[#23150d]">
        <section className="mx-auto max-w-7xl px-4 md:px-8">
          <button type="button" onClick={() => navigate('/')} className="mb-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#2C3E2B] shadow-sm ring-1 ring-[#6E473B]/10 transition hover:bg-[#2C3E2B] hover:text-white">
            <HiArrowLeft className="h-5 w-5" /> {TEXT.backHome}
          </button>

          <div className="rounded-[28px] border border-[#6E473B]/10 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#B6784F]">{TEXT.eyebrow}</p>
                <h1 className="mt-2 font-classic text-3xl font-black leading-tight text-[#2C1E15] md:text-4xl">{TEXT.title}</h1>
                <p className="mt-2 text-sm font-semibold leading-6 text-gray-500">{TEXT.subtitle}</p>
              </div>
              <button type="button" onClick={loadPromotions} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#FF9800] px-5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#E97820]">
                <HiArrowPath className="h-5 w-5" /> {TEXT.refresh}
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {filters.map(({ key, label, count, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setFilter(key)} className={(filter === key ? 'bg-[#2C3E2B] text-white shadow-lg shadow-[#2C3E2B]/20' : 'bg-[#F7F4EC] text-[#2C1E15] hover:bg-white') + ' inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-black transition'}>
                  <Icon className="h-5 w-5" /> {label} <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {(errorMessage || notice) && (
            <div className={(errorMessage ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-200 bg-emerald-50 text-emerald-700') + ' mt-5 rounded-2xl border px-4 py-3 text-sm font-black'}>
              {errorMessage || notice}
            </div>
          )}

          {isLoading ? (
            <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-[210px] animate-pulse rounded-2xl bg-white/70" />)}
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-[#6E473B]/20 bg-white p-10 text-center text-sm font-black text-gray-400">{TEXT.empty}</div>
          ) : (
            <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredPromotions.map((promotion) => <PromotionCard key={promotion.promotionId} promotion={promotion} onUse={usePromotion} />)}
            </div>
          )}
        </section>
      </main>
    </UserLayout>
  );
}
