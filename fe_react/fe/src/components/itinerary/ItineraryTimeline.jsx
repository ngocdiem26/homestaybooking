import {  useState } from 'react';
import ItineraryDayCard from './ItineraryDayCard';
import { TimeSelect } from './CustomPlaceInputList';
import { fixMaybeText } from '../../utils/textEncoding';

function normalizeDays(itinerary) {
  if (!itinerary) return [];
  if (Array.isArray(itinerary.days)) return itinerary.days;
  if (!Array.isArray(itinerary.items)) return [];

  const grouped = itinerary.items.reduce((map, item) => {
    const dayNumber = item.dayNumber || item.day_number || 1;
    if (!map.has(dayNumber)) {
      map.set(dayNumber, { dayNumber, dayTitle: `Lịch trình ngày ${dayNumber}`, items: [] });
    }
    map.get(dayNumber).items.push(item);
    return map;
  }, new Map());

  return Array.from(grouped.values()).sort((a, b) => a.dayNumber - b.dayNumber);
}

// function formatDate(value) {
//   if (!value) return '';
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return fixMaybeText(value);
//   return date.toLocaleDateString('vi-VN');
// }

function toTimeInput(value) {
  return value ? String(value).slice(0, 5) : '';
}

function itemDraft(item = {}, dayNumber = 1, index = 0) {
  return {
    itemId: item.itemId || item.item_id || null,
    dayNumber: item.dayNumber || item.day_number || dayNumber,
    startTime: toTimeInput(item.startTime || item.start_time),
    endTime: toTimeInput(item.endTime || item.end_time),
    durationMinutes: item.durationMinutes || item.duration_minutes || null,
    preferredTimeOfDay: item.preferredTimeOfDay || item.preferred_time_of_day || 'ANY',
    fixedTime: Boolean(item.fixedTime || item.fixed_time),
    title: fixMaybeText(item.title, ''),
    address: fixMaybeText(item.address, ''),
    itemType: item.itemType || item.item_type || 'ACTIVITY',
    sourceType: item.sourceType || item.source_type || 'USER_CUSTOM',
    sourceId: item.sourceId || item.source_id || null,
    activityId: item.activityId || item.activity_id || null,
    homestayId: item.homestayId || item.homestay_id || null,
    latitude: item.latitude || null,
    longitude: item.longitude || null,
    estimatedCost: item.estimatedCost || item.estimated_cost || null,
    transportNote: fixMaybeText(item.transportNote || item.transport_note, ''),
    note: fixMaybeText(item.note, ''),
    displayOrder: item.displayOrder || item.display_order || index + 1,
  };
}

function buildDraft(itinerary) {
  const days = normalizeDays(itinerary);
  return {
    itineraryTitle: fixMaybeText(itinerary?.itineraryTitle || itinerary?.title, ''),
    summary: fixMaybeText(itinerary?.itinerarySummary || itinerary?.summary, ''),
    days: days.map((day) => ({
      dayNumber: day.dayNumber || day.day_number || 1,
      items: (Array.isArray(day.items) ? day.items : []).map((item, index) => itemDraft(item, day.dayNumber || day.day_number || 1, index)),
    })),
  };
}

function buildPayload(draft) {
  return {
    itineraryTitle: draft.itineraryTitle?.trim() || null,
    summary: draft.summary?.trim() || null,
    days: draft.days.map((day) => ({
      dayNumber: Number(day.dayNumber) || 1,
      items: day.items
        .filter((item) => item.title?.trim())
        .map((item, index) => ({
          ...item,
          displayOrder: index + 1,
          startTime: item.startTime || null,
          endTime: item.endTime || null,
          title: item.title.trim(),
          address: item.address?.trim() || null,
          transportNote: item.transportNote?.trim() || null,
          note: item.note?.trim() || null,
        })),
    })),
  };
}

function emptyItem(dayNumber) {
  return itemDraft({
    dayNumber,
    startTime: '09:00',
    endTime: '10:00',
    title: 'Địa điểm mới',
    itemType: 'CUSTOM',
    sourceType: 'USER_CUSTOM',
    fixedTime: true,
  }, dayNumber, 0);
}

