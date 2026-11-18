import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata = {
  title: 'ResourceLink',
  description: 'Hyper-local time banking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
