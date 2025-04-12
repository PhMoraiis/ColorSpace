import type React from "react";
import "@/app/globals.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
	title: "ColorSpace - Modern Color Converter",
	description:
		"Convert between OKLCH, RGB, HEX, and HSL color formats with precision.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className='font-satoshi-regular'>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
