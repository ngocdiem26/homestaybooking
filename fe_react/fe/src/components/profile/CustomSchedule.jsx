export default function CustomSchedule({ scheduleName, setScheduleName, scheduleItems, handleItemChange, handleAddField, handleCreateSchedule, mySchedules }) {
  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Tự thiết kế lịch trình cá nhân</h2>
        <p className="text-xs text-gray-400 font-medium">Lên ý tưởng thời gian, địa điểm cho chuyến đi tự túc sắp tới của bạn</p>
      </div>

      <form onSubmit={handleCreateSchedule} className="bg-[#F4F1EA]/40 p-5 rounded-2xl border border-[#6E473B]/10 space-y-4 text-sm font-bold text-gray-600">
        <div className="space-y-1">
          <label>1. Tên hành trình chuyến đi *</label>
          <input type="text" required placeholder="Ví dụ: Cần Thơ gạo trắng nước trong 3 ngày 2 đêm" value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base focus:outline-none" />
        </div>
        <div className="space-y-3">
          <label>2. Các mốc thời gian & Điểm đến cụ thể:</label>
          {/* LUÔN AN TOÀN: Thêm dấu chấm hỏi để tránh crash trang trắng */}
          {scheduleItems?.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <input type="time" required value={item.time} onChange={(e) => handleItemChange(idx, 'time', e.target.value)} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-2 py-2 rounded-lg text-base focus:outline-none" />
              <input type="text" required placeholder="📍 Đi đâu?" value={item.location} onChange={(e) => handleItemChange(idx, 'location', e.target.value)} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-3 py-2 rounded-lg text-sm sm:col-span-2 focus:outline-none" />
              <input type="text" placeholder="Ghi chú..." value={item.note} onChange={(e) => handleItemChange(idx, 'note', e.target.value)} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleAddField} className="bg-white border border-[#2C3E2B] text-[#2C3E2B] px-4 py-2 rounded-xl hover:bg-gray-50 font-bold cursor-pointer">➕ Thêm điểm đến</button>
          <button type="submit" className="bg-[#2C3E2B] text-white px-6 py-2.5 rounded-xl hover:bg-[#1f2d20] flex-grow font-bold cursor-pointer">🚀 Lưu lịch trình</button>
        </div>
      </form>

      <div className="space-y-6">
        <h4 className="font-classic font-bold text-sm text-[#2C1E15] border-l-4 border-[#6E473B] pl-2">Sổ tay lịch trình của bạn</h4>
        {mySchedules?.map(sch => (
          <div key={sch.id} className="bg-[#F4F1EA]/30 p-5 rounded-2xl border border-gray-200 space-y-4">
            <h5 className="font-bold text-xs text-[#6E473B] uppercase tracking-wider">📋 {sch.name}</h5>
            <div className="border-l-2 border-[#2C3E2B]/20 ml-3 space-y-4 text-sm font-medium">
              {sch.items?.map((item, i) => (
                <div key={i} className="relative pl-5">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-white border border-[#2C3E2B]"></div>
                  <p className="font-mono text-[11px] font-bold text-[#2C3E2B] bg-[#2C3E2B]/5 px-1.5 py-0.5 rounded w-fit inline-block mr-2">{item.time}</p>
                  <span className="font-bold text-gray-800">{item.location}</span>
                  {item.note && <p className="text-[11px] text-gray-400 italic mt-0.5">↳ Ghi chú: {item.note}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}