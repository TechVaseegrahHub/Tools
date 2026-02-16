import React, { useState, useRef, useCallback } from 'react';
import { FiZoomIn, FiZoomOut, FiCrop, FiRotateCcw, FiMaximize, FiX } from 'react-icons/fi';

const ImageEditor = ({ 
  imageUrl, 
  onChange, 
  aspectRatio = 4/3, 
  minCropSize = 100,
  showCropButton = true,
  className = '' 
}) => {
  const [cropData, setCropData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Load image and get dimensions
  const handleImageLoad = (e) => {
    const img = e.target;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    
    // Reset position when new image loads
    setPosition({ x: 0, y: 0, scale: 1 });
    setCropData(null);
  };

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e) => {
    if (isCropping) return;
    
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isCropping) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    
    setPosition(prev => ({
      ...prev,
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle cropping
  const startCrop = () => {
    if (!containerRef.current) return;
    
    setIsCropping(true);
    setCropData({
      x: 0,
      y: 0,
      width: containerRef.current.clientWidth * 0.8,
      height: containerRef.current.clientHeight * 0.8
    });
  };

  const handleCropMouseDown = (e) => {
    if (!isCropping) return;
    
    e.stopPropagation();
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setCropStart({
      x: clientX - rect.left - (cropData?.x || 0),
      y: clientY - rect.top - (cropData?.y || 0)
    });
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging || !isCropping || !cropData) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    
    const newX = Math.max(0, Math.min(
      clientX - rect.left - cropStart.x,
      rect.width - cropData.width
    ));
    
    const newY = Math.max(0, Math.min(
      clientY - rect.top - cropStart.y,
      rect.height - cropData.height
    ));
    
    setCropData(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  // Zoom functionality
  const handleZoom = (direction) => {
    const factor = direction === 'in' ? 1.2 : 0.8;
    setPosition(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale * factor))
    }));
  };

  // Reset all transformations
  const resetImage = () => {
    setPosition({ x: 0, y: 0, scale: 1 });
    setCropData(null);
    setIsCropping(false);
  };

  // Apply crop and generate result
  const applyCrop = () => {
    if (!cropData || !imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate actual image dimensions in container
    const containerRect = containerRef.current.getBoundingClientRect();
    const scaleX = imageDimensions.width / containerRect.width;
    const scaleY = imageDimensions.height / containerRect.height;
    
    // Set canvas size to crop dimensions
    canvas.width = cropData.width * scaleX;
    canvas.height = cropData.height * scaleY;
    
    // Draw cropped portion
    ctx.drawImage(
      imageRef.current,
      cropData.x * scaleX,
      cropData.y * scaleY,
      cropData.width * scaleX,
      cropData.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    // Convert to data URL and pass back
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onChange(croppedImageUrl);
    
    // Reset state
    setCropData(null);
    setIsCropping(false);
  };

  // Cancel crop
  const cancelCrop = () => {
    setCropData(null);
    setIsCropping(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
        <button
          onClick={() => handleZoom('in')}
          className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <FiZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <FiZoomOut className="h-4 w-4" />
        </button>
        {showCropButton && (
          <button
            onClick={startCrop}
            disabled={isCropping}
            className={`p-2 rounded-lg shadow-sm transition-colors ${
              isCropping 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-white hover:bg-gray-50'
            }`}
            title="Crop Image"
          >
            <FiCrop className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={resetImage}
          className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="Reset Image"
        >
          <FiRotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {imageUrl ? (
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Editable"
            className="absolute cursor-move select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
              transformOrigin: 'center center',
              maxWidth: 'none',
              maxHeight: 'none'
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <FiMaximize className="h-12 w-12" />
          </div>
        )}

        {/* Crop Overlay */}
        {isCropping && cropData && (
          <>
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
            
            {/* Crop area */}
            <div
              className="absolute border-2 border-white border-dashed cursor-move"
              style={{
                left: `${cropData.x}px`,
                top: `${cropData.y}px`,
                width: `${cropData.width}px`,
                height: `${cropData.height}px`
              }}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleMouseUp}
            ></div>
            
            {/* Crop controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white rounded-lg shadow-lg p-2">
              <button
                onClick={applyCrop}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Apply Crop
              </button>
              <button
                onClick={cancelCrop}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-500">
        {isCropping 
          ? "Drag the crop area to position it. Click Apply to save changes."
          : "Drag to move image, use zoom buttons to adjust scale."
        }
      </div>
    </div>
  );
};

export default ImageEditor;