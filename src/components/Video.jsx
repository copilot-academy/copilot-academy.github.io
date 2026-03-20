import React from 'react';

/**
 * Responsive video embedding component for YouTube, Vimeo, or other iframe-based videos.
 *
 * Usage in MDX:
 *   import Video from '@site/src/components/Video';
 *   <Video url="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo Video" />
 */
export default function Video({url, title = 'Video'}) {
  if (!url) {
    return (
      <div className="video-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 0, height: '300px'}}>
        <p style={{color: 'var(--ifm-font-color-secondary)', fontStyle: 'italic'}}>
          Video coming soon
        </p>
      </div>
    );
  }

  return (
    <div className="video-container">
      <iframe
        src={url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
