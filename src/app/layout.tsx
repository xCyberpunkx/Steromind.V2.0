import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Shell } from "@/components/Shell";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "Stero Mind - Elevate Your Mind",
  description: "Track your certificates, courses, modules, projects, skills and goals in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans selection:bg-primary/30">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="7e9ff6ea-ef94-4b85-bf0d-128c2f8c6cdb"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "GrowthHub", "version": "1.0.0"}'
        />
        <AuthProvider>
          <Shell>
            {children}
          </Shell>
        </AuthProvider>
        <Toaster position="bottom-right" theme="light" expand={false} richColors />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
