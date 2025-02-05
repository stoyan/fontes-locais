import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Local Fonts inspector',
  description:
    'This little app aims to gather data about locally available fonts across devices and operating systems. The data and the code is open-source, available on GitHub.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
