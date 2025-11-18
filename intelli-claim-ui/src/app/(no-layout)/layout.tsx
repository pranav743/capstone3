import "@/app/globals.css";
import "./../../../node_modules/@hdfclife-insurance/one-x-ui/styles.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <body>{children}</body>;
}
