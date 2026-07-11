// client-side UTM & visitor tracking service
'use client';

function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface UtmData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_page: string | null;
  referrer: string | null;
  first_visit_at: string | null;
}

const STORAGE_KEYS = {
  VISITOR_ID: 'mh_visitor_id',
  UTM_DATA: 'mh_utm_data',
};

// Initialize visitor tracking
export function initVisitorTracking() {
  if (typeof window === 'undefined') return;

  // 1. Get or create Visitor ID (UUID)
  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId);
  }

  // 2. Capture UTM params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmContent = urlParams.get('utm_content');
  const utmTerm = urlParams.get('utm_term');

  const savedUtm = localStorage.getItem(STORAGE_KEYS.UTM_DATA);
  const utmData: UtmData = savedUtm ? JSON.parse(savedUtm) : {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    landing_page: null,
    referrer: null,
    first_visit_at: null,
  };

  // If there are new UTM parameters, override current ones
  if (utmSource || utmMedium || utmCampaign) {
    utmData.utm_source = utmSource || 'organic';
    utmData.utm_medium = utmMedium;
    utmData.utm_campaign = utmCampaign;
    utmData.utm_content = utmContent;
    utmData.utm_term = utmTerm;
  } else if (!utmData.utm_source) {
    // Determine organic or direct
    const ref = document.referrer;
    if (ref) {
      const refUrl = new URL(ref);
      if (refUrl.hostname !== window.location.hostname) {
        utmData.utm_source = 'referral';
        utmData.utm_medium = 'referral';
        utmData.utm_campaign = refUrl.hostname;
      } else {
        utmData.utm_source = 'direct';
      }
    } else {
      utmData.utm_source = 'direct';
    }
  }

  // Record landing page & referrer if not set
  if (!utmData.landing_page) {
    utmData.landing_page = window.location.href.split('?')[0];
    utmData.referrer = document.referrer || 'direct';
    utmData.first_visit_at = new Date().toISOString();
  }

  localStorage.setItem(STORAGE_KEYS.UTM_DATA, JSON.stringify(utmData));
}

// Retrieve current visitor ID
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId);
  }
  return visitorId;
}

// Retrieve captured UTM data
export function getUtmData(): UtmData {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      landing_page: null,
      referrer: null,
      first_visit_at: null,
    };
  }

  const saved = localStorage.getItem(STORAGE_KEYS.UTM_DATA);
  if (saved) {
    return JSON.parse(saved);
  }

  // Fallback if not initialized
  const ref = document.referrer;
  return {
    utm_source: ref ? 'referral' : 'direct',
    utm_medium: ref ? 'referral' : null,
    utm_campaign: ref ? new URL(ref).hostname : null,
    utm_content: null,
    utm_term: null,
    landing_page: window.location.href.split('?')[0],
    referrer: ref || 'direct',
    first_visit_at: new Date().toISOString(),
  };
}
