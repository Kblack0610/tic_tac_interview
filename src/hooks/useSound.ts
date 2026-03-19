import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSettingsStore } from '../store/settings-store';

type SoundName = 'place' | 'win' | 'lose' | 'draw' | 'click';

// We'll use programmatic audio feedback instead of files
// since we don't have actual .wav files yet
export function useSound() {
  const enabled = useSettingsStore((s) => s.soundEnabled);

  const play = useCallback(
    async (_name: SoundName) => {
      if (!enabled) return;
      // Sound files would be loaded here in production
      // For now, haptics provide the tactile feedback
    },
    [enabled],
  );

  return { play };
}
