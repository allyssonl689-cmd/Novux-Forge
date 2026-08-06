import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ensureNotificationPermission } from './notificationPermission';

const CHANNEL_ID = 'workout-reminder';
const REMINDER_TAG = 'workout-reminder';

let channelReady: Promise<void> | null = null;

function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembrete de treino',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    }).then(() => undefined);
  }
  return channelReady;
}

export interface ReminderPlanEntry {
  /** 0 = domingo … 6 = sábado, mesma convenção de weekly_plan */
  weekday: number;
  workoutName: string;
}

/**
 * Reagenda os lembretes semanais a partir do zero: cancela os antigos
 * (identificados pela tag em `content.data`) e cria um por dia com ficha
 * marcada na agenda. Dias de descanso (sem entrada) não recebem lembrete.
 * Chamar de novo sempre que a agenda semanal ou o horário/preferência mudar.
 */
export async function rescheduleWorkoutReminders(
  entries: ReminderPlanEntry[],
  hour: number,
  minute: number,
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.tag === REMINDER_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
  );

  if (entries.length === 0) return;

  const allowed = await ensureNotificationPermission();
  if (!allowed) return;
  await ensureChannel();

  await Promise.all(
    entries.map((entry) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hoje é dia de treino!',
          body: `${entry.workoutName} — bora treinar? 💪`,
          sound: 'default',
          data: { tag: REMINDER_TAG },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          // weekday da API é 1=domingo…7=sábado; o nosso é 0=domingo…6=sábado.
          weekday: entry.weekday + 1,
          hour,
          minute,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );
}

export async function cancelWorkoutReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.tag === REMINDER_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
  );
}
