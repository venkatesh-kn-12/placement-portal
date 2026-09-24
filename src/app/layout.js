import "./globals.css";
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
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
