'use client';

import Link from 'next/link';
import { ASSISTANTS } from '@/lib/vapiConfig';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-foreground mb-2">Assistantes Virtuales</h1>

        <div className="flex flex-col gap-4">
          {Object.entries(ASSISTANTS).map(([key, assistant]) => (
            <Link
              key={key}
              href={`/${assistant.slug}`}
              className="block px-8 py-4 bg-primary hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {assistant.name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
