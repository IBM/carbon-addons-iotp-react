import { useEffect, useState } from 'react';

const useHasTextOverflow = (elementRef, text = '') => {
  const [isOverflowed, setIsOverflowed] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (elementRef.current) {
        setIsOverflowed(
          elementRef.current.scrollHeight > elementRef.current.clientHeight ||
            elementRef.current.scrollWidth > elementRef.current.clientWidth
        );
      }
    };

    checkOverflow();

    // Optionally add a resize listener
    const handleResize = () => checkOverflow();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [elementRef, text]);

  return isOverflowed;
};

export default useHasTextOverflow;
