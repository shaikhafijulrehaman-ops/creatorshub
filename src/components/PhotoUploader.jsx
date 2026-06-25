import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, ZoomIn, ZoomOut, X, RotateCcw, Check } from 'lucide-react';
import './PhotoUploader.css';

export const PhotoUploader = ({ value, onChange, aspectRatio = 1, label = 'Photo', recommendedSize = '500x500', maxMB = 5 }) => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [editing, setEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingImg, setDraggingImg] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalFile, setOriginalFile] = useState(null);
  const fileRef = useRef(null);
  const previewImgRef = useRef(null);
  const canvasRef = useRef(null);
  const editorRef = useRef(null);
  const [touchStartDist, setTouchStartDist] = useState(0);
  const [touchStartZoom, setTouchStartZoom] = useState(1);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const preventDefaultWheel = (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0015;
      setZoom(z => Math.max(0.5, Math.min(4, z + delta)));
    };
    el.addEventListener('wheel', preventDefaultWheel, { passive: false });
    return () => el.removeEventListener('wheel', preventDefaultWheel);
  }, [editing]);

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > maxMB * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    setOriginalFile(url);
    setPreview(url);
    setEditing(true);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleMouseDown = (e) => {
    setDraggingImg(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    e.preventDefault();
  };
  const handleMouseMove = useCallback((e) => {
    if (!draggingImg) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [draggingImg, dragStart]);
  const handleMouseUp = () => setDraggingImg(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setDraggingImg(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    } else if (e.touches.length === 2) {
      setDraggingImg(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDist(dist);
      setTouchStartZoom(zoom);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && draggingImg) {
      const touch = e.touches[0];
      setOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    } else if (e.touches.length === 2 && touchStartDist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDist;
      setZoom(Math.max(0.5, Math.min(4, touchStartZoom * factor)));
    }
  };

  const handleTouchEnd = () => {
    setDraggingImg(false);
    setTouchStartDist(0);
  };

  const handleSave = () => {
    if (!originalFile || !canvasRef.current || !previewImgRef.current) {
      onChange && onChange(preview);
      setEditing(false);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const size = aspectRatio === 1 ? 400 : 1200;
      const h    = aspectRatio === 1 ? 400 : 375;
      canvas.width  = size;
      canvas.height = h;
      ctx.clearRect(0, 0, size, h);

      // Measure the editor box size in DOM
      const imgEl = previewImgRef.current;
      const box = imgEl.parentElement?.getBoundingClientRect();
      const W_box = box ? box.width : (aspectRatio === 1 ? 400 : 1200);

      // Calculate scale factor from DOM to Canvas
      const K = size / W_box;

      // Calculate starting dimensions for "object-fit: cover" on Canvas
      const S_canvas_cover = Math.max(size / img.width, h / img.height);
      const W_canvas_start = img.width * S_canvas_cover;
      const H_canvas_start = img.height * S_canvas_cover;

      // Apply zoom
      const drawW = W_canvas_start * zoom;
      const drawH = H_canvas_start * zoom;

      // Apply offset (scaled by K) and center the image
      const x = (size - drawW) / 2 + offset.x * K;
      const y = (h - drawH) / 2 + offset.y * K;

      ctx.drawImage(img, x, y, drawW, drawH);
      let dataUrl;
      try {
        const testWebP = canvas.toDataURL('image/webp');
        if (testWebP.indexOf('data:image/webp') === 0) {
          dataUrl = canvas.toDataURL('image/webp', 0.80);
        } else {
          dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch {
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
      onChange && onChange(dataUrl);
      setPreview(dataUrl);
      setEditing(false);
    };
    img.src = originalFile;
  };

  const handleRemove = () => {
    setPreview(null);
    setEditing(false);
    setOriginalFile(null);
    onChange && onChange(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setOriginalFile(null);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  return (
    <div className="photo-uploader">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Drop zone / preview */}
      <div
        className={`photo-drop-zone${dragging ? ' photo-drop-zone--active' : ''}`}
        style={{ aspectRatio: aspectRatio === 1 ? '1 / 1' : '16 / 5' }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={label}
              className="photo-preview-img"
              style={{ objectPosition: 'center' }}
            />
            <div className="photo-preview-overlay">
              <button type="button" className="photo-btn-change" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                <Upload size={13} /> Change
              </button>
              <button type="button" className="photo-btn-remove" onClick={(e) => { e.stopPropagation(); handleRemove(); }}>
                <X size={13} /> Remove
              </button>
            </div>
          </>
        ) : (
          <div className="photo-placeholder">
            <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <p className="photo-placeholder-label">Drop {label} here</p>
            <p className="photo-placeholder-sub">or click to upload — {recommendedSize} recommended, max {maxMB}MB</p>
          </div>
        )}
      </div>

      {/* WhatsApp-style full-screen/modal image editor */}
      {editing && (
        <div className="photo-editor-overlay-backdrop" onClick={handleCancel}>
          <div 
            className="photo-editor-modal-container" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="photo-editor-modal-header">
              <h3>Edit {label}</h3>
              <button type="button" className="photo-editor-close-x" onClick={handleCancel}>
                <X size={20} />
              </button>
            </div>

            {/* Crop container wrapper */}
            <div 
              ref={editorRef}
              className={`photo-crop-wrapper ${aspectRatio === 1 ? 'profile-aspect' : 'banner-aspect'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <img
                ref={previewImgRef}
                src={originalFile}
                alt="crop preview"
                className="photo-crop-image"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
              />
              
              {/* WhatsApp crop overlay hole */}
              <div className={`crop-overlay-hole ${aspectRatio === 1 ? 'circle' : 'rectangle'}`} />
            </div>

            {/* Controls footer */}
            <div className="photo-editor-modal-footer">
              <div className="photo-editor-zoom-row">
                <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut size={16} /></button>
                <input 
                  type="range" 
                  min="0.5" 
                  max="4" 
                  step="0.01" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))} 
                  className="photo-zoom-slider"
                />
                <button type="button" onClick={() => setZoom(z => Math.min(4, z + 0.1))}><ZoomIn size={16} /></button>
              </div>

              <div className="photo-editor-buttons-row">
                <button type="button" className="photo-btn-cancel-new" onClick={handleCancel}>
                  Cancel
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="photo-btn-reset-new" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
                    <RotateCcw size={14} /> Reset
                  </button>
                  <button type="button" className="photo-btn-save-new" onClick={handleSave}>
                    <Check size={14} /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
};

export default PhotoUploader;
