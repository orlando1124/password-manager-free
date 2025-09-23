import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Password Manager",
  description: "A simple password manager built with Next.js + Firebase you  feel me ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}