import { useState, useRef, useEffect } from 'react';
import {
  HiMagnifyingGlass, 
  HiCalendarDays, 
  HiUsers, 
  HiMapPin, 
  HiClock, 
  HiXMark,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';

import {
  getStoredSearchHistory,
  saveDestinationToHistory,
  removeDestinationFromHistory,
  clearSearchHistory,
  loadAccountSearchHistory,
  saveDestinationToAccountHistory,
  removeDestinationFromAccountHistory,
  clearAccountSearchHistory,
} from '../../services/searchHistoryService';

import { getStoredSearchState, saveSearchState, SEARCH_STATE_EVENT } from '../../services/searchState';

const POPULAR_DESTINATIONS = ['Đà Lạt', 'Vũng Tàu', 'TP HCM', 'Hội An', 'Phú Quốc','Hà Nội', 'Nha Trang', 'Đà Nẵng', 'Huế', 'Cần Thơ'];

export default function HomestaySearchForm({
  onSearch,
  className = '',
  destinationInputId = 'destination-input',
}) {
  const [search, setSearch] = useState(() => getStoredSearchState());
  const [showDropdown, setShowDropdown] = useState(null); // 'destination' hoặc 'date'
const [searchHistory, setSearchHistory] = useState(() => getStoredSearchHistory());  
  // Quản lý lịch custom hiển thị 2 tháng liền kề
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);

  const dropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    loadAccountSearchHistory()
      .then((history) => {
        if (isMounted) setSearchHistory(history);
      })
      .catch(() => {
        if (isMounted) setSearchHistory(getStoredSearchHistory());
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleSearchStateChange = (event) => {
      setSearch(event.detail || getStoredSearchState());
    };

    window.addEventListener(SEARCH_STATE_EVENT, handleSearchStateChange);
    window.addEventListener('storage', handleSearchStateChange);

    return () => {
      window.removeEventListener(SEARCH_STATE_EVENT, handleSearchStateChange);
      window.removeEventListener('storage', handleSearchStateChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (showDropdown === 'date') {
        if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
          setShowDropdown(null);
          setHoverDate(null);
        }
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
        setHoverDate(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const updateSearch = (updater) => {
    setSearch((current) => {
      const nextSearch = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return saveSearchState(nextSearch);
    });
  };

  const updateField = (field, value) => {
    updateSearch((current) => ({ ...current, [field]: value }));
  };

  const removeHistoryItem = (e, item) => {
    e.stopPropagation();
    const nextHistory = removeDestinationFromHistory(item);
    setSearchHistory(nextHistory);
    removeDestinationFromAccountHistory(item)
      .then(setSearchHistory)
      .catch(() => {});
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const savedSearch = saveSearchState(search);

    if (savedSearch.destination?.trim()) {
      const nextHistory = saveDestinationToHistory(savedSearch.destination);
      setSearchHistory(nextHistory);
      saveDestinationToAccountHistory(savedSearch.destination)
        .then(setSearchHistory)
        .catch(() => {});
    }

    onSearch?.(savedSearch);
  };

  // --- LOGIC SINH NGÀY CHO BẢNG LỊCH CUSTOM ---
  const toDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateValue = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = parseDateValue(dateStr);
    return `Ngày ${date.getDate()} thg ${date.getMonth() + 1}`;
  };

  const todayDateString = toDateValue(new Date());

  const handleSelectDay = (date) => {
    const dateString = toDateValue(date);
    if (dateString < todayDateString) return;

    if (!search.checkIn || (search.checkIn && search.checkOut)) {
      updateSearch(curr => ({ ...curr, checkIn: dateString, checkOut: '' }));
      setHoverDate(null);
      return;
    }

    if (dateString >= search.checkIn) {
      updateSearch(curr => ({ ...curr, checkOut: dateString }));
      setHoverDate(null);
      return;
    }

    updateSearch(curr => ({ ...curr, checkIn: dateString, checkOut: '' }));
    setHoverDate(null);
  };

  const changeMonth = (offset) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const renderMonthCalendar = (year, month) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Ô trống đầu tháng
    for (let i = 0; i < (firstDayIndex === 0 ? 6 : firstDayIndex - 1); i++) {
      days.push(<div key={`empty-${i}`} className="h-9"></div>);
    }
    // Các ô ngày thực tế
    for (let day = 1; day <= totalDays; day++) {
      const thisDate = new Date(year, month, day);
      const thisDateStr = toDateValue(thisDate);
      const isPastDate = thisDateStr < todayDateString;
      const hoverRangeEnd = search.checkIn && !search.checkOut && hoverDate && hoverDate >= search.checkIn ? hoverDate : null;
      
      const isCheckIn = search.checkIn === thisDateStr;
      const isCheckOut = search.checkOut === thisDateStr;
      const isInSelectedRange = search.checkIn && search.checkOut && 
                        thisDateStr > search.checkIn && 
                        thisDateStr < search.checkOut;
      const isInHoverRange = hoverRangeEnd &&
                        thisDateStr > search.checkIn &&
                        thisDateStr <= hoverRangeEnd;

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isPastDate}
          onClick={() => handleSelectDay(thisDate)}
          onMouseEnter={() => !isPastDate && setHoverDate(thisDateStr)}
          className={`h-9 w-full rounded-lg text-xs font-bold transition-all relative flex items-center justify-center border-none
            ${isPastDate ? 'cursor-not-allowed bg-gray-100 text-gray-300 line-through opacity-70' : 'cursor-pointer'}
            ${!isPastDate && (isCheckIn || isCheckOut) ? 'bg-[#2C3E2B] text-white shadow-sm z-10' : ''}
            ${!isPastDate && isInSelectedRange ? 'bg-[#2C3E2B]/10 text-[#2C3E2B] rounded-none' : ''}
            ${!isPastDate && isInHoverRange && !isCheckIn && !isCheckOut ? 'bg-gray-200 text-gray-700 rounded-none' : ''}
            ${!isPastDate && !isCheckIn && !isCheckOut && !isInSelectedRange && !isInHoverRange ? 'bg-transparent text-gray-700 hover:bg-gray-100' : ''}`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  const year1 = currentDate.getFullYear();
  const month1 = currentDate.getMonth();
  const date2 = new Date(year1, month1 + 1, 1);
  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();

  return (
    <div className="w-full max-w-5xl mx-auto font-sans relative" ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className={`bg-white p-2.5 rounded-2xl md:rounded-full border-4 border-[#d28e73] shadow-xl flex flex-col md:flex-row items-center gap-2 text-gray-800 ${className}`}
      >
        <div className="w-full grid grid-cols-1 sm:grid-cols-5 gap-1 flex-grow">
          
          {/* CỘT 1: ĐIỂM ĐẾN */}
          <div className="sm:col-span-2 relative flex items-center bg-gray-400/10 hover:bg-gray-50 rounded-xl md:rounded-l-full md:rounded-r-3xl px-3 py-2 transition">
            <HiMapPin className="text-black shrink-0 mr-2.5" size={18} />
            <div className="flex-1 text-left">
              <label htmlFor={destinationInputId} className="block text-[9px] font-black uppercase tracking-wider text-black">Bạn muốn đến đâu?</label>
              <input
                id={destinationInputId}
                type="text" required autoComplete="off" value={search.destination}
                onFocus={() => setShowDropdown('destination')}
                onChange={(event) => updateField('destination', event.target.value)}
                placeholder="Tìm thành phố, khu vực, homestay..."
                className="w-full bg-transparent text-gray-800 text-xs font-bold focus:outline-none border-0 p-0 mt-0.5 placeholder-black/40"
              />
            </div>
          </div>

          {/* CỘT 2: NGÀY NHẬN PHÒNG */}
          <div 
            onClick={() => setShowDropdown('date')}
            className="sm:col-span-1 flex items-center bg-gray-400/10 hover:bg-gray-50 rounded-xl px-3 py-2 transition cursor-pointer"
          >
            <HiCalendarDays className="text-black shrink-0 mr-2.5" size={18} />
            <div className="flex-1 text-left">
              <label className="block text-[9px] font-black uppercase tracking-wider text-black">Nhận phòng</label>
              <div className="text-xs font-bold text-gray-800 mt-0.5 min-h-[16px]">
                {search.checkIn ? formatDisplayDate(search.checkIn) : <span className="text-black/40 font-normal">Thêm ngày</span>}
              </div>
            </div>
          </div>

          {/* CỘT 3: NGÀY TRẢ PHÒNG */}
          <div 
            onClick={() => setShowDropdown('date')}
            className="sm:col-span-1 flex items-center bg-gray-400/10 hover:bg-gray-50 rounded-xl px-3 py-2 transition cursor-pointer"
          >
            <HiCalendarDays className="text-black shrink-0 mr-2.5" size={18} />
            <div className="flex-1 text-left">
              <label className="block text-[9px] font-black uppercase tracking-wider text-black">Trả phòng</label>
              <div className="text-xs font-bold text-gray-800 mt-0.5 min-h-[16px]">
                {search.checkOut ? formatDisplayDate(search.checkOut) : <span className="text-black/40 font-normal">Thêm ngày</span>}
              </div>
            </div>
          </div>

          {/* CỘT 4: SỐ KHÁCH */}
          <div className="sm:col-span-1 flex items-center bg-gray-400/10 hover:bg-gray-50 rounded-xl md:rounded-r-full px-3 py-2 transition">
            <HiUsers className="text-black shrink-0 mr-2.5" size={18} />
            <div className="flex-1 text-left">
              <label className="block text-[9px] font-black uppercase tracking-wider text-black">Số khách</label>
              <input
                type="number" min="1" required value={search.guests}
                onChange={(event) => updateField('guests', event.target.value)}
                placeholder="Số khách"
                className="w-full bg-transparent text-gray-800 text-xs font-bold focus:outline-none border-0 p-0 mt-0.5 placeholder-black/40"
              />
            </div>
          </div>

        </div>

        {/* NÚT TÌM KIẾM */}
        <button
          type="submit"
          className="w-full md:w-auto bg-[#6c483a] hover:bg-[#533429] text-white font-bold text-xs uppercase tracking-wider px-8 h-12 rounded-xl md:rounded-full shadow-md transition-all active:scale-95 border-none cursor-pointer shrink-0 flex items-center justify-center gap-2"
        >
          <HiMagnifyingGlass size={16} />
          <span>Tìm kiếm</span>
        </button>
      </form>


      {/* ── DROPDOWN 1: GỢI Ý ĐIỂM ĐẾN & LỊCH SỬ (Giữ nguyên phom của image_2a72fb.png) ── */}
      {showDropdown === 'destination' && (
        <div className="absolute left-0 mt-2 w-full md:w-[48%] bg-white rounded-[24px] shadow-xl border border-gray-100 z-50 overflow-hidden py-5 animate-fade-in text-left">
          <div className="mb-4">
            <div className="px-5 flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <HiClock size={12} /> Lịch sử tìm kiếm
              </p>

              {searchHistory.length > 0 && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    const nextHistory = clearSearchHistory();
                    setSearchHistory(nextHistory);
                    clearAccountSearchHistory()
                      .then(setSearchHistory)
                      .catch(() => {});
                  }}
                  className="text-[10px] font-bold text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="mt-1">
              {searchHistory.length === 0 ? (
                <div className="px-5 py-3 text-xs font-semibold text-gray-400">
                  Chưa có lịch sử tìm kiếm. Hãy nhập nơi đến và bấm tìm kiếm.
                </div>
              ) : (
                searchHistory.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      updateField('destination', item);
                      setShowDropdown('date');
                    }}
                    className="px-5 py-2.5 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center justify-between cursor-pointer group transition"
                  >
                    <span className="flex items-center gap-2 text-gray-500 group-hover:text-[#2C3E2B]">
                      <span>⏳</span> {item}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => removeHistoryItem(e, item)}
                      className="text-gray-300 hover:text-red-500 bg-transparent border-none p-1 rounded cursor-pointer"
                    >
                      <HiXMark size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <HiMapPin size={12} /> Địa điểm nổi bật có gu
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2 px-5">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest} type="button" onClick={() => { updateField('destination', dest); setShowDropdown('date'); }}
                  className="px-4 py-2.5 bg-gray-50 hover:bg-[#2C3E2B]/5 border-none rounded-xl text-left text-xs font-bold text-gray-700 transition cursor-pointer flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {dest}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DROPDOWN 2: BẢNG LỊCH CHỌN NGÀY CUSTOM ĐỒNG BỘ HOÀN HẢO ── */}
      {showDropdown === 'date' && (
        <div
          ref={dateDropdownRef}
          className="absolute right-0 md:right-[15%] mt-2 w-full md:w-[620px] bg-white rounded-[24px] shadow-xl border border-gray-100 z-50 overflow-hidden p-5 animate-fade-in text-left"
          onMouseLeave={() => setHoverDate(null)}
        >
          
          {/* Header điều hướng tháng */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <HiCalendarDays size={12} /> Chọn thời gian lưu trú
            </p>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button type="button" onClick={() => changeMonth(-1)} className="w-7 h-7 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 cursor-pointer"><HiChevronLeft size={14}/></button>
              <button type="button" onClick={() => changeMonth(1)} className="w-7 h-7 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 cursor-pointer"><HiChevronRight size={14}/></button>
            </div>
          </div>

          {/* Bố cục lịch 2 tháng song song đúng chuẩn Booking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            
            {/* THÁNG THỨ NHẤT */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-800 text-center uppercase tracking-wide">
                Tháng {month1 + 1} / {year1}
              </h4>
              <div className="grid grid-cols-7 gap-y-1 text-center font-bold text-[10px] text-gray-400 uppercase">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d} className="py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {renderMonthCalendar(year1, month1)}
              </div>
            </div>

            {/* THÁNG THỨ HAI */}
            <div className="space-y-3 md:pl-8">
              <h4 className="text-xs font-black text-gray-800 text-center uppercase tracking-wide">
                Tháng {month2 + 1} / {year2}
              </h4>
              <div className="grid grid-cols-7 gap-y-1 text-center font-bold text-[10px] text-gray-400 uppercase">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d} className="py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {renderMonthCalendar(year2, month2)}
              </div>
            </div>

          </div>

          {/* Ch�n b?ng hi?n th? th�ng tin t�m t?t */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
            <div className="text-xs font-medium text-gray-500">
              {search.checkIn && (
                <span>Nhận: <b className="text-gray-800 font-bold">{formatDisplayDate(search.checkIn)}</b></span>
              )}
              {search.checkOut && (
                <span className="ml-3">Trả: <b className="text-gray-800 font-bold">{formatDisplayDate(search.checkOut)}</b></span>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => { updateSearch(curr => ({ ...curr, checkIn: '', checkOut: '' })); setHoverDate(null); }}
              className="text-[10px] font-bold text-red-500 hover:underline bg-transparent border-none cursor-pointer"
            >
              Xóa ngày chọn
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
