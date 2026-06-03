import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { LanguageProvider } from "../context/LanguageContext";
import AIWidget from "../components/AIWidget";

export const metadata = {
  title: "Smart Coir | Manufacturing & Supply Chain Management",
  description: "Premium coir manufacturing platform - Transforming coconut fiber into sustainable industrial products. Smart inventory, order tracking, and supply chain management.",
  keywords: "coir, coconut fiber, manufacturing, supply chain, coir rope, coir yarn, export, industrial",
  openGraph: {
    title: "Smart Coir Manufacturing & Supply Chain Platform",
    description: "Transforming Coconut Fiber into Sustainable Industrial Products",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col noise-overlay">
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
              <AIWidget />
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

