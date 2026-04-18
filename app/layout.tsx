import type { Metadata } from "next";
import { fontVariables } from "@/design-system/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agente de Riesgo",
  description: "Evalúa solicitudes de crédito, contratación y onboarding con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
