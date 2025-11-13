import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePopup, PopupFrequency } from '@/context/PopupContext';
import { useLocation } from 'react-router-dom';
import { X, Clock } from 'lucide-react';

const SESSION_FLAG_KEY = 'ks_popup_session_dismissed';
const DAILY_FLAG_KEY = 'ks_popup_daily_dismissed';

type TimerState = {
  minutes: number;
  seconds: number;
};

const formatTimer = (remaining: number): TimerState => ({
  minutes: Math.floor(remaining / 60),
  seconds: remaining % 60,
});

const matchesRoute = (pages: string[], pathname: string) => {
  if (pages.includes('*')) return true;
  return pages.some((page) => {
    if (page === pathname) return true;
    if (page.endsWith('/:id')) {
      const base = page.replace('/:id', '');
      return pathname.startsWith(base);
    }
    return false;
  });
};

const shouldRespectFrequency = (frequency: PopupFrequency, lastDismissed?: string) => {
  if (frequency === 'always') return false;
  if (frequency === 'once-per-session') {
    return typeof window !== 'undefined' && sessionStorage.getItem(SESSION_FLAG_KEY) === '1';
  }
  if (!lastDismissed || typeof window === 'undefined') return false;
  if (frequency === 'once-per-day') {
    const last = new Date(lastDismissed);
    const now = new Date();
    const diff = now.getTime() - last.getTime();
    return diff < 24 * 60 * 60 * 1000 || localStorage.getItem(DAILY_FLAG_KEY) === now.toDateString();
  }
  return false;
};

const rememberFrequency = (frequency: PopupFrequency) => {
  if (typeof window === 'undefined') return;
  if (frequency === 'once-per-session') {
    sessionStorage.setItem(SESSION_FLAG_KEY, '1');
  }
  if (frequency === 'once-per-day') {
    localStorage.setItem(DAILY_FLAG_KEY, new Date().toDateString());
  }
};

const PopupAnnouncement: React.FC = () => {
  const { settings, recordImpression, recordClick, recordDismissal, updateState } = usePopup();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(settings.timerDuration * 60);

  const timerState = useMemo(() => formatTimer(Math.max(remainingSeconds, 0)), [remainingSeconds]);

  const hidePopup = useCallback(() => {
    setVisible(false);
    recordDismissal();
    rememberFrequency(settings.frequency);
  }, [recordDismissal, settings.frequency]);

  const handleAction = useCallback(() => {
    recordClick();
    rememberFrequency(settings.frequency);
  }, [recordClick, settings.frequency]);

  useEffect(() => {
    setRemainingSeconds(settings.timerDuration * 60);
  }, [settings.timerDuration, settings.title]);

  useEffect(() => {
    if (!settings.enabled) {
      setVisible(false);
      setReady(false);
      return;
    }

    if (!matchesRoute(settings.pages, location.pathname)) {
      setVisible(false);
      setReady(false);
      return;
    }

    if (shouldRespectFrequency(settings.frequency, settings.lastDismissedAt)) {
      setVisible(false);
      setReady(false);
      return;
    }

    const activate = () => {
      setReady(true);
      setVisible(true);
      recordImpression();
      updateState({ lastShownAt: new Date().toISOString() });
    };

    if (settings.trigger === 'delay') {
      const timeout = window.setTimeout(activate, Math.max(settings.delaySeconds, 1) * 1000);
      return () => window.clearTimeout(timeout);
    }

    if (settings.trigger === 'scroll') {
      const onScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        const progress = window.scrollY / scrollHeight;
        if (progress >= 0.5) {
          activate();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    if (settings.trigger === 'exit-intent') {
      const onMouseLeave = (event: MouseEvent) => {
        if (event.clientY <= 0) {
          activate();
          document.removeEventListener('mouseleave', onMouseLeave);
        }
      };
      document.addEventListener('mouseleave', onMouseLeave);
      return () => document.removeEventListener('mouseleave', onMouseLeave);
    }

    return undefined;
  }, [location.pathname, recordImpression, settings, updateState]);

  useEffect(() => {
    if (!visible || !settings.showTimer) return;
    if (remainingSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [remainingSeconds, settings.showTimer, visible]);

  if (!ready || !visible) {
    return null;
  }

  const isDark = settings.theme === 'dark';
  const containerClass = `fixed inset-x-4 bottom-6 z-50 sm:left-auto sm:right-6 sm:w-[360px] rounded-2xl border shadow-2xl p-5 transition-all duration-300 ${
    isDark
      ? 'bg-zinc-950/95 border-zinc-800/80 text-zinc-50 backdrop-blur'
      : 'bg-white border-zinc-200 text-zinc-900'
  }`;

  return (
    <aside className={containerClass} role="dialog" aria-live="polite">
      <button
        type="button"
        onClick={hidePopup}
        className={`absolute right-3 top-3 rounded-full p-1 transition-colors ${
          isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900'
        }`}
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold leading-tight">{settings.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {settings.message}
          </p>
        </div>
        {settings.showTimer && remainingSeconds > 0 && (
          <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
            <Clock className="h-4 w-4" />
            <span>
              Offer expires in {String(timerState.minutes).padStart(2, '0')}:{String(timerState.seconds).padStart(2, '0')}
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            asChild
            className="flex-1"
            size="sm"
          >
            <a href={settings.buttonHref} target="_blank" rel="noopener noreferrer" onClick={handleAction}>
              {settings.buttonText}
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={hidePopup}>
            Maybe later
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default PopupAnnouncement;
