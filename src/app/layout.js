import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from 'sonner';
import { UserProvider } from '../context/UserContext';
import CustomSidebar from "@/components/dashboard/dashboard-sidebar"; // Import Sidebar

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Water Management System",
  description: "IoT-based water management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <UserProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <div className="flex min-h-screen">
              {/* Sidebar */}
              <div className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-[#004D77] to-[#43A2B3] text-white">
                <CustomSidebar />
              </div>

              {/* Main Content */}
              <div className="flex flex-col flex-1 ml-64"> {/* Added margin-left to prevent overlap */}
                {children}
                <Toaster position="top-center" richColors />
              </div>
            </div>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
