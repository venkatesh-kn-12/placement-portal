import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/lib/authContext";
import AppLayout from "@/components/AppLayout";

export const metadata = {
  title: "PlacementPortal – Next.js Campus Placement Platform",
  description: "Next.js full-stack campus placement portal for students, faculty mentors, and administrative coordinators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full flex flex-col font-sans">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
