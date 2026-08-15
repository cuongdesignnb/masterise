'use client';

import { useEffect, useMemo } from 'react';

interface JsonLdProps {
  schema: Record<string, any> | Record<string, any>[] | null | undefined;
}

export default function JsonLd({ schema }: JsonLdProps) {
  // Clean empty values recursively to keep schema lightweight
  const cleanSchema = (obj: any): any => {
    if (Array.isArray(obj)) {
      const cleaned = obj.map(cleanSchema).filter(item => {
        return item !== null && item !== undefined && item !== '' && (!Array.isArray(item) || item.length > 0) && (typeof item !== 'object' || Object.keys(item).length > 0);
      });
      return cleaned.length > 0 ? cleaned : null;
    } else if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      Object.keys(obj).forEach((key) => {
        const val = cleanSchema(obj[key]);
        if (val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0) && (typeof val !== 'object' || Object.keys(val).length > 0)) {
          cleaned[key] = val;
        }
      });
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }
    return obj;
  };

  const serializedSchema = useMemo(() => {
    if (!schema) return null;

    const finalSchema = cleanSchema(schema);
    if (!finalSchema) return null;

    return JSON.stringify(finalSchema).replace(/</g, '\\u003c');
  }, [schema]);

  // Inject after hydration so Next's RSC payload cannot expose a second
  // application/ld+json copy to crawlers such as Google's Rich Results Test.
  useEffect(() => {
    const existing = document.getElementById('masterise-jsonld');
    existing?.remove();

    if (!serializedSchema) return;

    const script = document.createElement('script');
    script.id = 'masterise-jsonld';
    script.type = 'application/ld+json';
    script.textContent = serializedSchema;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [serializedSchema]);

  return null;
}
