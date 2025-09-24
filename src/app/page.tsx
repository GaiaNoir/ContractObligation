'use client';

import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import ContractProcessor from '@/components/ContractProcessor';

declare global {
  interface Window {
    PaystackPop: any;
    gtag?: (...args: any[]) => void;
  }
}

export default function Home() {
  const [showProcessor, setShowProcessor] = useState(false);

  if (!showProcessor) {
    return <LandingPage onGetStarted={() => setShowProcessor(true)} />;
  }

  return <ContractProcessor onBackToHomeAction={() => setShowProcessor(false)} />;
}