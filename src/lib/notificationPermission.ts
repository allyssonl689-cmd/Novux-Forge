import * as Notifications from 'expo-notifications';

/**
 * Permissão de notificação compartilhada entre o timer de descanso e o
 * lembrete de treino — pede uma vez, guarda "negado" em memória para não
 * reabrir o prompt do sistema a cada chamada na mesma sessão do app.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionDenied = false;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (permissionDenied) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  if (requested.status !== 'granted') permissionDenied = true;
  return requested.status === 'granted';
}
