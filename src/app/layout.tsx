import type { Metadata, Viewport } from "next";
import { Archivo, Barlow, Barlow_Condensed, Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display face: Archivo Expanded (variable width axis) for statements and headlines.
const display = Archivo({ variable: "--font-display", subsets: ["latin"], axes: ["wdth"] });
const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

// Faces drawn into the 3D screens (mail client, sign-in log, firewall console, SOC case).
const screenSans = Barlow({ variable: "--font-screen", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const screenCond = Barlow_Condensed({ variable: "--font-screen-cond", subsets: ["latin"], weight: ["500", "600", "700"] });
const screenMono = JetBrains_Mono({ variable: "--font-screen-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "MS Technoverge · Security for industries that can’t stop",
  description:
    "MS Technoverge protects oil and gas, banking, healthcare and manufacturing across the GCC, from the inbox to the plant floor. Email security, identity, IT/OT segmentation, detection and response.",
};

export const viewport: Viewport = {
  themeColor: "#eef0ed",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [display, sans, mono, screenSans, screenCond, screenMono].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts}>
      <body>{children}</body>
    </html>
  );
}
