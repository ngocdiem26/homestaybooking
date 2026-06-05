
export default function BookingManager({ bookings, bookingFilter, setBookingFilter, setSelectedBooking, handleCancelBooking }) {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Quản lý đơn đặt phòng</h2>
        <p className="text-xs text-gray-400 font-medium">Xem lịch sử, quản lý các chuyến đi và xử lý hủy đơn đặt chỗ của bạn</p>
      </div>

      <div className="flex bg-[#23150d]/5 p-1 rounded-xl text-xs font-bold border w-fit overflow-x-auto">
        {['all', 'confirmed', 'completed', 'cancelled'].map(filter => (
          <button 
            key={filter}
            onClick={() => setBookingFilter(filter)} 
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${bookingFilter === filter ? 'bg-[#2C3E2B] text-white shadow' : 'text-gray-500'}`}
          >
            {filter === 'all' ? 'Tất cả' : filter === 'confirmed' ? 'Sắp đi' : filter === 'completed' ? 'Lịch sử đơn' : 'Đơn đã hủy'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {bookings?.filter(b => bookingFilter === 'all' || b.status === bookingFilter).map(book => (
          <div key={book.id} className="border border-gray-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:shadow-md transition">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{book.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${book.status === 'confirmed' ? 'bg-green-100 text-green-700' : book.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {book.status === 'confirmed' ? 'Sắp diễn ra' : book.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-[#2C1E15]">{book.homestay}</h4>
              <p className="text-xs text-gray-500 font-semibold">📍 Vùng miền: {book.location} | 🗓️ Thời gian: {book.checkIn} đến {book.checkOut}</p>
            </div>
            <div className="flex items-center gap-2 sm:self-center">
              <button onClick={() => setSelectedBooking(book)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer">Xem chi tiết</button>
              {book.status === 'confirmed' && (
                <button onClick={() => handleCancelBooking(book.id)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer">Hủy đặt phòng</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}