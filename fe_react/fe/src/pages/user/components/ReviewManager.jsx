export default function ReviewManager({ reviews }) {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Đánh giá phản hồi của tôi</h2>
        <p className="text-xs text-gray-400 font-medium">Lưu trữ các nhận xét, đóng góp ý kiến bạn đã gửi lại cho các khu nghỉ dưỡng</p>
      </div>
      <div className="space-y-4">
        {reviews?.map(rev => (
          <div key={rev.id} className="p-5 border border-gray-200/80 rounded-2xl bg-white space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-[#2C1E15]">{rev.homestay}</h4>
              <span className="text-xs text-gray-400 font-medium">{rev.date}</span>
            </div>
            <div className="text-amber-500 text-xs font-serif">{"★".repeat(rev.rating)}</div>
            <p className="text-xs text-gray-600 leading-relaxed font-semibold font-serif italic bg-gray-50 p-3 rounded-xl border border-gray-100">"{rev.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}