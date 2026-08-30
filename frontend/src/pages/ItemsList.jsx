import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, MessageCircle } from "lucide-react";
import api, { fileUrl } from "../lib/api";
import ItemSkeleton from "../components/ItemSkeleton";

export default function ItemsList({ type }) {
  const isLost = type === "lost";
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/items", {
        params: { type, q: q || undefined },
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type, q]); // eslint-disable-line

  const accent = isLost ? "#E63946" : "#2A9D8F";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="border-b-2 border-black pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-[#E9C46A] text-black border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm brutal-press mb-3"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-none">
            {isLost ? "Lost Items" : "Found Items"}
          </h1>
          <p className="mt-3 text-lg">
            {items.length} item{items.length === 1 ? "" : "s"} on the board.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Switch Lost / Found */}
          <Link
            to={isLost ? "/items/found" : "/items/lost"}
            className="bg-[#E9C46A] border-2 border-black px-4 py-2 brutal-shadow-sm brutal-press font-bold uppercase text-xs whitespace-nowrap"
          >
            {isLost ? "See Found Items →" : "See Lost Items →"}
          </Link>

          {/* Search box */}
          <div className="flex-1 md:w-72 relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, category, location…"
              className="w-full border-2 border-black bg-white pl-9 pr-3 py-2 brutal-shadow-sm"
            />

            <Search
              size={16}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      {loading ? (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <ItemSkeleton key={index} />
    ))}
  </div>
) : items.length === 0 ? (
  <div className="bg-white border-2 border-black brutal-shadow-lg p-12 text-center">
    <h3 className="font-display font-black text-2xl uppercase">
      Nothing here yet
    </h3>

    <p className="mt-2">
      Be the first to post a {type} item.
    </p>

    <Link
      to={`/report/${type}`}
      className="inline-block mt-4 bg-black text-white border-2 border-black px-4 py-2 brutal-shadow-sm brutal-press font-bold uppercase text-sm"
    >
      Report {type} item
    </Link>
  </div>
) : (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {items.map((it) => (
      <ItemCard
        key={it.id}
        item={it}
        accent={accent}
        currentUser={user}
      />
    ))}
  </div>
)}
    </div>
  );
}

