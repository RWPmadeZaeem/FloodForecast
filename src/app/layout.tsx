import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FloodForecast",
  description: "FloodForecast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-100 text-zinc-900 min-h-screen`}>
        
          <Header />
        
        
          {children}
       
          <Footer />
        
      </body>
    </html>
  );
}

