export default function ConfirmModal({
  title = "Confirm Action",
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  success = false,
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#FDFBF7] border-2 border-black brutal-shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div
          className={`${
            success ? "bg-[#2A9D8F]" : "bg-[#E63946]"
          } text-white border-b-2 border-black p-4 flex items-center justify-between`}
        >
          <h2 className="font-display font-black text-xl uppercase">
            {title}
          </h2>

          <button
            onClick={onCancel}
            className="bg-white text-black border-2 border-black px-3 py-1 font-black"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">

          {success ? (
            <>
              <h3 className="font-display font-black text-2xl uppercase">
                Success!
              </h3>

              <p className="mt-3 text-sm leading-relaxed">
                {message}
              </p>

              <button
                onClick={onCancel}
                className="w-full mt-6 bg-[#2A9D8F] text-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
              >
                OK
              </button>
            </>
          ) : (
            <>
              <h3 className="font-display font-black text-2xl uppercase">
                Are you sure?
              </h3>

              <p className="mt-3 text-sm leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={onCancel}
                  className="flex-1 bg-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
                >
                  Stay
                </button>

                <button
                  onClick={onConfirm}
                  className="flex-1 bg-[#E63946] text-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
                >
                  {confirmText}
                </button>

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}