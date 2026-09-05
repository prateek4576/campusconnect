import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import api, { formatApiErrorDetail } from "../lib/api";

const CATEGORIES = [
  "ID Card",
  "Headphones",
  "earbuds",
  "Charger",
  "Keys",
  "Wallet/ID",
  "Watch",
  "Bottle",
  "Other",
];

// =====================================================
// COMPRESS IMAGE BEFORE UPLOAD
// =====================================================

async function compressImage(file) {
  const MAX_SIZE = 600 * 1024; // 600 KB
  const MAX_WIDTH = 1600;
  const MAX_HEIGHT = 1600;

  const image = new Image();

  const imageUrl = URL.createObjectURL(file);

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Could not read image"));
      image.src = imageUrl;
    });

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    // -------------------------------------------------
    // Resize while keeping aspect ratio
    // -------------------------------------------------

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);

      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not process image");
    }

    ctx.drawImage(image, 0, 0, width, height);

    // -------------------------------------------------
    // Try WebP first
    // -------------------------------------------------

    let quality = 0.85;

    while (quality >= 0.4) {
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/webp", quality);
      });

      if (!blob) {
        break;
      }

      if (blob.size <= MAX_SIZE) {
        return new File([blob], "campusconnect.webp", {
          type: "image/webp",
        });
      }

      quality -= 0.05;
    }

    // -------------------------------------------------
    // If still too large, reduce dimensions
    // -------------------------------------------------

    let newWidth = width;
    let newHeight = height;

    while (true) {
      newWidth = Math.round(newWidth * 0.85);
      newHeight = Math.round(newHeight * 0.85);

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.drawImage(image, 0, 0, newWidth, newHeight);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.75);
      });

      if (!blob) {
        throw new Error("Could not compress image");
      }

      if (blob.size <= MAX_SIZE || newWidth < 500 || newHeight < 500) {
        return new File([blob], "campusconnect.webp", {
          type: "image/webp",
        });
      }
    }
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function isNetworkError(error) {
  return (
    !navigator.onLine ||
    !error.response ||
    error.code === "ERR_NETWORK" ||
    error.message === "Network Error"
  );
}

export default function ReportItem({ type }) {
  const nav = useNavigate();
  const isLost = type === "lost";
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    location: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = (e) => {
    const f = e.target.files?.[0];

    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let image_path = null;

      if (file) {
        // -----------------------------------------------
        // Compress image BEFORE sending it to backend
        // -----------------------------------------------

        const compressedFile = await compressImage(file);

        console.log(
          "Original image:",
          (file.size / 1024 / 1024).toFixed(2),
          "MB",
        );

        console.log(
          "Compressed image:",
          (compressedFile.size / 1024).toFixed(0),
          "KB",
        );

        // -----------------------------------------------
        // Upload compressed image
        // -----------------------------------------------

        const fd = new FormData();

        fd.append("file", compressedFile);

        const { data } = await api.post("/upload", fd);

        image_path = data.path;
      }

      await api.post(`/items/${type}`, { ...form, image_path });
      nav(`/items/${type}`);
    } catch (e) {
      console.error("Submit item error:", e);

      if (isNetworkError(e)) {
        setError(
          "Network problem. Your post hasn't been submitted. Please try again.",
        );
      } else {
        setError(
          formatApiErrorDetail(e.response?.data?.detail) ||
            "Could not submit your post. Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const accent = isLost ? "#E63946" : "#2A9D8F";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8">
        <div
          className="inline-block border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3 text-white"
          style={{ backgroundColor: accent }}
        >
          {isLost ? "I lost something" : "I found something"}
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-none">
          Report a {isLost ? "Lost" : "Found"} Item
        </h1>
        <p className="mt-3 text-lg">
          Fill in the details below. A photo massively increases your chance of
          a match.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white border-2 border-black brutal-shadow-lg p-6 md:p-8 space-y-5"
      >
        <Field label="Title" required>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
            placeholder="e.g. Black leather wallet"
          />
        </Field>

        <Field label="Description" required>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm resize-none"
            placeholder="Distinctive marks, contents, when you last had it, etc."
          />
        </Field>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Category" required>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" required>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
            />
          </Field>
        </div>

        <Field label="Location" required>
          <input
            required
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
            placeholder="e.g. Library 3rd floor, near study room B"
          />
        </Field>

        <div>
          <label className="block font-bold uppercase text-xs mb-2 tracking-widest">
            Photo (optional)
          </label>
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="preview"
                className="w-40 h-40 object-cover border-2 border-black brutal-shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute -top-2 -right-2 bg-black text-white border-2 border-black w-7 h-7 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 border-2 border-dashed border-black bg-white px-4 py-3 brutal-shadow-sm cursor-pointer font-semibold uppercase text-sm">
              <Upload size={16} /> Upload photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFile}
              />
            </label>
          )}
        </div>

        {error && (
          <div className="bg-[#E63946] text-white border-2 border-black px-3 py-2 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="text-white border-2 border-black px-6 py-3 brutal-shadow brutal-press font-bold uppercase disabled:opacity-60"
            style={{ backgroundColor: accent }}
          >
            {busy ? "Posting…" : `Post ${isLost ? "Lost" : "Found"} Item`}
          </button>
          <button
            type="button"
            onClick={() => nav("/dashboard")}
            className="bg-white border-2 border-black px-6 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
        {label} {required && <span className="text-[#E63946]">*</span>}
      </label>
      {children}
    </div>
  );
}
