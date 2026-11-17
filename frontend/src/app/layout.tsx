import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'ResourceLink',
  description: 'Hyper-local time banking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-gray-900 bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}