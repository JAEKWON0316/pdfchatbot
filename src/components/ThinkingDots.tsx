import { useEffect, useState } from 'react';

const DOTS = [0, 1, 2];

export default function ThinkingDots() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((a) => (a + 1) % 3);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex items-end gap-1 select-none">
      {DOTS.map((n) => (
        <span
          key={n}
          className={`transition-all duration-200 rounded-full bg-blue-200`}
          style={{
            display: 'inline-block',
            width: n === active ? 14 : 9,
            height: n === active ? 14 : 9,
            opacity: n === active ? 1 : 0.5,
            transform: n === active ? 'scale(1.3)' : 'scale(1)',
            marginBottom: n === active ? 0 : 2,
          }}
        />
      ))}
    </span>
  );
} 