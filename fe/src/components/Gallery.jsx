import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiGet, apiPost, apiUpload, getUserInfo } from "../utils/api";
import { GALLERY_PLACEHOLDER_SRC } from "../utils/galleryPlaceholder";
import "../assets/styles/Gallery.css";

function GalleryImage({ src, alt, className, style }) {
  const [imgSrc, setImgSrc] = useState(src || GALLERY_PLACEHOLDER_SRC);

  useEffect(() => {
    setImgSrc(src || GALLERY_PLACEHOLDER_SRC);
  }, [src]);

  const handleError = () => {
    if (imgSrc !== GALLERY_PLACEHOLDER_SRC) {
      setImgSrc(GALLERY_PLACEHOLDER_SRC);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={handleError}
    />
  );
}

const EVENT_FILTERS = [
  { id: "all", label: "All" },
  { id: "henna", label: "Henna Party" },
  { id: "wedding", label: "Wedding Party" },
  { id: "birthday", label: "Birthday Party" },
  { id: "bar-mitzvah", label: "Bar / Bat Mitzvah Party" },
  { id: "brit", label: "Birth Party Son / Daughter" },
  { id: "shabat-hatan", label: "Save The Date" },
];

const defaultUploadEventType = EVENT_FILTERS.find((f) => f.id !== "all")?.id ?? "henna";

function Gallery({ isAdmin }) {
  const { token } = getUserInfo();
  const showAdminTools = Boolean(isAdmin && token);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadEventType, setUploadEventType] = useState(defaultUploadEventType);
  const [images, setImages] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const fileInputRef = useRef(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const closeBtnRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [toast, setToast] = useState({ type: "", message: "" });
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    setFetchError("");
    setLoading(true);
    try {
      const data = await apiGet("/getImages");
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching images:", err);
      setFetchError(err.message || "Could not load gallery.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setLightboxOpen(false);
        setCurrentImage(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const t = requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!toast.message) return undefined;
    const id = setTimeout(() => setToast({ type: "", message: "" }), 3500);
    return () => clearTimeout(id);
  }, [toast.message]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const uploadImages = async (files) => {
    if (!files.length) {
      setToast({ type: "warning", message: "Please select at least one image." });
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("eventType", uploadEventType);

    setUploading(true);
    try {
      await apiUpload("/uploadImages", formData);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setToast({ type: "success", message: "Images uploaded successfully." });
      await fetchImages();
    } catch (err) {
      console.error("Upload error:", err);
      setToast({ type: "error", message: err.message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const ok = window.confirm(
      "Are you sure you want to delete this image?\nThis action cannot be undone."
    );
    if (!ok) return;

    try {
      await apiPost("/deleteImage", { imageId: id, imageName: name });
      await fetchImages();
      setToast({ type: "success", message: "Image deleted." });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: err.message || "Error deleting image." });
    }
  };

  const openLightbox = (img) => {
    setCurrentImage(img);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage(null);
  };

  const filteredImages =
    activeFilter === "all"
      ? images
      : images.filter((img) => img.eventType === activeFilter);

  const imageAlt = (img) => {
    const base = (img.name || "").trim() || `Gallery photo ${img.id}`;
    const label = EVENT_FILTERS.find((f) => f.id === img.eventType)?.label;
    return label ? `${base} — ${label}` : base;
  };

  return (
    <div className="gallery-page">
      <style>
        {`
          .gallery-grid-responsive {
            display: grid;
            gap: 1.2rem;
            grid-template-columns: repeat(2, 1fr);
          }
          @media (min-width: 640px) {
            .gallery-grid-responsive { grid-template-columns: repeat(3, 1fr); }
          }
          @media (min-width: 1024px) {
            .gallery-grid-responsive { grid-template-columns: repeat(4, 1fr); }
          }
          .gallery-filter-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
            margin-bottom: 1.6rem;
            align-items: center;
          }
          .gallery-thumb-wrap {
            position: relative;
            border-radius: var(--radius-md, 8px);
            overflow: hidden;
            border: 1px solid var(--color-border, #e2e8f0);
            background: var(--color-bg, #f8fafc);
          }
          .gallery-thumb-wrap img {
            display: block;
            width: 100%;
            height: 200px;
            object-fit: cover;
          }
          .gallery-lightbox-backdrop {
            position: fixed;
            inset: 0;
            z-index: 10000;
            background: rgba(15, 23, 42, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .gallery-lightbox-inner {
            position: relative;
            max-width: min(92vw, 1200px);
            max-height: 90vh;
          }
          .gallery-lightbox-inner img {
            max-width: 92vw;
            max-height: 85vh;
            object-fit: contain;
            border-radius: var(--radius-md, 8px);
          }
        `}
      </style>

      {toast.message && (
        <div
          className={`toast ${toast.type === "success" ? "toast-success" : ""} ${toast.type === "error" ? "toast-error" : ""} ${toast.type === "warning" ? "toast-warning" : ""}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {showAdminTools && (
        <div className="card" style={{ marginBottom: "1.6rem" }}>
          <h3 className="form-label" style={{ marginBottom: "1rem" }}>
            Upload images
          </h3>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" htmlFor="gallery-event-type">
              Event type
            </label>
            <select
              id="gallery-event-type"
              className="form-select"
              value={uploadEventType}
              onChange={(e) => setUploadEventType(e.target.value)}
              disabled={uploading}
            >
              {EVENT_FILTERS.filter((f) => f.id !== "all").map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Choose image files to upload"
            >
              Choose files
            </button>
            {selectedFiles.length > 0 && (
              <span className="badge" aria-live="polite">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
              aria-hidden
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => uploadImages(selectedFiles)}
              disabled={!selectedFiles.length || uploading}
              aria-label="Upload selected images"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      )}

      <div className="gallery-filter-row" role="toolbar" aria-label="Filter gallery by event type">
        {EVENT_FILTERS.map((f) => {
          const active = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              className={`btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`}
              aria-pressed={active}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {fetchError && (
        <div className="empty-state" role="alert">
          <p className="empty-state-title">Could not load images</p>
          <p className="empty-state-text">{fetchError}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchImages}>
            Try again
          </button>
        </div>
      )}

      {!fetchError && loading && (
        <div className="loading-center" aria-busy="true" aria-live="polite">
          <span className="spinner spinner-lg" aria-hidden />
          <span>Loading gallery…</span>
        </div>
      )}

      {!fetchError && !loading && filteredImages.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden>
            🖼
          </div>
          <p className="empty-state-title">No images yet</p>
          <p className="empty-state-text">
            {activeFilter === "all"
              ? "Images will be added soon."
              : "No images for this event type."}
          </p>
        </div>
      )}

      {!fetchError && !loading && filteredImages.length > 0 && (
        <div className="gallery-grid-responsive">
          {filteredImages.map((img) => (
            <div className="gallery-thumb-wrap card" key={img.id} style={{ padding: 0 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  padding: 0,
                  border: "none",
                  width: "100%",
                  display: "block",
                  cursor: "pointer",
                }}
                onClick={() => openLightbox(img)}
                aria-label={`Open larger view: ${imageAlt(img)}`}
              >
                <GalleryImage src={img.src} alt={imageAlt(img)} />
              </button>
              {showAdminTools && (
                <div style={{ padding: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(img.id, img.name)}
                    aria-label={`Delete image ${img.name || img.id}`}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxOpen && currentImage && (
        <div
          className="gallery-lightbox-backdrop"
          onClick={closeLightbox}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            className="gallery-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeBtnRef}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={closeLightbox}
              aria-label="Close image preview"
              style={{ position: "absolute", top: "-0.5rem", right: 0, zIndex: 1 }}
            >
              Close
            </button>
            <GalleryImage
              src={currentImage.src}
              alt={imageAlt(currentImage)}
              style={{ display: "block", margin: "0 auto" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
