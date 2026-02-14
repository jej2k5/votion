import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Votion - Open Source Workspace',
  description: 'An open-source, self-hostable alternative to Notion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
