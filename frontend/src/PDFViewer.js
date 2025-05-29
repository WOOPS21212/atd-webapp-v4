import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Video URL detection patterns
const VIDEO_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  /vimeo\.com\/(\d+)/,
  /(?:dailymotion\.com\/video\/)([a-zA-Z0-9_-]+)/,
  /(?:wistia\.com\/medias\/)([a-zA-Z0-9_-]+)/,
  /(?:loom\.com\/share\/)([a-zA-Z0-9_-]+)/,
  /\.(?:mp4|avi|mov|wmv|flv|webm|mkv)(?:\?|$)/i,
  /video/i // Any URL containing "video"
];

// Helper function to determine if a URL is a video link
const isVideoLink = (url) => {
  return VIDEO_PATTERNS.some(pattern => pattern.test(url));
};

// Helper function to determine video type
const getVideoType = (url) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('dailymotion.com')) return 'dailymotion';
  if (url.includes('wistia.com')) return 'wistia';
  if (url.includes('loom.com')) return 'loom';
  if (/\.(?:mp4|avi|mov|wmv|flv|webm|mkv)/i.test(url)) return 'video-file';
  if (/video/i.test(url)) return 'video';
  return 'unknown';
};

// Helper function to get link type for styling
const getLinkType = (url) => {
  return isVideoLink(url) ? 'video' : 'regular';
};

