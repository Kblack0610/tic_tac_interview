import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useSettingsStore } from '../store/settings-store';

export function useHaptics() {
  const enabled = useSettingsStore((s) => s.hapticsEnabled);

  const light = useCallback(() => {
    if (enabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [enabled]);

  const medium = useCallback(() => {
    if (enabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [enabled]);

  const heavy = useCallback(() => {
    if (enabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [enabled]);

  const success = useCallback(() => {
    if (enabled && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [enabled]);

  const error = useCallback(() => {
    if (enabled && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [enabled]);

  return { light, medium, heavy, success, error };
}
