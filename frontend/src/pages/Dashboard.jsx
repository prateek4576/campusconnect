import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ItemSkeleton from "../components/ItemSkeleton";

import {
  PackageX,
  PackageCheck,
  Search,
  ArchiveRestore,
  Bell,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import api, { fileUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const actions = [
  {
    to: "/report/lost",
    label: "Report Lost Item",
    desc: "Lost something? Post it now.",
    color: "#E63946",
    icon: PackageX,
  },
  {
    to: "/report/found",
    label: "Report Found Item",
    desc: "Return it to its owner.",
    color: "#2A9D8F",
    icon: PackageCheck,
  },
  {
    to: "/items/lost",
    label: "See Lost Items",
    desc: "Browse things people lost.",
    color: "#0B2545",
    icon: Search,
  },
  {
    to: "/items/found",
    label: "See Found Items",
    desc: "Browse things people found.",
    color: "#E9C46A",
    icon: ArchiveRestore,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const [feedback, setFeedback] = useState({
    type: "Feedback",
    message: "",
  });

  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    reunions: 0,
    users: 0,
  });

  const [recentItems, setRecentItems] = useState([]);
  const [returnedItems, setReturnedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    // Get unread message count
    const loadUnreadCount = async () => {
      try {
        const { data } = await api.get("/messages/unread-count");
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error("Failed to load unread message count", error);
      }
    };

    loadUnreadCount();

    // Check for new messages every 3 seconds
    const interval = setInterval(loadUnreadCount, 3000);

    // Get dashboard statistics
    api
      .get("/items/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});

    // Get all items
    api
      .get("/items")
      .then((r) => {
        const items = r.data || [];

        const sortedItems = [...items].sort((a, b) => {
          const dateA = new Date(a.created_at || a.date || 0);
          const dateB = new Date(b.created_at || b.date || 0);

          return dateB - dateA;
        });

        setRecentItems(sortedItems.slice(0, 4));

        const returned = sortedItems
          .filter((item) => item.status?.toLowerCase() === "returned")
          .slice(0, 3);

        setReturnedItems(returned);
      })
      .catch((error) => {
        console.error("Failed to load items", error);
      })
      .finally(() => {
        setLoadingItems(false);
      });
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.message.trim()) {
      alert("Please enter your message.");
      return;
    }

    try {
      setSendingFeedback(true);

      await api.post("/contact", {
        name: user?.name || "CampusConnect User",
        email: user?.email || "",
        type: feedback.type,
        message: feedback.message,
      });

      setFeedback({
        type: "Feedback",
        message: "",
      });

      setFeedbackSent(true);

      setTimeout(() => {
        setFeedbackSent(false);
      }, 4000);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Could not send your message. Please try again.",
      );
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* ================= HEADER ================= */}

      <div className="border-b-2 border-black pb-6 mb-8">
        <div className="inline-block bg-[#E9C46A] border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3">
          Dashboard
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-4xl md:text-6xl uppercase leading-none">
              Hey, {user?.name || "friend"}.
            </h1>

            <p className="mt-4 text-lg max-w-2xl">
              Report an item or browse the campus board. Every post helps
              someone find what they thought was gone for good.
            </p>
          </div>

          <Link
            to="/messages"
            className="inline-flex items-center justify-center gap-2 bg-[#E9C46A] text-black border-2 border-black px-5 py-3 brutal-shadow-sm brutal-press font-bold uppercase text-sm md:mb-1"
          >
            <span> My Messages </span>

            {unreadCount > 0 && (
              <span className="bg-[#E63946] text-white border-2 border-black min-w-[28px] h-7 px-2 flex items-center justify-center font-black text-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ================= STATISTICS ================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Items Lost" value={stats.lost} accent="#E63946" />

        <StatCard label="Items Found" value={stats.found} accent="#2A9D8F" />

        <StatCard label="Returned" value={stats.reunions} accent="#0B2545" />

        <StatCard label="Community" value={stats.users} accent="#E9C46A" />
      </div>

      {/* ================= ACTION CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group bg-white border-2 border-black brutal-shadow-lg brutal-press p-8 flex flex-col justify-between min-h-[200px] relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div
                className="w-14 h-14 border-2 border-black flex items-center justify-center brutal-shadow-sm"
                style={{ backgroundColor: a.color }}
              >
                <a.icon
                  size={28}
                  strokeWidth={2.5}
                  color={a.color === "#E9C46A" ? "#000" : "#fff"}
                />
              </div>

              <span className="font-display font-black text-xs uppercase tracking-widest">
                →
              </span>
            </div>

            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl uppercase leading-tight">
                {a.label}
              </h2>

              <p className="mt-2 text-base">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ================================================= */}
      {/*              RECENTLY POSTED ITEMS                */}
      {/* ================================================= */}

      <SectionSpace />

      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-block bg-[#2A9D8F] text-white border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-2">
              Latest
            </div>

            <h2 className="font-display font-black text-3xl uppercase">
              Recently Posted
            </h2>
          </div>

          <Link
            to="/items/lost"
            className="bg-black text-white border-2 border-black px-4 py-2 brutal-shadow-sm brutal-press font-bold uppercase text-xs"
          >
            View Items →
          </Link>
        </div>

        {loadingItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ItemSkeleton />
            <ItemSkeleton />
            <ItemSkeleton />
            <ItemSkeleton />
          </div>
        ) : recentItems.length === 0 ? (
          <div className="bg-white border-2 border-black brutal-shadow-lg p-8 text-center">
            <p className="font-bold uppercase">No posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                to={item.type === "lost" ? "/items/lost" : "/items/found"}
                className="bg-white border-2 border-black brutal-shadow brutal-press overflow-hidden"
              >
                {/* Image */}
                <div className="h-40 border-b-2 border-black bg-[#FDFBF7] flex items-center justify-center overflow-hidden">
                  {item.image_path ? (
                    <img
                      src={fileUrl(item.image_path)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display font-black text-black/20 uppercase">
                      No Photo
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="border-2 border-black px-2 py-0.5 text-white font-bold uppercase text-[10px]"
                      style={{
                        backgroundColor:
                          item.type === "lost" ? "#E63946" : "#2A9D8F",
                      }}
                    >
                      {item.type}
                    </span> 

                    <span className="font-bold uppercase text-[10px]">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg uppercase truncate">
                    {item.title}
                  </h3>

                  <p className="text-xs mt-1 uppercase font-semibold truncate">
                    {item.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ================================================= */}
      {/*                   SAFETY TIP                       */}
      {/* ================================================= */}

      <SectionDivider />

      <section className="mt-6">
        <div className="bg-[#0B2545] text-white border-2 border-black brutal-shadow-lg p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#E9C46A] text-black border-2 border-black brutal-shadow-sm flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={26} />
            </div>

            <div>
              <div className="font-bold uppercase text-xs tracking-widest text-[#E9C46A] mb-2">
                Safety Tip
              </div>

              <h2 className="font-display font-black text-2xl md:text-3xl uppercase">
                Protect your personal information
              </h2>

              <p className="mt-2 text-white/90 max-w-3xl">
                Never post passwords, bank details, private documents, or other
                sensitive information in an item description.
              </p>

              <p className="mt-2 font-bold">
                Meet in a safe public place when returning an item.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/*                HOW IT WORKS                        */}
      {/* ================================================= */}

      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="bg-[#0B2545] text-white border-2 border-black brutal-shadow-lg p-8">
          <div className="inline-block bg-[#E9C46A] text-black border-2 border-black px-2 py-0.5 font-bold uppercase text-xs mb-3">
            Tip
          </div>

          <h3 className="font-display font-black text-2xl uppercase leading-tight">
            Photos double return rates
          </h3>

          <p className="mt-2 text-white/90">
            Always attach a clear photo — it&apos;s the fastest way for someone
            to spot their item at a glance.
          </p>
        </div>

        <div className="bg-white border-2 border-black brutal-shadow-lg p-8">
          <div className="inline-block bg-[#E63946] text-white border-2 border-black px-2 py-0.5 font-bold uppercase text-xs mb-3">
            How it works
          </div>

          <ol className="mt-2 space-y-2 list-decimal list-inside font-medium">
            <li>Report the item with a photo &amp; location.</li>

            <li>Browse the board or wait for a match.</li>

            <li>Send a private message to the item owner.</li>
          </ol>
        </div>
      </div>

      {/* ================================================= */}
      {/*              FEEDBACK / REPORT BUG                */}
      {/* ================================================= */}

      <SectionDivider />

      <section className="mt-12">
        <div className="bg-[#E9C46A] border-2 border-black brutal-shadow-lg p-6 md:p-8">
          <div className="mb-6">
            <div className="inline-block bg-black text-white border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3">
              Feedback
            </div>

            <h2 className="font-display font-black text-3xl md:text-4xl uppercase">
              Help us improve CampusConnect
            </h2>

            <p className="mt-2 text-base max-w-2xl">
              Found a bug, have a suggestion, or just want to share some
              feedback? Send us a message.
            </p>
          </div>

          <form
            onSubmit={handleFeedbackSubmit}
            className="bg-white border-2 border-black p-5 md:p-6"
          >
            {/* User information */}

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-bold uppercase text-xs mb-2">
                  Name
                </label>

                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="w-full border-2 border-black px-4 py-3 bg-gray-100 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-xs mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full border-2 border-black px-4 py-3 bg-gray-100 font-semibold"
                />
              </div>
            </div>

            {/* Message type */}

            <div className="mb-4">
              <label className="block font-bold uppercase text-xs mb-2">
                What would you like to report?
              </label>

              <select
                value={feedback.type}
                onChange={(e) =>
                  setFeedback({
                    ...feedback,
                    type: e.target.value,
                  })
                }
                className="w-full border-2 border-black px-4 py-3 bg-white font-semibold"
              >
                <option value="Feedback">General Feedback</option>

                <option value="Bug Report">Report a Bug</option>

                <option value="Suggestion">Suggestion</option>

                <option value="Problem">Report a Problem</option>

                <option value="Other">Other</option>
              </select>
            </div>

            {/* Message */}

            <div className="mb-5">
              <label className="block font-bold uppercase text-xs mb-2">
                Your Message
              </label>

              <textarea
                value={feedback.message}
                onChange={(e) =>
                  setFeedback({
                    ...feedback,
                    message: e.target.value,
                  })
                }
                placeholder="Tell us what happened or what you would like us to improve..."
                rows={6}
                required
                className="w-full border-2 border-black px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={sendingFeedback}
              className="bg-black text-white border-2 border-black px-6 py-3 brutal-shadow-sm brutal-press font-bold uppercase disabled:opacity-50"
            >
              {sendingFeedback ? "Sending..." : "Send Message →"}
            </button>

            {/* Success message */}

            {feedbackSent && (
              <div className="mt-4 bg-[#2A9D8F] text-white border-2 border-black p-4 font-bold uppercase">
                Message sent successfully! Thank you for your feedback.
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

/* ================================================= */
/*                  STAT CARD                         */
/* ================================================= */

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white border-2 border-black brutal-shadow p-4">
      <div
        className="w-3 h-3 border-2 border-black mb-2"
        style={{ backgroundColor: accent }}
      />

      <div className="font-display font-black text-3xl md:text-4xl">
        {value}
      </div>

      <div className="font-bold uppercase text-xs tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t-2 border-black my-12"></div>;
}

function SectionSpace() {
  return <div className="h-10"></div>;
}
