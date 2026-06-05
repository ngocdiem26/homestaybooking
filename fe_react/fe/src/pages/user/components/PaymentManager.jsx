export default function PaymentManager({ cards, showAddCard, setShowAddCard, newCard, setNewCard, handleAddCard }) {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
        <div>
          <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Thẻ thanh toán bảo mật</h2>
          <p className="text-xs text-gray-400 font-medium">Liên kết thẻ tín dụng giúp thực hiện đặt phòng cấp tốc</p>
        </div>
        <button onClick={() => setShowAddCard(!showAddCard)} className="text-xs bg-[#2C3E2B] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#1f2d20] transition shadow-sm cursor-pointer">{showAddCard ? "✖ Hủy" : "➕ Thêm thẻ"}</button>
      </div>

      {showAddCard && (
        <form onSubmit={handleAddCard} className="bg-[#F4F1EA]/50 p-5 rounded-2xl border border-[#6E473B]/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-bold text-gray-600 animate-fade-in">
          <div className="space-y-1"><label>Loại thẻ</label><select value={newCard.type} onChange={(e) => setNewCard({...newCard, type: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-base focus:outline-none"><option value="Visa">💳 Visa</option><option value="Mastercard">💳 Mastercard</option></select></div>
          <div className="space-y-1 sm:col-span-2"><label>Số thẻ (16 số) *</label><input type="text" required maxLength="16" placeholder="4321 0000 1111 2222" value={newCard.number} onChange={(e) => setNewCard({...newCard, number: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-base focus:outline-none" /></div>
          <div className="space-y-1 sm:col-span-2"><label>Tên chủ thẻ *</label><input type="text" required placeholder="THACH THI NGOC DIEM" value={newCard.holder} onChange={(e) => setNewCard({...newCard, holder: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-base focus:outline-none" /></div>
          <div className="space-y-1"><label>Hạn dùng *</label><input type="text" required maxLength="5" placeholder="MM/YY" value={newCard.expiry} onChange={(e) => setNewCard({...newCard, expiry: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-base text-center focus:outline-none" /></div>
          <button type="submit" className="sm:col-span-3 mt-2 bg-[#6E473B] text-white py-3 rounded-xl hover:bg-[#57362c] w-full font-bold shadow-md cursor-pointer">💾 Xác nhận liên kết thẻ</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards?.map(card => (
          <div key={card.id} className="bg-gradient-to-br from-[#202c3c] to-[#121a24] text-[#F4F1EA] p-6 rounded-2xl shadow-xl relative overflow-hidden h-44 flex flex-col justify-between border border-white/5">
            <div className="flex justify-between items-center"><span className="text-xs font-mono tracking-widest bg-white/10 px-2 py-0.5 rounded uppercase">{card.type}</span><span className="text-xl">📡</span></div>
            <div className="text-base font-mono tracking-widest my-2 text-center">{card.number}</div>
            <div className="flex justify-between items-end text-[10px] font-mono">
              <div><p className="opacity-50 text-[8px]">CARD HOLDER</p><p className="font-bold text-xs">{card.holder}</p></div>
              <div><p className="opacity-50 text-[8px]">EXPIRES</p><p className="font-bold text-xs">{card.expiry}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}