const PDFViewer = ({ pdfUrl, currentPage, onPageChange }) => {
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState('page-width');
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const [renderTask, setRenderTask] = useState(null);
  const [pageLinks, setPageLinks] = useState([]);
  const overlayRef = useRef(null);
  const [overlayReady, setOverlayReady] = useState(false);
  const resizeObserverRef = useRef(null);

// Table of Contents data - Updated with new sections and page numbers
const tableOfContents = [
  { num: '01', title: 'Strategy', page: 151 },
  { num: '02', title: 'Innovation', page: 179 },
  { num: '03', title: 'Technology', page: 244 },
  { num: '04', title: 'Content', page: 290 }, // Updated - was going to Web at 329
  { num: '05', title: 'Advertising / SEM / SEO', page: 365 },
  { num: '06', title: 'Web', page: 366 },
  { num: '07', title: 'Events', page: 368 },
  { num: '08', title: 'Public Relations', page: 391 },
  { num: '09', title: 'Crisis Management', page: 418 }, // Updated - was 446
  { num: '10', title: 'Production', page: 448 },
  { num: '11', title: 'Fee', page: 467 },
  { num: '12', title: 'Account Management', page: 485 },
  { num: '13', title: 'Reporting & Analytics', page: 506 },
  { num: '14', title: 'Team & Chem / Culture', page: 539 },
  { num: '15', title: 'SME Representation (PR, Social, Strategy)', page: 541 },
  { num: '16', title: 'Social Media', page: 569 },
  { num: '17', title: 'Media Buying', page: 593 },
];
  // Update overlay positions when canvas or container size changes
  const updateOverlayPositions = useCallback(() => {
    if (!canvasRef.current || !containerRef.current || pageLinks.length === 0) return;

    // Get the current canvas position relative to its container
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Get the actual rendered size of the canvas
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the offset of the canvas within its container
    const offsetX = canvasRect.left - containerRect.left + container.scrollLeft;
    const offsetY = canvasRect.top - containerRect.top + container.scrollTop;
    
    // Update the overlay container position
    if (overlayRef.current) {
      overlayRef.current.style.left = `${offsetX}px`;
      overlayRef.current.style.top = `${offsetY}px`;
      overlayRef.current.style.width = `${canvas.width}px`;
      overlayRef.current.style.height = `${canvas.height}px`;
    }
  }, [pageLinks]);

  // Set up ResizeObserver to watch for canvas size changes
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Create ResizeObserver
    resizeObserverRef.current = new ResizeObserver(() => {
      updateOverlayPositions();
    });

    // Observe both canvas and container
    resizeObserverRef.current.observe(canvasRef.current);
    resizeObserverRef.current.observe(containerRef.current);

    // Also listen for scroll events on the container
    const container = containerRef.current;
    const handleScroll = () => updateOverlayPositions();
    container.addEventListener('scroll', handleScroll);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      container.removeEventListener('scroll', handleScroll);
    };
  }, [updateOverlayPositions]);

  // Update positions when links change
  useEffect(() => {
    if (pageLinks.length > 0) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        updateOverlayPositions();
        setOverlayReady(true);
      }, 100);
    } else {
      setOverlayReady(false);
    }
  }, [pageLinks, updateOverlayPositions]);

  // Generate thumbnails for visible range around current page
  const generateVisibleThumbnails = useCallback(async () => {
    if (!pdf || thumbnailsLoading) return;
    
    setThumbnailsLoading(true);
    const thumbs = [];
    const totalPages = pdf.numPages;
    
    // Generate thumbnails for pages around the current page
    const startPage = Math.max(1, pageNumber - 5);
    const endPage = Math.min(totalPages, pageNumber + 5);
    
    // Also include first few and last few pages
    const pagesToGenerate = new Set();
    
    // First 3 pages
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pagesToGenerate.add(i);
    }
    
    // Last 3 pages
    for (let i = Math.max(totalPages - 2, 1); i <= totalPages; i++) {
      pagesToGenerate.add(i);
    }
    
    // Pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pagesToGenerate.add(i);
    }
    
    // Convert to array and sort
    const sortedPages = Array.from(pagesToGenerate).sort((a, b) => a - b);
    
    for (const i of sortedPages) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.15 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        thumbs.push({
          pageNum: i,
          dataUrl: canvas.toDataURL(),
        });
      } catch (error) {
        console.error(`Error generating thumbnail for page ${i}:`, error);
      }
    }
    
    // Merge with existing thumbnails and sort
    setThumbnails(prev => {
      const existingPageNums = new Set(prev.map(t => t.pageNum));
      const newThumbs = thumbs.filter(t => !existingPageNums.has(t.pageNum));
      
      if (newThumbs.length === 0) return prev;
      
      const combined = [...prev, ...newThumbs];
      return combined.sort((a, b) => a.pageNum - b.pageNum);
    });
    
    setThumbnailsLoading(false);
  }, [pdf, pageNumber, thumbnailsLoading]);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  // Generate thumbnails when PDF loads or page changes
  useEffect(() => {
    if (pdf && showThumbnails) {
      generateVisibleThumbnails();
    }
  }, [pdf, showThumbnails, pageNumber, generateVisibleThumbnails]);

  // Scroll to active thumbnail
  useEffect(() => {
    if (thumbnailContainerRef.current && thumbnails.length > 0) {
      const activeThumbnail = thumbnailContainerRef.current.querySelector('.thumbnail.active');
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [pageNumber, thumbnails]);

  // Handle external page changes from AI
  useEffect(() => {
    if (currentPage && currentPage !== pageNumber && currentPage <= numPages) {
      setPageNumber(currentPage);
    }
  }, [currentPage, numPages]);

  // Calculate scale for page width
  const calculateScale = useCallback((page, container) => {
    if (scale === 'page-width' && container) {
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = container.clientWidth - 40;
      return containerWidth / viewport.width;
    }
    return typeof scale === 'number' ? scale : 1.0;
  }, [scale]);

  // Render PDF page
  useEffect(() => {
    if (!pdf || !containerRef.current) return;

    const renderPage = async () => {
      // Cancel any ongoing render task
      if (renderTask) {
        renderTask.cancel();
      }

      try {
        setPageLoading(true);
        setOverlayReady(false);
        const page = await pdf.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        const pageScale = calculateScale(page, containerRef.current);
        const viewport = page.getViewport({ scale: pageScale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        setRenderTask(task);
        await task.promise;
        
        // Extract PDF annotations (links)
        try {
          const annotations = await page.getAnnotations();
          const links = [];
          
          annotations.forEach((annotation, index) => {
            if (annotation.subtype === 'Link' && annotation.url) {
              const linkType = getLinkType(annotation.url);
              const isVideo = isVideoLink(annotation.url);
              
              // Convert PDF coordinates to canvas coordinates
              const rect = annotation.rect;
              const x = rect[0] * pageScale;
              const y = (viewport.height - rect[3] * pageScale);
              const width = (rect[2] - rect[0]) * pageScale;
              const height = (rect[3] - rect[1]) * pageScale;
              
              links.push({
                id: `link-${index}`,
                url: annotation.url,
                type: linkType,
                videoType: isVideo ? getVideoType(annotation.url) : null,
                isVideo,
                rect: { x, y, width, height },
                tooltip: isVideo ? 'Click to play video' : 'Click to open link'
              });
            }
          });
          
          setPageLinks(links);
        } catch (annotationError) {
          console.error('Error extracting annotations:', annotationError);
          setPageLinks([]);
        }
        
        setPageLoading(false);
      } catch (error) {
        if (error.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', error);
        }
        setPageLoading(false);
      }
    };

    renderPage();
  }, [pdf, pageNumber, scale, calculateScale]);

  // Navigation functions
  const previousPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  };

  const nextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  };

  const goToPage = (page) => {
    const pageNum = Math.min(Math.max(1, page), numPages);
    setPageNumber(pageNum);
    onPageChange?.(pageNum);
  };

  const zoomIn = () => {
    if (scale === 'page-width') {
      setScale(1.2);
    } else {
      setScale(prev => Math.min(prev + 0.2, 3));
    }
  };

  const zoomOut = () => {
    if (scale === 'page-width') {
      setScale(0.8);
    } else {
      setScale(prev => Math.max(prev - 0.2, 0.5));
    }
  };

  const fitToWidth = () => setScale('page-width');

  // Handle link clicks
  const handleLinkClick = (link) => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="pdf-viewer-container">
        <div className="pdf-loading">
          <div className="loading-spinner"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      {/* PDF Controls - Clean Horizontal Layout */}
      <div className="pdf-controls">
        <div className="pdf-controls-group">
          <button 
            onClick={previousPage} 
            disabled={pageNumber <= 1}
            className="pdf-nav-btn"
            title="Previous page"
          >
            ←
          </button>
          <span className="pdf-page-info">
            Page <input
              type="number"
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="page-input"
              min="1"
              max={numPages}
            /> of {numPages}
          </span>
          <button 
            onClick={nextPage} 
            disabled={pageNumber >= numPages}
            className="pdf-nav-btn"
            title="Next page"
          >
            →
          </button>
        </div>
        
        <div className="pdf-controls-group">
          <button 
            onClick={() => setShowThumbnails(!showThumbnails)} 
            className={`pdf-toggle-btn ${showThumbnails ? 'active' : ''}`}
            title="Toggle thumbnails"
          >
            🖼️ Thumbnails
          </button>
        </div>
      </div>

      {/* Table of Contents */}
      {/* TOC section removed - sections should only appear at bottom */}

      {/* PDF Canvas with Zoom Controls */}
      <div className="pdf-canvas-wrapper">
        {/* Zoom Controls Overlay */}
        <div className="pdf-zoom-controls">
          <button onClick={zoomOut} className="pdf-zoom-btn" title="Zoom out">−</button>
          <button onClick={fitToWidth} className="pdf-zoom-btn fit-width" title="Fit to width">
            {scale === 'page-width' ? 'Fit Width' : `${Math.round((typeof scale === 'number' ? scale : 1) * 100)}%`}
          </button>
          <button onClick={zoomIn} className="pdf-zoom-btn" title="Zoom in">+</button>
        </div>

        <div className="pdf-canvas-container" ref={containerRef}>
          {pageLoading && (
            <div className="page-loading-overlay">
              <div className="loading-spinner small"></div>
            </div>
          )}
          <canvas ref={canvasRef} className="pdf-canvas" />
          
          {/* Links Overlay */}
          {pageLinks.length > 0 && overlayReady && (
            <div 
              className="links-overlay" 
              ref={overlayRef}
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                opacity: overlayReady ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              {pageLinks.map((link) => (
                <div
                  key={link.id}
                  className={`link-overlay ${link.type}`}
                  data-video-type={link.videoType}
                  style={{
                    position: 'absolute',
                    left: `${link.rect.x}px`,
                    top: `${link.rect.y}px`,
                    width: `${link.rect.width}px`,
                    height: `${link.rect.height}px`,
                    pointerEvents: 'all'
                  }}
                  onClick={() => handleLinkClick(link)}
                  title={link.tooltip}
                >
                  {link.isVideo && (
                    <div className="video-play-overlay">
                      <div className="play-button">
                        <span className="play-icon">▶</span>
                      </div>
                      <div className="video-type-badge">
                        {link.videoType === 'youtube' && '📺'}
                        {link.videoType === 'vimeo' && '🎬'}
                        {link.videoType === 'video-file' && '🎥'}
                        {link.videoType === 'loom' && '🔗'}
                        {link.videoType === 'wistia' && '💼'}
                        {link.videoType === 'dailymotion' && '📺'}
                        {link.videoType === 'video' && '📹'}
                        {!link.videoType && '📹'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {showThumbnails && (
        <div className="pdf-thumbnails-container">
          <div className="pdf-thumbnails" ref={thumbnailContainerRef}>
            {thumbnails.length === 0 && thumbnailsLoading ? (
              <div className="thumbnails-loading">
                <div className="loading-spinner small"></div>
                <span>Loading thumbnails...</span>
              </div>
            ) : (
              <>
                {thumbnails.map((thumb) => (
                  <div
                    key={thumb.pageNum}
                    className={`thumbnail ${thumb.pageNum === pageNumber ? 'active' : ''}`}
                    onClick={() => goToPage(thumb.pageNum)}
                  >
                    <img src={thumb.dataUrl} alt={`Page ${thumb.pageNum}`} />
                    <span className="thumb-page-num">{thumb.pageNum}</span>
                  </div>
                ))}
                {numPages > 20 && thumbnails.length < numPages && (
                  <div className="thumbnail-placeholder">
                    <span>Navigate to load more pages...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Page Jump Indicator */}
      {currentPage && currentPage !== pageNumber && (
        <div className="page-jump-indicator">
          AI wants to show page {currentPage}
          <button onClick={() => goToPage(currentPage)}>Go</button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
