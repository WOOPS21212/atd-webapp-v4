import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages } from '@fortawesome/free-solid-svg-icons';

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

const PDFViewer = ({ pdfUrl, currentPage, onPageChange, showSections = true }) => {
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState('page-width');
  const [baseScale, setBaseScale] = useState(1);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, numPages]);

  // Calculate scale for page width
  const calculateScale = useCallback((page, container) => {
    if (scale === 'page-width' && container) {
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = container.clientWidth; // Use full container width
      const newScale = containerWidth / viewport.width;
      setBaseScale(newScale); // ✅ Save base scale
      return newScale;
    }

    return typeof scale === 'number' ? scale : baseScale;
  }, [scale, baseScale]);

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
              const y = (viewport.height - rect[3]) * pageScale; // PDF Y coordinates are bottom-up
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setScale(prev => {
      if (prev === 'page-width') return baseScale + 0.2;
      return typeof prev === 'number' ? prev + 0.2 : baseScale + 0.2;
    });
  };

  const zoomOut = () => {
    setScale(prev => {
      if (prev === 'page-width') return baseScale - 0.2;
      return typeof prev === 'number' ? Math.max(prev - 0.2, 0.1) : baseScale - 0.2;
    });
  };

  const fitToWidth = () => setScale('page-width');

  // Handle link clicks
  const handleLinkClick = (link) => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
  return (
    <div className={`pdf-viewer-container ${showSections ? 'pdf-viewer-with-sections' : 'pdf-viewer-without-sections'}`}>
        <div className="pdf-loading">
          <div className="loading-spinner"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer-container ${showSections ? 'pdf-viewer-with-sections' : 'pdf-viewer-without-sections'}`}>
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
            <FontAwesomeIcon icon={faImages} />
          </button>
        </div>
      </div>


      {/* PDF Canvas with Zoom Controls */}
      <div className="pdf-canvas-wrapper">
        {/* Zoom Controls Overlay */}
        <div className="pdf-zoom-controls">
          <button onClick={zoomOut} className="pdf-zoom-btn" title="Zoom out">−</button>
          <button onClick={fitToWidth} className="pdf-zoom-btn fit-width" title="Fit to width">
            {scale === 'page-width' ? 'Fit Width' : `${Math.round((typeof scale === 'number' ? scale : baseScale) * 100)}%`}
          </button>
          <button onClick={zoomIn} className="pdf-zoom-btn" title="Zoom in">+</button>
        </div>

        <div className="pdf-canvas-container" ref={containerRef}>
          {pageLoading && (
            <div className="page-loading-overlay">
              <div className="loading-spinner small"></div>
            </div>
          )}
          
          {/* Canvas Container */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <canvas ref={canvasRef} className="pdf-canvas" />
          </div>
        </div>
      </div>

      {/* Page Links Section */}
      {pageLinks.length > 0 && (
        <div className="pdf-links-container">
          <div className="pdf-links-header">
            <h4>Links on this page</h4>
          </div>
          <div className="pdf-links-list">
            {pageLinks.map((link) => (
              <div
                key={link.id}
                className={`pdf-link-item ${link.type}`}
                onClick={() => handleLinkClick(link)}
                title={link.tooltip}
              >
                <div className="link-url">{link.url}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                    <div className="thumb-viewport">
                      <img src={thumb.dataUrl} alt={`Page ${thumb.pageNum}`} />
                    </div>
                    <span className="thumb-page-num">{thumb.pageNum}</span>
                  </div>
                ))}
                {/* Show placeholder for missing pages */}
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
