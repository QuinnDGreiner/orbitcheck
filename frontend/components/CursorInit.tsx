'use client';

import { useEffect } from 'react';

export default function CursorInit() {
  useEffect(() => {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    const handler = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);

  return null;
}
