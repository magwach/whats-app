import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme.provider";
import { ConvexClientProvider } from "@/utils/providers/convex.client.provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "What's App",
  description: "What's App Clone",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
