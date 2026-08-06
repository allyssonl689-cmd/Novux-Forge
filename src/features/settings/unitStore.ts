import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type WeightUnit = 'kg' | 'lb';

interface UnitState {
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
}

/**
 * Unidade de peso preferida. Tudo continua guardado em kg no banco — só a
 * exibição/entrada na UI converte (ver src/lib/units.ts). Trocar a unidade
 * não migra dado nenhum, só muda como os mesmos números são mostrados.
 */
export const useUnitStore = create<UnitState>()(
  persist(
    (set) => ({
      unit: 'kg',
      setUnit: (unit) => set({ unit }),
    }),
    {
      name: 'novux-forge:unit',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
