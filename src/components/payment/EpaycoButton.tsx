'use client';

import { useEffect, useRef } from 'react';

interface EpaycoButtonData {
  publicKey: string;
  amount: number;
  tax?: number;
  taxIco?: number;
  taxBase?: number;
  name: string;
  description: string;
  currency: string;
  country: string;
  test: boolean;
  responseUrl?: string;
  confirmationUrl?: string;
  externalRef?: string;
}

interface EpaycoButtonProps {
  buttonData: EpaycoButtonData;
  onResponse?: (response: any) => void;
  onError?: (error: any) => void;
  buttonImageUrl?: string;
}

declare global {
  interface Window {
    ePayco: any;
  }
}

export default function EpaycoButton({
  buttonData,
  onResponse,
  onError,
  buttonImageUrl = 'https://multimedia.epayco.co/dashboard/btns/btn5.png',
}: EpaycoButtonProps) {
  const scriptLoaded = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.epayco.co/checkout.js';
    script.className = 'epayco-button';
    script.setAttribute('data-epayco-key', buttonData.publicKey);
    script.setAttribute('data-epayco-amount', buttonData.amount.toString());
    script.setAttribute('data-epayco-name', buttonData.name);
    script.setAttribute('data-epayco-description', buttonData.description);
    script.setAttribute('data-epayco-currency', buttonData.currency);
    script.setAttribute('data-epayco-country', buttonData.country);
    script.setAttribute('data-epayco-test', buttonData.test.toString());
    script.setAttribute('data-epayco-external', 'false');
    script.setAttribute('data-epayco-button', buttonImageUrl);

    if (buttonData.tax !== undefined) {
      script.setAttribute('data-epayco-tax', buttonData.tax.toString());
    }
    if (buttonData.taxIco !== undefined) {
      script.setAttribute('data-epayco-tax-ico', buttonData.taxIco.toString());
    }
    if (buttonData.taxBase !== undefined) {
      script.setAttribute('data-epayco-tax-base', buttonData.taxBase.toString());
    }
    if (buttonData.responseUrl) {
      script.setAttribute('data-epayco-response', buttonData.responseUrl);
    }
    if (buttonData.confirmationUrl) {
      script.setAttribute('data-epayco-confirmation', buttonData.confirmationUrl);
    }
    if (buttonData.externalRef) {
      script.setAttribute('data-epayco-extra1', buttonData.externalRef);
    }

    script.onload = () => {
      scriptLoaded.current = true;
      console.log('ePayco script loaded successfully');
    };

    script.onerror = (error) => {
      console.error('Error loading ePayco script:', error);
      if (onError) {
        onError(error);
      }
    };

    if (formRef.current) {
      formRef.current.appendChild(script);
    }

    return () => {
      if (formRef.current && script.parentNode) {
        formRef.current.removeChild(script);
      }
    };
  }, [buttonData, buttonImageUrl, onError]);

  // Listener para la respuesta de ePayco
  useEffect(() => {
    const handleEpaycoResponse = (event: MessageEvent) => {
      if (event.data && event.data.x_response) {
        if (onResponse) {
          onResponse(event.data);
        }
      }
    };

    window.addEventListener('message', handleEpaycoResponse);

    return () => {
      window.removeEventListener('message', handleEpaycoResponse);
    };
  }, [onResponse]);

  return (
    <div className="epayco-button-container">
      <form ref={formRef}></form>
    </div>
  );
}
