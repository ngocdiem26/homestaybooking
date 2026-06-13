export default function AccountInfo({ isEditing, setIsEditing, tempInfo, setTempInfo, handleSaveInfo }) {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
        <div>
          <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Hồ sơ cá nhân</h2>
          <p className="text-xs text-gray-400 font-medium">Quản lý và cập nhật thông tin liên hệ của bạn</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-xs bg-[#6E473B] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#57362c] transition shadow-sm cursor-pointer">✏️ Chỉnh sửa</button>
        )}
      </div>
      <form onSubmit={handleSaveInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm font-bold text-gray-600">
        <div className="space-y-1"><label>Họ và tên</label><input type="text" disabled={!isEditing} value={tempInfo.name} onChange={(e) => setTempInfo({...tempInfo, name: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none focus:border-[#2C3E2B] disabled:opacity-75" /></div>
        <div className="space-y-1"><label>Địa chỉ Email</label><input type="email" disabled={!isEditing} value={tempInfo.email} onChange={(e) => setTempInfo({...tempInfo, email: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none focus:border-[#2C3E2B] disabled:opacity-75" /></div>
        <div className="space-y-1"><label>Số điện thoại</label><input type="tel" disabled={!isEditing} value={tempInfo.phone} onChange={(e) => setTempInfo({...tempInfo, phone: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none focus:border-[#2C3E2B] disabled:opacity-75" /></div>
        <div className="space-y-1"><label>Ngày sinh</label><input type="date" disabled={!isEditing} value={tempInfo.dob} onChange={(e) => setTempInfo({...tempInfo, dob: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-500 focus:outline-none focus:border-[#2C3E2B] disabled:opacity-75" /></div>
        <div className="space-y-1"><label>Giới tính</label><select disabled={!isEditing} value={tempInfo.gender} onChange={(e) => setTempInfo({...tempInfo, gender: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none disabled:opacity-75"><option value="male">Nam</option><option value="female">Nữ</option></select></div>
        <div className="space-y-1 sm:col-span-2"><label>Địa chỉ thường trú</label><input type="text" disabled={!isEditing} value={tempInfo.address} onChange={(e) => setTempInfo({...tempInfo, address: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none focus:border-[#2C3E2B] disabled:opacity-75" /></div>
        {isEditing && (
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-200 font-bold cursor-pointer">Hủy</button>
            <button type="submit" className="bg-[#2C3E2B] text-white px-6 py-2.5 rounded-xl hover:bg-[#1f2d20] shadow-md font-bold cursor-pointer">Lưu thông tin</button>
          </div>
        )}
      </form>
    </div>
  );
}