function ItemCard({ item, accent, currentUser }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const img = fileUrl(item.image_path);
  const isOwner = currentUser?.id === item.user_id;

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);

      await api.post("/messages", {
        item_id: item.id,
        message: message.trim(),
      });

      // Clear the message
      setMessage("");

      // Close the send message box
      setShowMessageBox(false);

      // Show success message
      setShowSuccessMessage(true);

      // Automatically close success message after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.detail || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* CARD */}
      <article
        onClick={() => setShowDetails(true)}
        className="bg-white border-2 border-black brutal-shadow flex flex-col cursor-pointer brutal-press"
      >
        {/* Image */}
        <div className="border-b-2 border-black bg-[#FDFBF7] aspect-[4/3] flex items-center justify-center overflow-hidden">
          {img ? (
            <img
              src={img}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="font-display font-black text-xl uppercase text-black/20">
              No Photo
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span
              className="border-2 border-black px-1.5 py-0.5 font-bold uppercase text-[9px] tracking-widest text-white"
              style={{ backgroundColor: accent }}
            >
              {item.type}
            </span>

            <span
  className="border-2 border-black px-1.5 py-0.5 font-bold uppercase text-[9px] tracking-widest truncate"
  style={{
    backgroundColor:
      item.status?.toLowerCase() === "returned"
        ? "#2A9D8F"
        : "#E9C46A",
    color:
      item.status?.toLowerCase() === "returned"
        ? "white"
        : "black",
  }}
>
  {item.status || "OPEN"}
</span>
          </div>

          <h3 className="font-display font-black text-base uppercase leading-tight truncate">
            {item.title}
          </h3>

          <p className="mt-1 text-xs leading-relaxed line-clamp-2">
            {item.description}
          </p>

          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide">
            <div>📍 {item.location}</div>
            <div className="mt-1">📅 {item.date}</div>
          </div>

          <div className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-widest text-center">
            Click for details →
          </div>
        </div>
      </article>

      {/* DETAILS MODAL */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white border-2 border-black brutal-shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="border-b-2 border-black p-4 flex items-center justify-between"
              style={{ backgroundColor: accent }}
            >
              <h2 className="font-display font-black text-xl uppercase">
                Item Details
              </h2>

              <button
                onClick={() => setShowDetails(false)}
                className="bg-white border-2 border-black px-3 py-1 font-black"
              >
                ✕
              </button>
            </div>

            {/* Large image */}
            <div className="border-b-2 border-black bg-[#FDFBF7]">
              {img ? (
                <img
                  src={img}
                  alt={item.title}
                  className="w-full max-h-80 object-contain"
                />
              ) : (
                <div className="h-48 flex items-center justify-center font-display font-black text-2xl text-black/20">
                  NO PHOTO
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span
                  className="border-2 border-black px-2 py-1 font-bold uppercase text-xs text-white"
                  style={{ backgroundColor: accent }}
                >
                  {item.type}
                </span>

                <span
  className="border-2 border-black px-2 py-1 font-bold uppercase text-xs"
  style={{
    backgroundColor:
      item.status?.toLowerCase() === "returned"
        ? "#2A9D8F"
        : "#E9C46A",
    color:
      item.status?.toLowerCase() === "returned"
        ? "white"
        : "black",
  }}
>
  {item.status || "OPEN"}
</span>
              </div>

              <h2 className="font-display font-black text-3xl uppercase">
                {item.title}
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <strong className="uppercase text-xs tracking-widest">
                    Description
                  </strong>
                  <p className="mt-1">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <strong className="uppercase text-xs tracking-widest">
                    Location
                  </strong>
                  <p className="mt-1">📍 {item.location}</p>
                </div>

                <div>
                  <strong className="uppercase text-xs tracking-widest">
                    Date
                  </strong>
                  <p className="mt-1">📅 {item.date}</p>
                </div>
              </div>

              {!isOwner && (
                <button
                  onClick={() => setShowMessageBox(true)}
                  className="w-full mt-6 bg-[#2A9D8F] text-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Send Message
                </button>
              )}

              <button
                onClick={() => setShowDetails(false)}
                className="w-full mt-6 bg-black text-white border-2 border-black px-4 py-3 brutal-shadow-sm font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessageBox && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowMessageBox(false)}
        >
          <div
            className="bg-[#FDFBF7] border-2 border-black brutal-shadow-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="bg-[#2A9D8F] text-white border-b-2 border-black p-4 flex items-center justify-between">
              <h2 className="font-display font-black text-xl uppercase">
                Send Message
              </h2>

              <button
                onClick={() => setShowMessageBox(false)}
                className="bg-white text-black border-2 border-black px-3 py-1 font-black"
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6">
              <div className="mb-4">
                <div className="font-bold uppercase text-xs tracking-widest">
                  About
                </div>

                <div className="font-display font-black text-2xl uppercase mt-1">
                  {item.title}
                </div>

                <p className="text-sm mt-1">
                  Your message will be sent to the person who posted this item.
                </p>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Write your message..."
                className="w-full border-2 border-black bg-white px-3 py-3 resize-none"
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowMessageBox(false)}
                  className="flex-1 bg-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
                >
                  Cancel
                </button>

                <button
                  onClick={sendMessage}
                  disabled={sending || !message.trim()}
                  className="flex-1 bg-[#2A9D8F] text-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border-2 border-black brutal-shadow-lg w-full max-w-md">
            <div className="bg-[#2A9D8F] text-white border-b-2 border-black p-4">
              <h2 className="font-display font-black text-xl uppercase">
                Success
              </h2>
            </div>

            <div className="p-8 text-center">
              <p className="font-display font-black text-2xl uppercase">
                Your message sent successfully
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
