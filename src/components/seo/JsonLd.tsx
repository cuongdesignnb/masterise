import React from 'react';

interface JsonLdProps {
  schema: Record<string, any> | Record<string, any>[] | null | undefined;
}

export default function JsonLd({ schema }: JsonLdProps) {
  if (!schema) return null;

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

  const finalSchema = cleanSchema(schema);
  if (!finalSchema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(finalSchema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
