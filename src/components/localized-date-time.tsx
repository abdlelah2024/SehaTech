
"use client";

import { useState, useEffect } from 'react';

interface LocalizedDateTimeProps {
  dateTime: string;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}

export function LocalizedDateTime({ dateTime, locale = 'ar-EG', options = {} }: LocalizedDateTimeProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    try {
      const date = new Date(dateTime);
      const finalOptions: Intl.DateTimeFormatOptions = {
        dateStyle: 'short',
        ...options,
      };
      setFormattedDate(date.toLocaleString(locale, finalOptions));
    } catch (e) {
      // Fallback for invalid dates
      setFormattedDate(dateTime);
    }
  }, [dateTime, locale, options]);

  // Render a placeholder or null on the server and during the initial client render
  // to avoid the hydration mismatch.
  return <>{formattedDate}</>;
}
