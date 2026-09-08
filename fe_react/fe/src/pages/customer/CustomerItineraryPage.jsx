import { useCallback, useEffect, useRef, useState } from 'react';
import AiItineraryForm from '../../components/itinerary/AiItineraryForm';
import ItineraryTimeline from '../../components/itinerary/ItineraryTimeline';
import itineraryService from '../../services/itineraryService';
import { fixMaybeText } from '../../utils/textEncoding';

function formatDate(value) {
  if (!value) return 'Chưa chọn ngày';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fixMaybeText(value);
  return date.toLocaleDateString('vi-VN');
}

function destinationLabelFrom(params = {}) {
  const city = fixMaybeText(params.city?.trim());
  const province = fixMaybeText(params.province?.trim());
  const destination = fixMaybeText(params.destination?.trim() || params.destinationKeyword?.trim());

  if (city && province && city !== province) return `${city}, ${province}`;
  if (city) return city;
  if (destination && province && destination !== province) return `${destination}, ${province}`;
  return destination || province || '';
}

function itineraryTitle(itinerary = {}) {
  const title = fixMaybeText(itinerary.itineraryTitle || itinerary.title);
  if (title) return title;
  const destination = fixMaybeText(itinerary.city || itinerary.destinationKeyword || itinerary.province, 'Cozygo');
  return `Lịch trình ${destination} ${itinerary.totalDays || 1} ngày`;
}

