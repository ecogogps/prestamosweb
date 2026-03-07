import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center animate-in fade-in duration-700">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">
          Hola Mundo
        </h1>
        <div className="mt-4 h-1 w-12 bg-accent mx-auto rounded-full opacity-60" />
      </div>
    </main>
  );
}
