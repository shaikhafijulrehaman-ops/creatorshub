import { useState, useRef, useCallback } from 'react';
import { Upload, Crop, ZoomIn, ZoomOut, X, RotateCcw, Check } from 'lucide-react';
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
      const size = aspectRatio === 1 ? 500 : 1600;
      const h    = aspectRatio === 1 ? 500 : 500;
      canvas.width  = size;
      canvas.height = h;
      ctx.clearRect(0, 0, size, h);

      // Measure the editor box size in DOM
      const imgEl = previewImgRef.current;
      const box = imgEl.parentElement?.getBoundingClientRect();
      const W_box = box ? box.width : (aspectRatio === 1 ? 500 : 1600);

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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
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

  return (
    <div className="photo-uploader">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Drop zone / preview */}
      {!editing ? (
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
      ) : (
        /* Crop editor */
        <div className="photo-editor">
          <div
            className="photo-editor-canvas"
            style={{ aspectRatio: aspectRatio === 1 ? '1 / 1' : '16 / 5', cursor: draggingImg ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={previewImgRef}
              src={originalFile}
              alt="crop preview"
              className="photo-editor-img"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              draggable={false}
            />
            <div className="photo-editor-grid" />
          </div>

          {/* Controls */}
          <div className="photo-editor-controls">
            <span className="photo-editor-hint">Drag to reposition</span>
            <div className="photo-zoom-controls">
              <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut size={14} /></button>
              <span className="photo-zoom-val">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.1))}><ZoomIn size={14} /></button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="photo-btn-reset" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
                <RotateCcw size={12} /> Reset
              </button>
              <button type="button" className="photo-btn-save" onClick={handleSave}>
                <Check size={12} /> Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
};

export default PhotoUploader;
