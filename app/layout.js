import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { AppProvider } from "../context/AppContext";
import NotificationContainer from "../components/NotificationSystem";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LockIn - Web3 Event RSVP",
  description: "Professional Web3 event management with blockchain-based RSVPs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 flex flex-col`}
      >
        <AppProvider>
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <NotificationContainer />
        </AppProvider>
      </body>
    </html>
  );
}
