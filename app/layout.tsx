import { Toaster } from "@/components/ui/sonner";
import ColorsProvider from "@/context/colors-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { UserProvider } from "@/context/UserContext";
import { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  weight: ["300", "500"],
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amplo Serviços",
  description: "Página inicial da amplo serviços",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ColorsProvider>
            <UserProvider>
              {children}
              <Toaster richColors />
            </UserProvider>
          </ColorsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
