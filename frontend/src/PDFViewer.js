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

// Table of Contents data - Updated with new sections and page numbers
const tableOfContents = [
  { num: '01', title: 'Strategy', page: 151 },
  { num: '02', title: 'Innovation', page: 179 },
  { num: '03', title: 'Technology', page: 210 },
  { num: '04', title: 'Content', page: 244 },
  { num: '05', title: 'Advertising', page: 269 },
  { num: '06', title: 'Web', page: 329 },
  { num: '07', title: 'Events', page: 368 },
  { num: '08', title: 'Public Relations', page: 391 },
  { num: '09', title: 'Crisis', page: 418 },
  { num: '10', title: 'Production', page: 448 },
  { num: '12', title: 'Account Management', page: 485 },
  { num: '13', title: 'Analytics', page: 506 },
  { num: '14', title: 'Team', page: 528 },
  { num: '15', title: 'SMEs', page: 541 },
  { num: '16', title: 'Social', page: 558 },
  { num: '17', title: 'Media Buying', page: 602 },
];








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
        // Calculate scale to fit the thumbnail dimensions
        const desiredWidth = 160;
        const desiredHeight = 90;
        const viewport = page.getViewport({ scale: 1 });
        
        // Calculate scale to cover the thumbnail area
        const scaleX = desiredWidth / viewport.width;
        const scaleY = desiredHeight / viewport.height;
        const scale = Math.max(scaleX, scaleY) * 1.2; // Slightly larger to ensure coverage
        
        const scaledViewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = desiredHeight;
        canvas.width = desiredWidth;
        
        // Calculate centering offsets
        const offsetX = (desiredWidth - scaledViewport.width) / 2;
        const offsetY = 0; // Top-aligned
        
        // Save context state
        context.save();
        
        // Clip to thumbnail dimensions
        context.rect(0, 0, desiredWidth, desiredHeight);
        context.clip();
        
        // Translate for centering
        context.translate(offsetX, offsetY);
        
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;
        
        // Restore context state
        context.restore();
        
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
              
              links.push({
                id: `link-${index}`,
                url: annotation.url,
                type: linkType,
                videoType: isVideo ? getVideoType(annotation.url) : null,
                isVideo,
                displayUrl: annotation.url.length > 50 ? annotation.url.substring(0, 50) + '...' : annotation.url
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
        </div>
      </div>

      {/* Page Links - Simple minimal display under PDF */}
      {pageLinks.length > 0 && (
        <div className="page-links">
          <div className="page-links-header">Links on this page:</div>
          <div className="page-links-list">
            {pageLinks.map((link, index) => (
              <React.Fragment key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`page-link ${link.type}`}
                  title={link.url}
                >
                  {link.isVideo && <span className="link-icon">🎥</span>}
                  {link.displayUrl}
                </a>
                {index < pageLinks.length - 1 && <span className="link-separator"> <i className="fas fa-chevron-right"></i> </span>}
              </React.Fragment>
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