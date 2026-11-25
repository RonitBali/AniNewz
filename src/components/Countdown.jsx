import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

// "Ep 5 in 2d 4h" until a unix timestamp (seconds). Updates every 30s.
const formatRemaining = (airingAt, now = Date.now()) => {
  const secs = Math.max(0, airingAt - Math.floor(now / 1000));
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const Countdown = ({ next, className = '' }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!next) return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [next]);

  if (!next) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Clock className="h-3.5 w-3.5" />
      Ep {next.episode} in {formatRemaining(next.airingAt, now)}
    </span>
  );
};

export default Countdown;
