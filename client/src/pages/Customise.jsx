import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiArrowLeft, FiArrowRight, FiRotateCw, FiZoomIn, FiZoomOut, FiMove } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Customise() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { product, quantity } = location.state || {};

  // Redirect if accessed directly without product
  useEffect(() => {
    if (!product) navigate('/', { replace: true });
  }, [product, navigate]);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null); // base64
  const [imgObj, setImgObj] = useState(null);               // Image element

  // Transform state for the uploaded photo on the canvas
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });

  // Dragging state
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // 3D tilt effect state
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const cardRef = useRef(null);

  const productImg = useRef(null);
  const [productImgLoaded, setProductImgLoaded] = useState(false);

  // Load product base image into canvas
  useEffect(() => {
    if (!product) return;
    const imgUrl = product.images?.[0]?.url;
    if (!imgUrl) { setProductImgLoaded(true); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;
    img.onload = () => { productImg.current = img; setProductImgLoaded(true); };
    img.onerror = () => setProductImgLoaded(true);
  }, [product]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#f9f5f2';
    ctx.fillRect(0, 0, W, H);

    // Product image as background
    if (productImg.current) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.drawImage(productImg.current, 0, 0, W, H);
      ctx.restore();
    } else {
      // Placeholder rect
      ctx.fillStyle = '#e8ddd6';
      ctx.fillRect(40, 40, W - 80, H - 80);
      ctx.fillStyle = '#a08070';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(product?.name || 'Product', W / 2, H / 2);
    }

    // Overlay zone guide (dashed rect)
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(111,78,55,0.4)';
    ctx.lineWidth = 1.5;
    const zoneX = W * 0.2;
    const zoneY = H * 0.2;
    const zoneW = W * 0.6;
    const zoneH = H * 0.6;
    ctx.strokeRect(zoneX, zoneY, zoneW, zoneH);
    ctx.restore();

    // User uploaded photo
    if (imgObj) {
      const { x, y, scale, rotation } = transformRef.current;
      ctx.save();
      ctx.translate(W / 2 + x, H / 2 + y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      const iW = imgObj.width;
      const iH = imgObj.height;
      const maxDim = Math.min(zoneW, zoneH);
      const aspect = iW / iH;
      const dW = aspect >= 1 ? maxDim : maxDim * aspect;
      const dH = aspect >= 1 ? maxDim / aspect : maxDim;
      ctx.drawImage(imgObj, -dW / 2, -dH / 2, dW, dH);
      ctx.restore();
    } else {
      // Upload prompt overlay
      ctx.save();
      ctx.fillStyle = 'rgba(111,78,55,0.08)';
      ctx.fillRect(zoneX, zoneY, zoneW, zoneH);
      ctx.fillStyle = 'rgba(111,78,55,0.5)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload your photo here', W / 2, H / 2 - 10);
      ctx.font = '12px sans-serif';
      ctx.fillText('↑ Click "Upload Photo" below', W / 2, H / 2 + 14);
      ctx.restore();
    }
  }, [imgObj, product]);

  useEffect(() => { draw(); }, [draw, transform]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setUploadedImage(base64);
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        setImgObj(img);
        setTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
      };
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setUploadedImage(null);
    setImgObj(null);
    setTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Canvas drag handlers
  const onMouseDown = (e) => {
    if (!imgObj) return;
    dragging.current = true;
    dragStart.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setTransform((prev) => ({ ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }));
  };
  const onMouseUp = () => { dragging.current = false; };

  const onTouchStart = (e) => {
    if (!imgObj) return;
    dragging.current = true;
    const t = e.touches[0];
    dragStart.current = { x: t.clientX - transformRef.current.x, y: t.clientY - transformRef.current.y };
  };
  const onTouchMove = (e) => {
    if (!dragging.current) return;
    const t = e.touches[0];
    setTransform((prev) => ({ ...prev, x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y }));
  };

  // 3D tilt on card hover
  const handleMouseMoveCard = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -24;
    const ry = ((x / rect.width) - 0.5) * 24;
    setTilt({ rx, ry });
  };
  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  // Proceed to checkout
  const handleProceed = async () => {
    if (!uploadedImage) {
      toast.error('Please upload your photo first');
      return;
    }
    try {
      await addToCart(product._id, quantity || 1);
      // Store customisation in sessionStorage for order reference
      sessionStorage.setItem('customisation', JSON.stringify({
        productId: product._id,
        productName: product.name,
        customPhoto: uploadedImage,
      }));
      toast.success('Product customised! Proceeding to checkout...');
      navigate('/checkout');
    } catch {
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  if (!product) return null;

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 md:px-8 py-6 sm:py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-dark">Customise Your Product</h1>
            <p className="text-gray-400 text-sm mt-0.5">{product.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">

          {/* Left — 3D Preview */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-gray-500 mb-3 text-center">
              🖱️ Hover over the preview for a 3D effect · Drag your photo to reposition
            </p>

            {/* 3D Card */}
            <div
              ref={cardRef}
              className="w-full max-w-sm"
              style={{ perspective: '900px' }}
              onMouseMove={handleMouseMoveCard}
              onMouseLeave={resetTilt}
            >
              <div
                style={{
                  transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  transition: tilt.rx === 0 && tilt.ry === 0 ? 'transform 0.5s ease' : 'transform 0.1s ease',
                  transformStyle: 'preserve-3d',
                  boxShadow: `${-tilt.ry * 0.5}px ${tilt.rx * 0.5}px 40px rgba(0,0,0,0.2)`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: imgObj ? 'grab' : 'default',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={480}
                  className="w-full block"
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onMouseUp}
                />
              </div>
            </div>

            {/* Transform controls */}
            {imgObj && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <button onClick={() => setTransform((p) => ({ ...p, scale: Math.min(3, p.scale + 0.1) }))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                  <FiZoomIn size={13} /> Zoom In
                </button>
                <button onClick={() => setTransform((p) => ({ ...p, scale: Math.max(0.2, p.scale - 0.1) }))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                  <FiZoomOut size={13} /> Zoom Out
                </button>
                <button onClick={() => setTransform((p) => ({ ...p, rotation: p.rotation - 15 }))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                  <FiRotateCw size={13} className="scale-x-[-1]" /> Rotate ←
                </button>
                <button onClick={() => setTransform((p) => ({ ...p, rotation: p.rotation + 15 }))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                  <FiRotateCw size={13} /> Rotate →
                </button>
                <button onClick={() => setTransform({ x: 0, y: 0, scale: 1, rotation: 0 })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                  <FiMove size={13} /> Reset
                </button>
              </div>
            )}
          </div>

          {/* Right — Upload & Info */}
          <div className="space-y-6">

            {/* Product info */}
            <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
              <img
                src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100'}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-dark">{product.name}</p>
                <p className="text-primary font-bold text-lg">₹{product.price?.toFixed(2)}</p>
                <p className="text-gray-400 text-xs">Qty: {quantity || 1}</p>
              </div>
            </div>

            {/* Upload section */}
            <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="font-semibold text-dark text-base mb-1">Upload Your Photo</h2>
                <p className="text-gray-400 text-xs">
                  Upload a clear, high-resolution photo. Supported: JPG, PNG, WEBP (max 10MB)
                </p>
              </div>

              {!uploadedImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-primary/40 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <FiUpload className="text-primary" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-dark text-sm">Click to upload photo</p>
                    <p className="text-gray-400 text-xs mt-1">or drag and drop</p>
                  </div>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                  >
                    <FiX size={14} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ✓ Photo uploaded
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {uploadedImage && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-center text-primary text-sm hover:underline"
                >
                  Change photo
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-dark text-sm">How it works:</p>
              <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
                <li>Upload your photo using the button above</li>
                <li>Drag the photo on the preview to reposition it</li>
                <li>Use zoom and rotate controls to adjust</li>
                <li>When happy with the preview, click <strong>Proceed to Checkout</strong></li>
              </ol>
            </div>

            {/* Proceed button */}
            <button
              onClick={handleProceed}
              disabled={!uploadedImage}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all ${
                uploadedImage
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FiArrowRight size={18} />
              {uploadedImage ? 'Proceed to Checkout' : 'Upload a photo to continue'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
