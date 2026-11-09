import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Sift — CSV quality, without the guesswork.",description:"CSV quality, without the guesswork. Open-source tools by Rishit Pradhan.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
