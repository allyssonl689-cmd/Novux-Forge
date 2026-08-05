import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'rest-timer';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

let permissionDenied = false;

async function ensurePermission(): Promise<boolean> {
  if (permissionDenied) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  if (requested.status !== 'granted') permissionDenied = true;
  return requested.status === 'granted';
}

/**
 * Agenda o aviso de fim de descanso como notificação nativa — dispara mesmo
 * com a tela travada ou o app em segundo plano, diferente do haptic in-app.
 * Retorna null (sem agendar) se a permissão foi negada.
 */
export async function scheduleRestEndNotification(seconds: number): Promise<string | null> {
  if (seconds <= 0) return null;
  const allowed = await ensurePermission();
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
