import React from 'react';
import { LegalScreen } from '@/components/legal/LegalScreen';
import { TERMS_SECTIONS, TERMS_UPDATED_AT } from '@/features/legal/legalContent';

export default function TermsScreen() {
  return <LegalScreen title="Termos de Uso" updatedAt={TERMS_UPDATED_AT} sections={TERMS_SECTIONS} />;
}