export default function CustomerItineraryPage() {
  const detailRef = useRef(null);
  const [activities, setActivities] = useState([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [suggestTarget, setSuggestTarget] = useState('');
  const [itineraries, setItineraries] = useState([]);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formResetVersion, setFormResetVersion] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);
  const activeNotice = error
    ? { type: 'error', text: error }
    : message
      ? { type: 'success', text: message }
      : null;

  const loadItineraries = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await itineraryService.getMy();
      setItineraries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(fixMaybeText(err.message, 'Không tải được sổ tay lịch trình.'));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) loadItineraries();
    });
    return () => {
      cancelled = true;
    };
  }, [loadItineraries]);

  const handleSuggest = useCallback(async (params, options = {}) => {
    const target = destinationLabelFrom(params);
    setSuggestTarget(target);
    setSelectedActivityIds([]);

    if (!options.silent) {
      setError('');
      setMessage('');
    }

    if (!target) {
      setActivities([]);
      if (!options.silent) setError('Vui lòng nhập thành phố hoặc khu vực trước khi gợi ý hoạt động.');
      return;
    }

    setLoadingSuggest(true);
    try {
      const data = await itineraryService.suggestActivities(params);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.activities) ? data.activities : []);
      setActivities(list);
      if (!options.silent && list.length === 0) {
        setMessage(`Hiện chưa có hoạt động phù hợp ở ${target}. Bạn có thể thêm địa điểm riêng.`);
      }
    } catch (err) {
      setActivities([]);
      if (!options.silent) setError(fixMaybeText(err.message, 'Không gợi ý được hoạt động.'));
    } finally {
      setLoadingSuggest(false);
    }
  }, []);

  const toggleActivity = (activityId) => {
    setSelectedActivityIds((current) => (
      current.includes(activityId)
        ? current.filter((id) => id !== activityId)
        : [...current, activityId]
    ));
  };

  const handleGenerate = async (payload) => {
    setError('');
    setMessage('');
    setLoadingGenerate(true);
    try {
      await itineraryService.generate(payload);
      setCurrentItinerary(null);
      setActivities([]);
      setSelectedActivityIds([]);
      setSuggestTarget('');
      setFormResetVersion((version) => version + 1);
      setMessage('Đã tạo và lưu lịch trình AI thành công. Bấm Xem trong sổ tay để mở chi tiết.');
      await loadItineraries();
    } catch (err) {
      setError(fixMaybeText(err.message, 'Không tạo được lịch trình.'));
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleOpen = async (code) => {
    setError('');
    try {
      const itinerary = await itineraryService.getDetail(code);
      setCurrentItinerary(itinerary);
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      setError(fixMaybeText(err.message, 'Không mở được lịch trình.'));
    }
  };

  const handleUpdate = async (code, payload) => {
    setError('');
    setMessage('');
    setSavingEdit(true);
    try {
      const updated = await itineraryService.update(code, payload);
      setCurrentItinerary(updated);
      setMessage('Đã cập nhật lịch trình.');
      await loadItineraries();
      return true;
    } catch (err) {
      setError(fixMaybeText(err.message, 'Không cập nhật được lịch trình.'));
      return false;
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Xóa lịch trình này khỏi sổ tay của bạn?')) return;
    setError('');
    try {
      await itineraryService.delete(code);
      if (currentItinerary?.itineraryCode === code) setCurrentItinerary(null);
      setMessage('Đã xóa lịch trình.');
      await loadItineraries();
    } catch (err) {
      setError(fixMaybeText(err.message, 'Không xóa được lịch trình.'));
    }
  };

  useEffect(() => {
    if (!activeNotice) return undefined;
    const timer = window.setTimeout(() => {
      setError('');
      setMessage('');
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [activeNotice?.text, activeNotice?.type]);

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 text-left animate-fade-in">
      {activeNotice && (
        <div className="fixed right-5 top-24 z-[9999] w-[min(430px,calc(100vw-2rem))]">
          <div className={`rounded-2xl border px-5 py-4 text-sm font-bold shadow-2xl ${activeNotice.type === 'error' ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white ${activeNotice.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
                {activeNotice.type === 'error' ? '!' : '✓'}
              </span>
              <p className="flex-1 leading-6">{activeNotice.text}</p>
              <button type="button" onClick={() => { setError(''); setMessage(''); }} className="-mr-1 rounded-full px-2 text-lg leading-none text-current opacity-70 transition hover:opacity-100" aria-label="Đóng thông báo">
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
        <header className="border-b border-gray-100 px-5 py-5 lg:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              {/* <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#B66A3C]">Cozygo AI Planner</p> */}
              <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Tạo lịch trình chuyến đi</h2>
            </div>
            <p className="max-w-2xl text-xs font-semibold leading-5 text-gray-500">
              Nhập thông tin chuyến đi, chọn hoạt động gợi ý hoặc thêm địa điểm riêng. Lịch đã tạo nằm trong sổ tay bên phải.
            </p>
          </div>
        </header>

        <div className="space-y-4 px-5 py-5 lg:px-6">

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <AiItineraryForm
              activities={activities}
              selectedActivityIds={selectedActivityIds}
              destinationLabel={suggestTarget}
              loadingSuggest={loadingSuggest}
              loadingGenerate={loadingGenerate}
              onSuggest={handleSuggest}
              onToggleActivity={toggleActivity}
              onGenerate={handleGenerate}
              resetVersion={formResetVersion}
            />

            <aside className="2xl:sticky 2xl:top-6 2xl:self-start">
              <section className="overflow-hidden rounded-3xl border border-[#E6DDD2] bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h3 className="font-classic text-xl font-bold text-[#2C1E15]">Sổ tay lịch trình</h3>
                  <p className="text-xs font-semibold text-gray-400">Bấm Xem để mở chi tiết.</p>
                </div>
                <div className="max-h-[650px] space-y-3 overflow-y-auto bg-[#FAF7F2] p-4 custom-scrollbar">
                  {loadingList ? (
                    <p className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-center text-sm font-bold text-gray-500">
                      Đang tải...
                    </p>
                  ) : itineraries.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm font-bold text-gray-500">
                      Chưa có lịch trình đã lưu.
                    </p>
                  ) : itineraries.map((itinerary) => {
                    const active = currentItinerary?.itineraryCode === itinerary.itineraryCode;
                    return (
                      <article
                        key={itinerary.itineraryCode}
                        className={`rounded-2xl border p-4 transition ${active ? 'border-[#2C3E2B] bg-white ring-2 ring-[#2C3E2B]/10' : 'border-gray-200 bg-white hover:border-[#B46A44]/40'}`}
                      >
                        <h4 className="line-clamp-2 font-bold text-[#2C1E15]">{itineraryTitle(itinerary)}</h4>
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          {fixMaybeText(itinerary.city || itinerary.destinationKeyword || itinerary.province, 'Điểm đến')} · {formatDate(itinerary.startDate)}
                        </p>
                        <p className="mt-2 text-xs font-bold text-[#6E473B]">
                          {itinerary.totalDays || 0} ngày · {itinerary.travelerCount || 0} khách · {itinerary.itemCount || 0} mục
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpen(itinerary.itineraryCode)}
                            className="flex-1 rounded-xl bg-[#2C3E2B] px-3 py-2 text-xs font-black text-white transition hover:bg-[#223322]"
                          >
                            Xem
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(itinerary.itineraryCode)}
                            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <div ref={detailRef}>
        <ItineraryTimeline
          key={currentItinerary?.itineraryCode || 'empty-itinerary'}
          itinerary={currentItinerary}
          onSaveEdit={handleUpdate}
          savingEdit={savingEdit}
        />
      </div>
    </div>
  );
}



