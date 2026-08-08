/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { getSiteSettings } from '../services/settingsService';

interface Branding {
  logoUrl: string;
  faviconUrl: string;
}

const DEFAULT_BRANDING: Branding = {
  logoUrl: '',
  faviconUrl: ''
};

function applyFavicon(faviconUrl: string) {
  if (!faviconUrl) return;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

export function useBranding(): Branding {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const settings = await getSiteSettings();
        if (isMounted && settings) {
          const next = {
            logoUrl: settings.logoUrl || '',
            faviconUrl: settings.faviconUrl || ''
          };
          setBranding(next);
          applyFavicon(next.faviconUrl);
        }
      } catch (error) {
        console.error('Failed to load branding', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return branding;
}
