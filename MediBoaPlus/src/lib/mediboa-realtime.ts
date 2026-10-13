import { useEffect } from 'react';
import { supabase } from './supabase';

type RealtimeTable =
  | 'appointments'
  | 'profiles'
  | 'notifications'
  | 'health_profiles';

type RefreshCallback = () => void | Promise<void>;

export function useMediboaRealtime(
  tables: RealtimeTable[],
  refresh: RefreshCallback
) {
  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const channelName =
      `mediboa-live-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    let channel = supabase.channel(channelName);

    const refreshAfterChange = () => {
      if (disposed) return;

      if (timer) clearTimeout(timer);

      // Combine bursts of database events into one refresh.
      timer = setTimeout(() => {
        if (!disposed) {
          void Promise.resolve(refresh()).catch(error => {
            console.error('Realtime refresh failed:', error);
          });
        }
      }, 350);
    };

    for (const table of [...new Set(tables)]) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        refreshAfterChange
      );
    }

    channel.subscribe(status => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn(
          `MediBoa+ Realtime subscription status: ${status}. Manual refresh remains available.`
        );
      }
    });

    return () => {
      disposed = true;

      if (timer) clearTimeout(timer);

      void supabase.removeChannel(channel);
    };
  }, [refresh, tables.join(',')]);
}
