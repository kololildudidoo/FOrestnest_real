
import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Forest Nest - Varaus',
  description: 'Varaa rentouttava loma Forest Nest -mökissä.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}