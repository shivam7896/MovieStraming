import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';

export default function MediaRow({
  title,
  items,
  isTop10 = false,
  onPlay,
  onMoreInfo,
  myList,
  onToggleMyList,
  onRemoveFromHistory
}) {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isRowActive, setIsRowActive] = useState(false);

  if (!items || items.length === 0) return null;

  const handleScroll = (direction) => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const scrollAmount = clientWidth * 0.78;

    const newScrollLeft =
      direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

    rowRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const checkScrollPosition = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 25);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 25);
  };

  useEffect(() => {
    checkScrollPosition();
  }, [items]);

  return (
    <section
      className={`media-row-section ${isRowActive ? 'is-row-active' : ''}`}
      style={isRowActive ? { zIndex: 120 } : { zIndex: 1 }}
    >
      <h2 className="media-row-title">{title}</h2>

      <div
        className="media-row-slider-container"
        style={isRowActive ? { zIndex: 120 } : { zIndex: 1 }}
      >
        {/* Left Arrow with Smooth Fade Transition */}
        <button
          className={`slider-arrow left ${showLeftArrow ? 'visible' : ''}`}
          onClick={() => handleScroll('left')}
          aria-label="Previous items"
          tabIndex={showLeftArrow ? 0 : -1}
        >
          <ChevronLeft size={28} />
        </button>

        {/* Carousel Tracks */}
        <div
          ref={rowRef}
          className="media-row-track no-scrollbar"
          onScroll={checkScrollPosition}
        >
          {items.map((media, idx) => (
            <MediaCard
              key={media.id}
              media={media}
              rank={idx + 1}
              isTop10={isTop10}
              onPlay={onPlay}
              onMoreInfo={onMoreInfo}
              myList={myList}
              onToggleMyList={onToggleMyList}
              onCardHover={setIsRowActive}
              onRemoveFromHistory={onRemoveFromHistory}
            />
          ))}
        </div>

        {/* Right Arrow with Smooth Fade Transition */}
        <button
          className={`slider-arrow right ${showRightArrow ? 'visible' : ''}`}
          onClick={() => handleScroll('right')}
          aria-label="Next items"
          tabIndex={showRightArrow ? 0 : -1}
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
}
