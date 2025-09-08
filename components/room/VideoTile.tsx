"use client";

import * as React from "react";

/**
 * Generic video tile wrapper so VideoGrid's `import './VideoTile'` resolves.
 * It renders a video area (aspect-video), and optional header/footer overlays.
 * Any extra props are passed to the root <div> so existing handlers still work.
 */
type Props = React.HTMLAttributes<HTMLDivElement> & {
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function VideoTile({
  header,
  footer,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-black aspect-video ${className}`}
      {...rest}
    >
      {/* Content from VideoGrid (e.g., <video> elements) */}
      {children}

      {header ? (
        <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/60 text-white">
          {header}
        </div>
      ) : null}

      {footer ? (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
