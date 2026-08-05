import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelRestEndNotification, scheduleRestEndNotification } from '@/lib/restNotifications';

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

/**
 * Cronômetro regressivo de descanso entre séries. Ao zerar, chama `onDone`
 * uma única vez (usado para haptic + som). Permite ajustar e pular.
 */
export function useRestTimer(onDone?: () => void) {
  const [total, setTotal] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Notificação nativa agendada para o fim do descanso — avisa mesmo com a
  // tela travada, quando o haptic in-app não é percebido.
  const notificationIdRef = useRef<string | null>(null);

  const rescheduleNotification = useCallback((seconds: number) => {
    const pending = notificationIdRef.current;
    notificationIdRef.current = null;
    cancelRestEndNotification(pending);
    scheduleRestEndNotification(seconds).then((id) => {
      notificationIdRef.current = id;
    });
  }, []);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clear();
      if (seconds <= 0) {
        setRunning(false);
        return;
      }
      setTotal(seconds);
      setSecondsLeft(seconds);
      setRunning(true);
      rescheduleNotification(seconds);
    },
    [clear, rescheduleNotification],
  );

  const stop = useCallback(() => {
    clear();
    setRunning(false);
    setSecondsLeft(0);
    const pending = notificationIdRef.current;
    notificationIdRef.current = null;
    cancelRestEndNotification(pending);
  }, [clear]);

  /** Soma/subtrai segundos ao descanso em andamento (ex.: −15 / +15) */
  const adjust = useCallback((delta: number) => {
    setSecondsLeft((s) => {
      const next = Math.max(0, s + delta);
      setTotal((t) => Math.max(t, next));
      rescheduleNotification(next);
      return next;
    });
  }, [rescheduleNotification]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clear();
          setRunning(false);
          notificationIdRef.current = null;
          onDoneRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return clear;
  }, [running, clear]);

  // Se a tela some com o descanso rolando (voltar, sair do treino), cancela
  // o aviso pendente em vez de deixar disparar fora de contexto.
  useEffect(() => {
    return () => {
      cancelRestEndNotification(notificationIdRef.current);
    };
  }, []);

  return { total, secondsLeft, running, start, stop, adjust };
}

/**
 * Tempo decorrido desde um instante ISO. Diferente do useTimer, sobrevive ao app
 * ser fechado e reaberto no meio do treino — o relógio é a fonte de verdade,
 * não um contador em memória.
 */
export function useElapsedSeconds(startedAt: string | null): number {
  const compute = () =>
    startedAt ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)) : 0;

  const [seconds, setSeconds] = useState(compute);

  useEffect(() => {
    setSeconds(compute());
    if (!startedAt) return;
    const id = setInterval(() => setSeconds(compute()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return seconds;
}
