import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

import {
  Mail,
  Phone,
  Calendar,
  User,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";

import api, { fileUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function MyAccount() {
  const { user, refresh } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [editingProfile, setEditingProfile] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editingItem, setEditingItem] = useState(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/items/mine")
      .then((r) => setMyItems(r.data))
      .catch(() => {});
  }, []);

  const startProfileEdit = () => {
    setProfileForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });

    setEditingProfile(true);
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      await api.put("/auth/profile", profileForm);

      await refresh();

      setEditingProfile(false);

      setShowSuccessModal(true);
    } catch (e) {
      alert(e.response?.data?.detail || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const startItemEdit = (item) => {
    setEditingItem({ ...item });
  };

  const saveItem = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);

      const { data } = await api.put(`/items/${editingItem.id}`, {
        title: editingItem.title,
        description: editingItem.description,
        category: editingItem.category,
        location: editingItem.location,
        date: editingItem.date,
        image_path: editingItem.image_path || null,
        status: editingItem.status || "open",
      });

      setMyItems((current) =>
        current.map((item) => (item.id === data.id ? data : item)),
      );

      setEditingItem(null);

    
    } catch (e) {
      alert(e.response?.data?.detail || "Could not update post");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setSaving(true);

      await api.delete(`/items/${itemToDelete.id}`);

      setMyItems((current) => current.filter((i) => i.id !== itemToDelete.id));

      setItemToDelete(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Could not delete post");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const lostCount = myItems.filter((i) => i.type === "lost").length;
const foundCount = myItems.filter((i) => i.type === "found").length;
const returnedCount = myItems.filter(
  (i) => (i.status || "").toLowerCase() === "returned"
).length;
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="border-b-2 border-black pb-6 mb-8">
        <div className="inline-block bg-[#E9C46A] border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3">
          My Account
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase leading-none">
          Your Profile
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white border-2 border-black brutal-shadow-lg p-6">
          <div className="w-24 h-24 bg-[#0B2545] text-white border-2 border-black brutal-shadow flex items-center justify-center font-display font-black text-3xl uppercase mb-4">
            {initials || <User size={32} />}
          </div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display font-black text-2xl uppercase leading-tight">
              {user.name}
            </h2>

            <button
              onClick={startProfileEdit}
              className="bg-[#E9C46A] border-2 border-black p-2 brutal-shadow-sm"
              title="Edit profile"
            >
              <Edit size={16} />
            </button>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={14} />{" "}
              <span className="font-semibold break-all">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} />{" "}
                <span className="font-semibold">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span className="font-semibold">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>

            {editingProfile && (
              <div className="mt-6 pt-6 border-t-2 border-black">
                <h3 className="font-display font-black uppercase mb-4">
                  Edit Profile
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Name
                    </label>

                    <input
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full border-2 border-black px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Email
                    </label>

                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full border-2 border-black px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Phone
                    </label>

                    <input
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full border-2 border-black px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1 bg-black text-white border-2 border-black px-3 py-2 font-bold uppercase text-xs flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => setEditingProfile(false)}
                    className="border-2 border-black px-3 py-2 font-bold uppercase text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-black brutal-shadow p-5">
              <div className="w-3 h-3 border-2 border-black bg-[#2A9D8F] mb-2" />
              <div className="font-display font-black text-4xl">
                {foundCount}
              </div>
              <div className="font-bold uppercase text-xs tracking-widest mt-1">
                Items found
              </div>
            </div>
            <div className="bg-white border-2 border-black brutal-shadow p-5">
              <div className="w-3 h-3 border-2 border-black bg-[#E63946] mb-2" />
              <div className="font-display font-black text-4xl">
                {lostCount}
              </div>
              <div className="font-bold uppercase text-xs tracking-widest mt-1">
                Items lost
              </div>
            </div>

            <div className="bg-white border-2 border-black brutal-shadow p-5">
  <div className="w-3 h-3 border-2 border-black bg-[#2A9D8F] mb-2" />

  <div className="font-display font-black text-4xl">
    {returnedCount}
  </div>

  <div className="font-bold uppercase text-xs tracking-widest mt-1">
    Items Returned
  </div>
</div>
          </div>

          <div className="bg-white border-2 border-black brutal-shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black text-2xl uppercase">
                Your posts
              </h3>
              <Link
                to="/report/lost"
                className="bg-black text-white border-2 border-black px-3 py-1.5 brutal-shadow-sm brutal-press font-bold uppercase text-xs"
              >
                New post
              </Link>
            </div>
            {myItems.length === 0 ? (
              <p className="text-sm">
                You haven&apos;t posted anything yet. Go to the dashboard to
                report a lost or found item.
              </p>
            ) : (
              <ul className="divide-y-2 divide-black">
                {[...myItems]
                  .sort((a, b) => {
                    if (a.type === "found" && b.type === "lost") return -1;
                    if (a.type === "lost" && b.type === "found") return 1;
                    return 0;
                  })
                  .map((it) => (
                    <li key={it.id} className="py-3 flex items-center gap-3">
                      <div className="w-14 h-14 border-2 border-black overflow-hidden bg-[#FDFBF7] flex items-center justify-center flex-shrink-0">
                        {it.image_path ? (
                          <img
                            src={fileUrl(it.image_path)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-display font-black text-xs">
                            N/A
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-black uppercase truncate">
                          {it.title}
                        </div>
                        <div className="text-xs uppercase tracking-widest font-semibold">
                          {it.type} · {it.category} · {it.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="border-2 border-black px-2 py-0.5 font-bold uppercase text-[10px] tracking-widest"
                          style={{
                            backgroundColor:
                              (it.status || "open").toLowerCase() === "returned"
                                ? "#2A9D8F"
                                : "#E9C46A",
                            color:
                              (it.status || "open").toLowerCase() === "returned"
                                ? "white"
                                : "black",
                          }}
                        >
                          {(it.status || "open").toUpperCase()}
                        </span>

                        <button
                          onClick={() => startItemEdit(it)}
                          className="border-2 border-black p-1.5 bg-[#E9C46A]"
                          title="Edit post"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => setItemToDelete(it)}
                          className="border-2 border-black p-1.5 bg-[#E63946] text-white"
                          title="Delete post"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white border-2 border-black brutal-shadow-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-2xl uppercase">
                Edit Post
              </h2>

              <button
                onClick={() => setEditingItem(null)}
                className="border-2 border-black p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Title
                </label>

                <input
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      title: e.target.value,
                    })
                  }
                  className="w-full border-2 border-black px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  className="w-full border-2 border-black px-3 py-2 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Category
                </label>

                <input
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category: e.target.value,
                    })
                  }
                  className="w-full border-2 border-black px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Location
                </label>

                <input
                  value={editingItem.location}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      location: e.target.value,
                    })
                  }
                  className="w-full border-2 border-black px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Date
                </label>

                <input
                  type="date"
                  value={editingItem.date}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      date: e.target.value,
                    })
                  }
                  className="w-full border-2 border-black px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  Status
                </label>

                <select
                  value={editingItem.status || "open"}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      status: e.target.value,
                    })
                  }
                  className="w-full border-2 border-black px-3 py-2 bg-white"
                >
                  <option value="open">Open</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveItem}
                disabled={saving}
                className="flex-1 bg-black text-white border-2 border-black py-3 font-bold uppercase flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() => setEditingItem(null)}
                className="px-5 border-2 border-black font-bold uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmModal
          title="Delete Post"
          message={`Are you sure you want to delete "${itemToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={handleDeleteItem}
          onCancel={() => setItemToDelete(null)}
        />
      )}

      {showSuccessModal && (
        <ConfirmModal
          title="Profile Updated"
          message="Your profile has been updated successfully."
          success={true}
          onCancel={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
}
