import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

import {
  Users,
  Package,
  Trash2,
  Edit,
  LogOut,
  Search,
  X,
  Save,
  MessageSquare,
} from "lucide-react";

import api, { fileUrl } from "../lib/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [activeTab, setActiveTab] = useState("users");
  const [confirmDeleteFeedback, setConfirmDeleteFeedback] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [saving, setSaving] = useState(false);

  const openEditItem = (item) => {
    setEditingItem({ ...item });

    setNewImage(null);
    setRemoveImage(false);

    if (item.image_path) {
      setImagePreview(fileUrl(item.image_path));
    } else {
      setImagePreview(null);
    }
  };

  // --------------------------------------------------
  // ADMIN TOKEN
  // --------------------------------------------------

  const getAdminHeaders = () => {
    const token = localStorage.getItem("cc_admin_token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // --------------------------------------------------
  // LOAD USERS + ITEMS
  // --------------------------------------------------

  const loadData = async () => {
    const token = localStorage.getItem("cc_admin_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [usersResponse, itemsResponse] = await Promise.all([
        api.get("/admin/users", {
          headers: getAdminHeaders(),
        }),
        api.get("/admin/items", {
          headers: getAdminHeaders(),
        }),
      ]);

      setUsers(usersResponse.data);
      setItems(itemsResponse.data);
    } catch (e) {
      console.error(e);

      if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem("cc_admin_token");
        navigate("/login");
        return;
      }

      setError(e.response?.data?.detail || "Could not load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const { data } = await api.get("/admin/feedbacks", {
        headers: getAdminHeaders(),
      });

      setFeedbacks(data);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Could not load feedbacks");
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "feedbacks") {
      loadFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logout = () => {
    localStorage.removeItem("cc_admin_token");
    navigate("/login");
  };
  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const deleteUser = async (user) => {
    try {
      await api.delete(`/admin/users/${user.id}`, {
        headers: getAdminHeaders(),
      });

      setUsers((current) => current.filter((u) => u.id !== user.id));

      setItems((current) => current.filter((item) => item.user_id !== user.id));

      setConfirmDelete(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Could not delete user");
    }
  };

  // --------------------------------------------------
  // DELETE ITEM
  // --------------------------------------------------

  const deleteItem = async (item) => {
    try {
      await api.delete(`/admin/items/${item.id}`, {
        headers: getAdminHeaders(),
      });

      setItems((current) => current.filter((i) => i.id !== item.id));

      setConfirmDelete(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Could not delete item");
    }
  };

  // --------------------------------------------------
  // UPDATE USER
  // --------------------------------------------------

  const saveUser = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);

      await api.put(
        `/admin/users/${editingUser.id}`,
        {
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
        },
        {
          headers: getAdminHeaders(),
        },
      );

      setUsers((current) =>
        current.map((user) =>
          user.id === editingUser.id ? editingUser : user,
        ),
      );

      // Update reporter information in the visible items
      setItems((current) =>
        current.map((item) =>
          item.user_id === editingUser.id
            ? {
                ...item,
                user_name: editingUser.name,
                user_email: editingUser.email,
                user_phone: editingUser.phone,
              }
            : item,
        ),
      );

      setEditingUser(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Could not update user");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // UPDATE ITEM
  // --------------------------------------------------

  const saveItem = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);

      let image_path = editingItem.image_path || null;

      // If admin clicked "Remove Image"
      if (removeImage) {
        image_path = null;
      }

      // If admin selected a new image
      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);

        const uploadResponse = await api.post("/admin/upload", formData, {
          headers: {
            ...getAdminHeaders(),
            "Content-Type": "multipart/form-data",
          },
        });

        image_path = uploadResponse.data.path;
      }

      // Update post
      await api.put(
        `/admin/items/${editingItem.id}`,
        {
          title: editingItem.title,
          description: editingItem.description,
          category: editingItem.category,
          location: editingItem.location,
          date: editingItem.date,
          type: editingItem.type,
          status: editingItem.status || "open",
          image_path: image_path,
        },
        {
          headers: getAdminHeaders(),
        },
      );

      // Update item in dashboard immediately
      setItems((current) =>
        current.map((item) =>
          item.id === editingItem.id
            ? {
                ...editingItem,
                image_path: image_path,
              }
            : item,
        ),
      );

      // Reset image states
      setNewImage(null);
      setImagePreview(null);
      setRemoveImage(false);

      setEditingItem(null);
    } catch (e) {
      console.error(e);

      alert(e.response?.data?.detail || "Could not update item");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredUsers = users.filter((user) => {
    const text = `
      ${user.name}
      ${user.email}
      ${user.phone}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const filteredItems = items.filter((item) => {
    const text = `
    ${item.title}
    ${item.description}
    ${item.category}
    ${item.location}
    ${item.user_name}
    ${item.user_email}
  `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const text = `
    ${feedback.name}
    ${feedback.email}
    ${feedback.type}
    ${feedback.message}
  `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const deleteFeedback = async (id) => {
    try {
      await api.delete(`/admin/feedbacks/${id}`, {
        headers: getAdminHeaders(),
      });

      setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== id));

      setConfirmDeleteFeedback(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Could not delete feedback");
    }
  };

  // FOUND ITEMS FIRST, THEN LOST ITEMS
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.type === "found" && b.type === "lost") return -1;
    if (a.type === "lost" && b.type === "found") return 1;
    return 0;
  });

  const lostItems = items.filter((item) => item.type === "lost");

  const foundItems = items.filter((item) => item.type === "found");

  const returnedItems = items.filter((item) => item.status === "returned");

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="font-display font-black text-3xl uppercase">
          Loading Admin Panel...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* HEADER */}

      <header className="bg-black text-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-[#E9C46A]">
              CampusConnect
            </div>

            <h1 className="font-display font-black text-2xl md:text-3xl uppercase">
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white border-2 border-white font-bold uppercase text-sm brutal-press"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-[#E63946] text-white border-2 border-black p-4 font-bold">
            {error}
          </div>
        )}

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
          <StatCard
            icon={<Users size={25} />}
            title="Members"
            value={users.length}
            accent="#E9C46A"
          />

          <StatCard
            icon={<Package size={25} />}
            title="Total Posts"
            value={items.length}
            accent="#2A9D8F"
          />

          <StatCard
            icon={<Package size={25} />}
            title="Lost Items"
            value={lostItems.length}
            accent="#E63946"
          />

          <StatCard
            icon={<Package size={25} />}
            title="Found Items"
            value={foundItems.length}
            accent="#2A9D8F"
          />

          <StatCard
            icon={<Package size={25} />}
            title="Returned"
            value={returnedItems.length}
            accent="#E63946"
          />
        </div>

        {/* TABS */}

        <div className="flex flex-wrap gap-2 mb-5">
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} />
            Users
          </TabButton>

          <TabButton
            active={activeTab === "items"}
            onClick={() => setActiveTab("items")}
          >
            <Package size={16} />
            All Posts
          </TabButton>

          <TabButton
            active={activeTab === "lost"}
            onClick={() => setActiveTab("lost")}
          >
            <Package size={16} />
            Lost Items
          </TabButton>

          <TabButton
            active={activeTab === "found"}
            onClick={() => setActiveTab("found")}
          >
            <Package size={16} />
            Found Items
          </TabButton>

          <TabButton
            active={activeTab === "returned"}
            onClick={() => setActiveTab("returned")}
          >
            <Package size={16} />
            Returned Items
          </TabButton>

          <TabButton
            active={activeTab === "feedbacks"}
            onClick={() => setActiveTab("feedbacks")}
          >
            <MessageSquare size={16} />
            Feedbacks
          </TabButton>
        </div>

        {/* SEARCH */}

        <div className="mb-6 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "users"
                ? "Search users by name, email or phone..."
                : activeTab === "feedbacks"
                  ? "Search feedbacks by name, email or message..."
                  : "Search posts..."
            }
            className="w-full border-2 border-black bg-white py-3 pl-10 pr-4 outline-none"
          />
        </div>

        {/* USERS */}

        {activeTab === "users" && (
          <UsersTable
            users={filteredUsers}
            onEdit={setEditingUser}
            onDelete={(user) =>
              setConfirmDelete({
                type: "user",
                data: user,
              })
            }
          />
        )}

        {/* ALL ITEMS */}

        {activeTab === "items" && (
          <ItemsTable
            items={sortedItems}
            onEdit={openEditItem}
            onDelete={(item) =>
              setConfirmDelete({
                type: "item",
                data: item,
              })
            }
          />
        )}

        {/* LOST */}

        {activeTab === "lost" && (
          <ItemsTable
            items={filteredItems.filter((item) => item.type === "lost")}
            onEdit={openEditItem}
            onDelete={(item) =>
              setConfirmDelete({
                type: "item",
                data: item,
              })
            }
          />
        )}

        {/* FOUND */}

        {activeTab === "found" && (
          <ItemsTable
            items={filteredItems.filter((item) => item.type === "found")}
            onEdit={openEditItem}
            onDelete={(item) =>
              setConfirmDelete({
                type: "item",
                data: item,
              })
            }
          />
        )}

        {/* RETURNED */}

        {activeTab === "returned" && (
          <ItemsTable
            items={filteredItems.filter((item) => item.status === "returned")}
            onEdit={openEditItem}
            onDelete={(item) =>
              setConfirmDelete({
                type: "item",
                data: item,
              })
            }
          />
        )}

        {/* FEEDBACKS */}

        {activeTab === "feedbacks" && (
          <FeedbacksTable
            feedbacks={filteredFeedbacks}
            onDelete={(feedback) => setConfirmDeleteFeedback(feedback)}
          />
        )}
      </main>

      {/* USER EDIT MODAL */}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          setUser={setEditingUser}
          onSave={saveUser}
          onClose={() => setEditingUser(null)}
          saving={saving}
        />
      )}

      {/* ITEM EDIT MODAL */}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          setItem={setEditingItem}
          onSave={saveItem}
          onClose={() => {
            setEditingItem(null);
            setNewImage(null);
            setImagePreview(null);
            setRemoveImage(false);
          }}
          saving={saving}
          newImage={newImage}
          setNewImage={setNewImage}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          removeImage={removeImage}
          setRemoveImage={setRemoveImage}
        />
      )}

      {/* DELETE FEEDBACK CONFIRMATION MODAL */}
      {confirmDeleteFeedback && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border-2 border-black brutal-shadow-lg w-full max-w-md">
            {/* HEADER */}
            <div className="bg-[#E63946] text-white border-b-2 border-black p-4 flex items-center justify-between">
              <h2 className="font-display font-black text-xl uppercase">
                Delete Feedback
              </h2>

              <button
                onClick={() => setConfirmDeleteFeedback(null)}
                className="bg-white text-black border-2 border-black px-3 py-1 font-black"
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6">
              <h3 className="font-display font-black text-2xl uppercase">
                Are you sure?
              </h3>

              <p className="mt-3 text-sm leading-relaxed">
                You are about to permanently delete this feedback.
              </p>

              {/* FEEDBACK PREVIEW */}
              <div className="mt-4 bg-white border-2 border-black p-4">
                <div className="font-bold">{confirmDeleteFeedback.name}</div>

                <div className="text-sm underline mt-1">
                  {confirmDeleteFeedback.email}
                </div>

                <p className="text-sm mt-3 whitespace-pre-wrap break-words">
                  {confirmDeleteFeedback.message}
                </p>
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#E63946]">
                This action cannot be undone.
              </p>

              {/* BUTTONS */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setConfirmDeleteFeedback(null)}
                  className="flex-1 bg-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
                >
                  Cancel
                </button>

                <button
                  onClick={() => deleteFeedback(confirmDeleteFeedback.id)}
                  className="flex-1 bg-[#E63946] text-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER / ITEM CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border-2 border-black brutal-shadow-lg w-full max-w-md">
            {/* HEADER */}
            <div className="bg-[#E63946] text-white border-b-2 border-black p-4 flex items-center justify-between">
              <h2 className="font-display font-black text-xl uppercase">
                Delete {confirmDelete.type === "user" ? "User" : "Post"}
              </h2>

              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-white text-black border-2 border-black px-3 py-1 font-black"
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6">
              <h3 className="font-display font-black text-2xl uppercase">
                Are you sure?
              </h3>

              <p className="mt-3 text-sm leading-relaxed">
                {confirmDelete.type === "user"
                  ? `Are you sure you want to delete ${confirmDelete.data.name}?`
                  : `Are you sure you want to delete "${confirmDelete.data.title}"?`}
              </p>

              {/* WARNING FOR USER */}
              {confirmDelete.type === "user" && (
                <div className="mt-4 bg-[#E9C46A] border-2 border-black p-4">
                  <p className="text-sm font-bold uppercase">Warning</p>

                  <p className="text-sm mt-1">
                    This will also delete all posts made by this user.
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#E63946]">
                This action cannot be undone.
              </p>

              {/* BUTTONS */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (confirmDelete.type === "user") {
                      deleteUser(confirmDelete.data);
                    } else {
                      deleteItem(confirmDelete.data);
                    }
                  }}
                  className="flex-1 bg-[#E63946] text-white border-2 border-black px-4 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <ConfirmModal
          title="Logout"
          message="Are you sure you want to logout from the Admin Dashboard?"
          confirmText="Logout"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
        />
      )}
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ icon, title, value, accent }) {
  return (
    <div className="bg-white border-2 border-black brutal-shadow-lg p-5">
      <div
        className="w-10 h-10 border-2 border-black flex items-center justify-center mb-4"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>

      <div className="font-display font-black text-4xl">{value}</div>

      <div className="font-bold uppercase tracking-widest text-xs mt-1">
        {title}
      </div>
    </div>
  );
}

// =====================================================
// TAB BUTTON
// =====================================================

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-bold uppercase text-sm brutal-press ${
        active ? "bg-[#E9C46A]" : "bg-white"
      }`}
    >
      {children}
    </button>
  );
}

