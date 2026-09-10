import { useState } from 'react';
import { X, User } from 'lucide-react';

const ClickableAvatar = ({ src, alt = 'Profile photo', size = 'h-16 w-16' }) => {
  const [open, setOpen] = useState(false);

  if (!src) {
    return (
      <div
        className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500`}
      >
        <User className="h-3/5 w-3/5" fill="currentColor" strokeWidth={0} />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${size} shrink-0 overflow-hidden rounded-full bg-gray-100 transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
        aria-label="View full photo"
      >
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X className="h-7 w-7" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ClickableAvatar;
