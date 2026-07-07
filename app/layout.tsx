import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aviation Medicine in Wing23 Hospital",
  description: "ระบบฐานข้อมูลยาการบินพลอากาศ โรงพยาบาลกองบิน กองบิน 23",
  icons: {
    icon: '/icon-clr.png',
    apple: '/icon-clr.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
