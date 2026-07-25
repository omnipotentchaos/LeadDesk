import "./globals.css";

export const metadata = {
  title: "LeadDesk",
  description: "A simple lead capture desk.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
