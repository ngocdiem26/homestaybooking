export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
  onPageChange,
  totalItems = 0,
  indexOfFirstItem,
  indexOfLastItem,
  itemsPerPage,
  itemName = 'mục',
}) {
  const pageCount = Math.max(1, Number(totalPages || 1));
  const activePage = Math.min(Math.max(1, Number(currentPage || 1)), pageCount);

  const changePage = (nextPageOrUpdater) => {
    const rawNextPage = typeof nextPageOrUpdater === 'function'
      ? nextPageOrUpdater(activePage)
      : nextPageOrUpdater;
    const nextPage = Math.min(Math.max(1, Number(rawNextPage || 1)), pageCount);

    if (onPageChange) {
      onPageChange(nextPage);
      return;
    }

    if (setCurrentPage) {
      setCurrentPage(nextPage);
    }
  };

  const firstItem = typeof indexOfFirstItem === 'number'
    ? indexOfFirstItem
    : (activePage - 1) * (itemsPerPage || 0);
  const lastItem = typeof indexOfLastItem === 'number'
    ? indexOfLastItem
    : firstItem + (itemsPerPage || 0);
  const start = totalItems > 0 ? firstItem + 1 : 0;
  const end = Math.min(lastItem, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-4 text-xs font-bold text-gray-500 select-none">
      <p>
        Hiển thị {start} - {end} trong tổng số {totalItems} {itemName}
      </p>

      <div className="flex items-center space-x-1">
        <button
          disabled={activePage === 1}
          onClick={() => changePage((prev) => Math.max(1, prev - 1))}
          className="rounded-lg border bg-white px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
        >
          ‹ Trước
        </button>

        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => changePage(i + 1)}
            className={`h-8 w-8 rounded-lg border transition ${
              activePage === i + 1
                ? 'border-[#2C3E2B] bg-[#2C3E2B] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            type="button"
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={activePage === pageCount}
          onClick={() => changePage((prev) => Math.min(pageCount, prev + 1))}
          className="rounded-lg border bg-white px-3 py-1.5 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
        >
          Sau ›
        </button>
      </div>
    </div>
  );
}
