import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ensureNotificationPermission } from './notificationPermission';

const CHANNEL_ID = 'rest-timer';

let channelReady: Promise<void> | null = null;

function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Timer de descanso',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    }).then(() => undefined);
  }
  return channelReady;
}

/**
 * Agenda o aviso de fim de descanso como notificação nativa — dispara mesmo
 * com a tela travada ou o app em segundo plano, diferente do haptic in-app.
 * Retorna null (sem agendar) se a permissão foi negada.
 */
export async function scheduleRestEndNotification(seconds: number): Promise<string | null> {
  if (seconds <= 0) return null;
  const allowed = await ensureNotificationPermission();
  if (!allowed) return null;
  await ensureChannel();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Descanso concluído',
      body: 'Hora de voltar para a próxima série 💪',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelRestEndNotification(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Já disparou ou foi cancelada — sem problema.
  }
}
