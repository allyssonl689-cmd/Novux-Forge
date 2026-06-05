import { useEffect, useRef, useState } from 'react';

export function useTimer(autoStart = false) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start  = () => setRunning(true);
  const pause  = () => setRunning(false);
  const reset  = () => { setRunning(false); setSeconds(0); };

  return { seconds, running, start, pause, reset };
}
