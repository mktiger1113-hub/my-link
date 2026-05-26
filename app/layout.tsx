import { Geist, Geist_Mono, Raleway } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth"
import { cn } from "@/lib/utils";

const geistMonoHeading = Geist_Mono({subsets:['latin'],variable:'--font-heading'});

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", raleway.variable, geistMonoHeading.variable)}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