// =====================================================
// USERS TABLE
// =====================================================

function UsersTable({ users, onEdit, onDelete }) {
  return (
    <div className="bg-white border-2 border-black brutal-shadow-lg overflow-x-auto">
      <div className="p-5 border-b-2 border-black bg-[#E9C46A]">
        <h2 className="font-display font-black text-2xl uppercase">
          All Members
        </h2>
      </div>

      {users.length === 0 ? (
        <EmptyState text="No users found." />
      ) : (
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="p-4 font-black uppercase text-xs">Name</th>

              <th className="p-4 font-black uppercase text-xs">Email</th>

              <th className="p-4 font-black uppercase text-xs">Phone</th>

              <th className="p-4 font-black uppercase text-xs">Joined</th>

              <th className="p-4 font-black uppercase text-xs">Posts</th>

              <th className="p-4 font-black uppercase text-xs">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-black hover:bg-[#FDFBF7]"
              >
                <td className="p-4 font-bold">{user.name}</td>

                <td className="p-4">
                  <a href={`mailto:${user.email}`} className="underline">
                    {user.email}
                  </a>
                </td>

                <td className="p-4">{user.phone || "—"}</td>

                <td className="p-4 text-sm">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </td>

                <td className="p-4">
                  <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1 bg-[#E9C46A] border-2 border-black font-black">
                    {user.post_count || 0}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit({ ...user })}
                      className="p-2 bg-[#E9C46A] border-2 border-black"
                      title="Edit user"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(user)}
                      className="p-2 bg-[#E63946] text-white border-2 border-black"
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// =====================================================
// ITEMS TABLE
// =====================================================

function ItemsTable({ items, onEdit, onDelete }) {
  return (
    <div className="bg-white border-2 border-black brutal-shadow-lg overflow-x-auto">
      <div className="p-5 border-b-2 border-black bg-[#2A9D8F] text-white">
        <h2 className="font-display font-black text-2xl uppercase">Posts</h2>
      </div>

      {items.length === 0 ? (
        <EmptyState text="No posts found." />
      ) : (
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="p-4 font-black uppercase text-xs">Photo</th>

              <th className="p-4 font-black uppercase text-xs">Item</th>

              <th className="p-4 font-black uppercase text-xs">Type</th>

              <th className="p-4 font-black uppercase text-xs">Category</th>

              <th className="p-4 font-black uppercase text-xs">Location</th>

              <th className="p-4 font-black uppercase text-xs">Posted By</th>

              <th className="p-4 font-black uppercase text-xs">Date</th>

              <th className="p-4 font-black uppercase text-xs">Status</th>

              <th className="p-4 font-black uppercase text-xs">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-black hover:bg-[#FDFBF7]"
              >
                <td className="p-4">
                  {item.image_path ? (
                    <a
                      href={fileUrl(item.image_path)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={fileUrl(item.image_path)}
                        alt={item.title}
                        className="w-24 h-20 object-cover border-2 border-black hover:opacity-80"
                      />
                    </a>
                  ) : (
                    <div className="w-24 h-20 border-2 border-black flex items-center justify-center bg-[#FDFBF7]">
                      <span className="text-[10px] font-bold uppercase text-black/40 text-center">
                        No Photo
                      </span>
                    </div>
                  )}
                </td>

                <td className="p-4">
                  <div className="font-black uppercase">{item.title}</div>

                  <div className="text-xs mt-1 max-w-[250px] truncate">
                    {item.description}
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 border-2 border-black text-white font-bold uppercase text-xs ${
                      item.type === "lost" ? "bg-[#E63946]" : "bg-[#2A9D8F]"
                    }`}
                  >
                    {item.type}
                  </span>
                </td>

                <td className="p-4">{item.category}</td>

                <td className="p-4">{item.location}</td>

                <td className="p-4">
                  <div className="font-bold">{item.user_name}</div>

                  <div className="text-xs">{item.user_email}</div>

                  {item.user_phone && (
                    <div className="text-xs mt-1">{item.user_phone}</div>
                  )}
                </td>

                <td className="p-4">{item.date}</td>

                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 border-2 border-black font-bold uppercase text-xs ${
                      item.status === "returned" ? "bg-[#E9C46A]" : "bg-white"
                    }`}
                  >
                    {item.status === "returned" ? "RETURNED" : "OPEN"}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit({ ...item })}
                      className="p-2 bg-[#E9C46A] border-2 border-black"
                      title="Edit post"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(item)}
                      className="p-2 bg-[#E63946] text-white border-2 border-black"
                      title="Delete post"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// =====================================================
// FEEDBACKS TABLE
// =====================================================

function FeedbacksTable({ feedbacks, onDelete }) {
  return (
    <div className="bg-white border-2 border-black brutal-shadow-lg overflow-x-auto">
      <div className="p-5 border-b-2 border-black bg-[#E9C46A]">
        <h2 className="font-display font-black text-2xl uppercase">
          All Feedbacks
        </h2>

        <p className="mt-1 text-sm font-semibold">
          {feedbacks.length} feedback
          {feedbacks.length === 1 ? "" : "s"} received
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <EmptyState text="No feedback found." />
      ) : (
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="p-4 font-black uppercase text-xs">Name</th>

              <th className="p-4 font-black uppercase text-xs">Email</th>

              <th className="p-4 font-black uppercase text-xs">Type</th>

              <th className="p-4 font-black uppercase text-xs">Message</th>

              <th className="p-4 font-black uppercase text-xs">Date</th>

              <th className="p-4 font-black uppercase text-xs">Actions</th>
            </tr>
          </thead>

          <tbody>
            {feedbacks.map((feedback) => (
              <tr
                key={feedback.id}
                className="border-b border-black hover:bg-[#FDFBF7]"
              >
                <td className="p-4 font-bold">{feedback.name}</td>

                <td className="p-4">
                  <a href={`mailto:${feedback.email}`} className="underline">
                    {feedback.email}
                  </a>
                </td>

                <td className="p-4">
                  <span className="inline-block bg-[#2A9D8F] text-white border-2 border-black px-2 py-1 font-bold uppercase text-xs">
                    {feedback.type}
                  </span>
                </td>

                <td className="p-4 max-w-[400px]">
                  <div className="whitespace-pre-wrap break-words">
                    {feedback.message}
                  </div>
                </td>

                <td className="p-4 text-sm">
                  {feedback.created_at
                    ? new Date(feedback.created_at).toLocaleDateString()
                    : "—"}
                </td>

                <td className="p-4">
                  <button
                    onClick={() => onDelete(feedback)}
                    className="bg-[#E63946] text-white border-2 border-black px-3 py-2 brutal-shadow-sm brutal-press font-bold uppercase text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({ text }) {
  return <div className="p-12 text-center font-bold uppercase">{text}</div>;
}

// =====================================================
// EDIT USER MODAL
// =====================================================

function EditUserModal({ user, setUser, onSave, onClose, saving }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-[#E9C46A] border-2 border-black p-3 mb-5">
        <h2 className="font-display font-black text-2xl uppercase">
          Edit Member
        </h2>
      </div>

      <div className="space-y-4">
        <Field
          label="Full Name"
          value={user.name}
          onChange={(value) =>
            setUser({
              ...user,
              name: value,
            })
          }
        />

        <Field
          label="Email"
          value={user.email}
          onChange={(value) =>
            setUser({
              ...user,
              email: value,
            })
          }
        />

        <Field
          label="Phone"
          value={user.phone}
          onChange={(value) =>
            setUser({
              ...user,
              phone: value,
            })
          }
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-black text-white border-2 border-black py-3 font-bold uppercase disabled:opacity-50"
        >
          <Save size={17} />
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={onClose}
          className="px-5 border-2 border-black font-bold uppercase"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// =====================================================
// EDIT ITEM MODAL
// =====================================================

function EditItemModal({
  item,
  setItem,
  onSave,
  onClose,
  saving,
  newImage,
  setNewImage,
  imagePreview,
  setImagePreview,
  removeImage,
  setRemoveImage,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-[#2A9D8F] text-white border-2 border-black p-3 mb-5">
        <h2 className="font-display font-black text-2xl uppercase">
          Edit Post
        </h2>
      </div>

      <div className="space-y-4">
        {/* TITLE */}
        <Field
          label="Title"
          value={item.title}
          onChange={(value) =>
            setItem({
              ...item,
              title: value,
            })
          }
        />

        {/* DESCRIPTION */}
        <div>
          <label className="block font-bold uppercase text-xs mb-1">
            Description
          </label>

          <textarea
            value={item.description}
            onChange={(e) =>
              setItem({
                ...item,
                description: e.target.value,
              })
            }
            rows={4}
            className="w-full border-2 border-black p-3 resize-none"
          />
        </div>

        {/* ============================= */}
        {/* IMAGE MANAGEMENT */}
        {/* ============================= */}

        <div>
          <label className="block font-bold uppercase text-xs mb-2">
            Item Photo
          </label>

          {/* IMAGE PREVIEW */}

          {imagePreview && !removeImage ? (
            <div className="mb-3">
              <img
                src={imagePreview}
                alt={item.title}
                className="w-full h-56 object-cover border-2 border-black"
              />

              <button
                type="button"
                onClick={() => {
                  setRemoveImage(true);
                  setNewImage(null);
                  setImagePreview(null);
                }}
                className="mt-3 w-full bg-[#E63946] text-white border-2 border-black py-2 font-bold uppercase"
              >
                <Trash2 size={16} className="inline mr-2" />
                Remove Image
              </button>
            </div>
          ) : (
            <div className="w-full h-40 border-2 border-dashed border-black flex items-center justify-center mb-3">
              <span className="font-bold uppercase text-sm text-black/50">
                No Image
              </span>
            </div>
          )}

          {/* CHOOSE / REPLACE IMAGE */}

          <label className="inline-block cursor-pointer">
            <span className="inline-block bg-[#E9C46A] border-2 border-black px-4 py-2 font-bold uppercase text-sm">
              {imagePreview ? "Replace Image" : "Choose Image"}
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                if (file.size > 5 * 1024 * 1024) {
                  alert("Image must be under 5MB");
                  return;
                }

                setNewImage(file);
                setRemoveImage(false);
                setImagePreview(URL.createObjectURL(file));
              }}
            />
          </label>

          {newImage && (
            <p className="text-xs font-bold mt-2">New image: {newImage.name}</p>
          )}
        </div>

        {/* CATEGORY */}

        <Field
          label="Category"
          value={item.category}
          onChange={(value) =>
            setItem({
              ...item,
              category: value,
            })
          }
        />

        {/* LOCATION */}

        <Field
          label="Location"
          value={item.location}
          onChange={(value) =>
            setItem({
              ...item,
              location: value,
            })
          }
        />

        {/* DATE */}

        <Field
          label="Date"
          type="date"
          value={item.date}
          onChange={(value) =>
            setItem({
              ...item,
              date: value,
            })
          }
        />

        {/* TYPE */}

        <div>
          <label className="block font-bold uppercase text-xs mb-1">Type</label>

          <select
            value={item.type}
            onChange={(e) =>
              setItem({
                ...item,
                type: e.target.value,
              })
            }
            className="w-full border-2 border-black p-3 bg-white"
          >
            <option value="lost">Lost</option>

            <option value="found">Found</option>
          </select>
        </div>

        {/* STATUS */}

        <div>
          <label className="block font-bold uppercase text-xs mb-1">
            Status
          </label>

          <select
            value={item.status === "returned" ? "returned" : "open"}
            onChange={(e) =>
              setItem({
                ...item,
                status: e.target.value,
              })
            }
            className="w-full border-2 border-black p-3 bg-white"
          >
            <option value="open">Open</option>

            <option value="returned">returned</option>
          </select>
        </div>
      </div>

      {/* BUTTONS */}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-black text-white border-2 border-black py-3 font-bold uppercase disabled:opacity-50"
        >
          <Save size={17} />

          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={onClose}
          className="px-5 border-2 border-black font-bold uppercase"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// =====================================================
// MODAL
// =====================================================

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] border-2 border-black brutal-shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-white border-2 border-black"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}

// =====================================================
// FIELD
// =====================================================

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block font-bold uppercase text-xs mb-1">{label}</label>

      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-black p-3 bg-white"
      />
    </div>
  );
}
