import React from 'react';
import { LegalScreen } from '@/components/legal/LegalScreen';
import { PRIVACY_SECTIONS, PRIVACY_UPDATED_AT } from '@/features/legal/legalContent';

export default function PrivacyScreen() {
  return <LegalScreen title="Política de Privacidade" updatedAt={PRIVACY_UPDATED_AT} sections={PRIVACY_SECTIONS} />;
}
