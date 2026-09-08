import { useState } from 'react';
import ModalPortal from '../common/ModalPortal';

export default function ComplaintFormModal({ booking, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitComplaint = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 5) {
      setError('Tieu de khieu nai can it nhat 5 ky tu.');
      return;
    }
    if (cleanTitle.length > 120) {
      setError('Tieu de khieu nai khong duoc vuot qua 120 ky tu.');
      return;
    }
    if (cleanDescription.length < 20) {
      setError('Noi dung khieu nai can mo ta ro hon, toi thieu 20 ky tu.');
      return;
    }
    if (cleanDescription.length > 1000) {
      setError('Noi dung khieu nai khong duoc vuot qua 1000 ky tu.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        bookingId: booking.bookingId,
        title: cleanTitle,
        description: cleanDescription,
      });
    } catch (err) {
      setError(err?.message || 'Khong gui duoc khieu nai. Vui long thu lai.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onBackdropClick={onClose}>
      <form onSubmit={submitComplaint} onClick={(event) => event.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white text-left shadow-2xl ring-1 ring-black/10" noValidate>
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-7 py-5">
          <div>
            <p className="text-sm font-black text-[#2C1E15]">Don #{booking.id || booking.bookingCode || booking.bookingId}</p>
            <p className="mt-1 text-xs font-bold text-gray-400">{booking.homestay}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-500 transition hover:bg-gray-200">x</button>
        </header>

        <div className="space-y-5 px-7 py-6">
          <label className="block space-y-2">
            <span className="text-sm font-black text-[#2C1E15]">Tieu de hoac loai khieu nai</span>
            <input
              value={title}
              required
              minLength={5}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-[#F8F6F0] px-4 text-sm font-bold text-[#2C1E15] outline-none transition focus:border-[#2C3E2B] focus:bg-white"
              placeholder="Vi du: Homestay khong dung mo ta"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-black text-[#2C1E15]">Noi dung</span>
            <textarea
              value={description}
              required
              minLength={20}
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F8F6F0] px-4 py-3 text-sm font-semibold leading-relaxed text-[#2C1E15] outline-none transition focus:border-[#2C3E2B] focus:bg-white"
              placeholder="Mo ta ro van de ban gap phai de admin co the kiem tra va xu ly..."
            />
            <span className="block text-right text-[11px] font-semibold text-gray-400">{description.length}/1000</span>
          </label>

          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>}
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-100 bg-[#FAF8F3] px-7 py-4">
          <button type="button" onClick={onClose} className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-50">Huy</button>
          <button disabled={submitting} type="submit" className="rounded-2xl bg-[#2C3E2B] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#203020] disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Dang gui...' : 'Gui khieu nai'}
          </button>
        </footer>
      </form>
    </ModalPortal>
  );
}
