export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
  itemName = "mục",
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 select-none">
      <p>
        Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} trong tổng số {totalItems} {itemName}
      </p>

      <div className="flex items-center space-x-1">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 disabled:opacity-40 transition cursor-pointer hover:bg-gray-50"
          type="button"
        >
          ‹ Trước
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-8 h-8 rounded-lg border transition cursor-pointer ${
              currentPage === i + 1
                ? 'bg-[#2C3E2B] text-white border-[#2C3E2B] shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            type="button"
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 disabled:opacity-40 transition cursor-pointer hover:bg-gray-50"
          type="button"
        >
          Sau ›
        </button>
      </div>
    </div>
  );
}