export default function ItineraryTimeline({ itinerary, onSaveEdit, savingEdit = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => buildDraft(itinerary));


  if (!itinerary) {
    return (
      <section id="itinerary-detail" className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B46A44]">Chi tiết lịch trình</p>
        <h3 className="mt-2 font-classic text-2xl font-bold text-[#2C1E15]">Chọn một lịch trình để xem</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-gray-500">
          Sổ tay chỉ hiển thị danh sách lịch trình đã tạo. Khi bấm Xem, nội dung chi tiết sẽ mở tại khu vực này.
        </p>
      </section>
    );
  }

  const days = normalizeDays(itinerary);
  const city = fixMaybeText(itinerary.city || itinerary.destinationKeyword || itinerary.province, 'Điểm đến');
  const title = fixMaybeText(itinerary.itineraryTitle, `Lịch trình ${city} ${itinerary.totalDays || days.length || 1} ngày`);
  const summary = fixMaybeText(itinerary.itinerarySummary || itinerary.summary);
  const pace = fixMaybeText(itinerary.pace || itinerary.travelPace || 'Vừa phải');

  const updateDraftItem = (dayIndex, itemIndex, field, value) => {
    setDraft((current) => ({
      ...current,
      days: current.days.map((day, dIndex) => (
        dIndex !== dayIndex ? day : {
          ...day,
          items: day.items.map((item, iIndex) => (iIndex === itemIndex ? { ...item, [field]: value } : item)),
        }
      )),
    }));
  };

  const removeDraftItem = (dayIndex, itemIndex) => {
    setDraft((current) => ({
      ...current,
      days: current.days.map((day, dIndex) => (
        dIndex !== dayIndex ? day : { ...day, items: day.items.filter((_, iIndex) => iIndex !== itemIndex) }
      )),
    }));
  };

  const addDraftItem = (dayIndex) => {
    setDraft((current) => ({
      ...current,
      days: current.days.map((day, dIndex) => (
        dIndex !== dayIndex ? day : { ...day, items: [...day.items, emptyItem(day.dayNumber)] }
      )),
    }));
  };

  const save = async () => {
    const saved = await onSaveEdit?.(itinerary.itineraryCode, buildPayload(draft));
    if (saved) setEditing(false);
  };

  return (
    <section id="itinerary-detail" className="space-y-6 scroll-mt-8">
      <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1F2E3D] via-[#233449] to-[#6E473B] p-7 text-white shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#F7BC83]">Cozygo AI Itinerary</p>
        {editing ? (
          <input
            value={draft.itineraryTitle}
            onChange={(event) => setDraft((current) => ({ ...current, itineraryTitle: event.target.value }))}
            className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-classic text-3xl font-bold text-white outline-none"
          />
        ) : (
          <h2 className="mt-3 font-classic text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
        )}
        {editing ? (
          <textarea
            value={draft.summary}
            rows={3}
            onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
            className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold leading-7 text-white outline-none"
          />
        ) : summary && <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-white/85">{summary}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-black">{city}</span>
          <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-black">{itinerary.totalDays || days.length || 1} ngày</span>
          <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-black">{itinerary.travelerCount || 1} khách</span>
          <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-black">Nhịp độ {pace}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B46A44]">Cây lịch trình</p>
            <h3 className="font-classic text-2xl font-bold text-[#2C1E15]">Các hoạt động theo từng ngày</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <button type="button" onClick={() => { setDraft(buildDraft(itinerary)); setEditing(false); }} className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-black text-gray-700">Hủy</button>
                <button type="button" onClick={save} disabled={savingEdit} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60">{savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </>
            ) : (
              <button type="button" onClick={() => setEditing(true)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-white shadow hover:bg-amber-600">Sửa lịch trình</button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-5">
            {draft.days.map((day, dayIndex) => (
              <section key={day.dayNumber} className="rounded-2xl border border-gray-200 bg-[#FDFCF9] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-classic text-xl font-bold text-[#2C1E15]">Ngày {day.dayNumber}</h4>
                  <button type="button" onClick={() => addDraftItem(dayIndex)} className="rounded-xl bg-[#2C3E2B] px-3 py-2 text-xs font-black text-white">Thêm mục</button>
                </div>
                <div className="space-y-3">
                  {day.items.map((item, itemIndex) => (
                    <div key={item.itemId || `${day.dayNumber}-${itemIndex}`} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-[150px_150px_minmax(0,1fr)_minmax(0,1fr)_90px]">
                      <TimeSelect label="Giờ bắt đầu" value={item.startTime} onChange={(value) => updateDraftItem(dayIndex, itemIndex, 'startTime', value)} />
                      <TimeSelect label="Giờ kết thúc" value={item.endTime} onChange={(value) => updateDraftItem(dayIndex, itemIndex, 'endTime', value)} />
                      <input value={item.title} onChange={(event) => updateDraftItem(dayIndex, itemIndex, 'title', event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold" />
                      <input value={item.address || ''} onChange={(event) => updateDraftItem(dayIndex, itemIndex, 'address', event.target.value)} placeholder="Địa chỉ / khu vực" className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold" />
                      <button type="button" onClick={() => removeDraftItem(dayIndex, itemIndex)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600">Xóa</button>
                      <textarea value={item.note} onChange={(event) => updateDraftItem(dayIndex, itemIndex, 'note', event.target.value)} rows={2} className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-5" placeholder="Ghi chú" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {days.length > 0 ? days.map((day) => <ItineraryDayCard key={day.dayNumber || day.day_number} day={day} />) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-[#F8F6F1] px-5 py-10 text-center text-sm font-bold text-gray-500">
                Lịch trình này chưa có nội dung chi tiết.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
