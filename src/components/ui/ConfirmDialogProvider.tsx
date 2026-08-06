import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ConfirmAction, ConfirmDialog } from './ConfirmDialog';

export interface ConfirmOptions {
  title: string;
  message?: string;
  actions: ConfirmAction[];
}

type ConfirmFn = (options: ConfirmOptions) => Promise<string>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Substitui o Alert.alert nativo em todo o app por um modal no visual do
 * Forge. Montado uma vez na raiz (app/_layout.tsx); qualquer tela chama
 * useConfirm() e não precisa renderizar nada — o diálogo vive aqui.
 */
export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((key: string) => void) | undefined>(undefined);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState(options);
    });
  }, []);

  function handlePress(key: string) {
    setState(null);
    resolverRef.current?.(key);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <ConfirmDialog
          visible
          title={state.title}
          message={state.message}
          actions={state.actions}
          onPress={handlePress}
          onRequestClose={() => handlePress('cancel')}
        />
      )}
    </ConfirmContext.Provider>
  );
}

/**
 * `const action = await confirm({ title, message, actions })` — resolve com
 * a `key` da ação tocada, ou `'cancel'` se fechado pelo botão de voltar do
 * Android/toque fora. Para alertas simples de 1 botão, dispensa o await.
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm precisa estar dentro de ConfirmDialogProvider');
  return ctx;
}
