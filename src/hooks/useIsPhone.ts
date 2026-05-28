import { useEffect, useState } from 'react';

function detectPhoneBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  const navigatorWithHints = window.navigator as Navigator & {
    userAgentData?: {
      mobile?: boolean;
    };
  };

  if (navigatorWithHints.userAgentData?.mobile) {
    return true;
  }

  const userAgent = navigatorWithHints.userAgent || '';
  if (/Android.+Mobile|iPhone|iPod|Windows Phone|Mobi/i.test(userAgent)) {
    return true;
  }

  return false;
}

export function useIsPhone(): boolean {
  const [isPhone, setIsPhone] = useState(() => detectPhoneBrowser());

  useEffect(() => {
    setIsPhone(detectPhoneBrowser());
  }, []);

  return isPhone;
}
