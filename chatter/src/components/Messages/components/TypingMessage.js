import React, { useEffect, useState, useCallback } from 'react';

export default function Typing() {
  const [numberOfDots, setDots] = useState(1);

  const incrementDots = useCallback(() => {
    setDots(prev => prev === 3 ? 1 : prev + 1);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(incrementDots, 500);

    return () => {
      clearTimeout(timeout);
    }
  }, [incrementDots]);

  return (
    <p
      className="messages__message messages__message--typing"
      key="typing"
    >
      {`Typing${''.padStart(numberOfDots, '.')}`}
    </p>
  );
}
