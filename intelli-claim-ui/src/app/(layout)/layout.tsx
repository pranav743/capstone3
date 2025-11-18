import "@/app/globals.css";
import "./../../../node_modules/@hdfclife-insurance/one-x-ui/styles.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <body >
        <Navbar>{children}</Navbar>
      </body>
  );
}
