"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { rgb, formatHex, formatRgb, formatHsl, parse, oklch } from "culori";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GlowingEffect } from "./ui/glowing-effect";
import { cn } from "@/lib/utils";
import { AnimatedGridPattern } from "./ui/animated-grid-pattern";

type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export default function ColorConverter() {
	const [oklchValues, setOklchValues] = useState({
		l: 0.6,
		c: 0.15,
		h: 240,
	});
	const [copied, setCopied] = useState<string | null>(null);
	const [colorFormats, setColorFormats] = useState({
		oklch: "",
		rgb: "",
		hex: "",
		hsl: "",
	});
	const [colorInput, setColorInput] = useState("");
	const [inputFormat, setInputFormat] = useState<ColorFormat>("hex");
	const [error, setError] = useState<string | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		updateColorFormats();
	}, [oklchValues, inputFormat]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (colorInput) {
			handleColorInput();
		} else if (!colorInput && !error) {
			// Optional: Reset to a default color if input is cleared without error
			// Or keep the last valid color shown by the sliders
		}
	}, [colorInput, inputFormat]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setColorInput(""); // Clear input when format changes
		setError(null);
	}, [inputFormat]);

	const formatOklchValue = (oklchColor: {
		l: number;
		c: number;
		h: number;
	}) => {
		// Ensure h is within 0-360 range visually, although culori handles wrapping
		const hue = ((oklchColor.h % 360) + 360) % 360;
		return `oklch(${oklchColor.l.toFixed(2)} ${oklchColor.c.toFixed(
			3,
		)} ${hue.toFixed(1)})`;
	};

	const updateColorFormats = () => {
		try {
			const oklchColor = {
				mode: "oklch" as const,
				l: Math.max(0, Math.min(1, oklchValues.l)), // Clamp Lightness
				c: Math.max(0, oklchValues.c), // Clamp Chroma
				h: oklchValues.h, // Hue wraps
			};

			const rgbColor = rgb(oklchColor);

			// Check if RGB values are valid (not NaN) before formatting
			if (
				rgbColor &&
				!Number.isNaN(rgbColor.r) &&
				!Number.isNaN(rgbColor.g) &&
				!Number.isNaN(rgbColor.b)
			) {
				setColorFormats({
					oklch: formatOklchValue(oklchColor),
					rgb: formatRgb(rgbColor),
					hex: formatHex(rgbColor),
					hsl: formatHsl(rgbColor),
				});
				setError(null);
			} else {
				// Handle cases where conversion might result in invalid RGB (e.g., out of gamut for sRGB)
				// For simplicity, we might just show an error or fallback values
				setColorFormats({
					// Set fallback or keep previous state
					oklch: formatOklchValue(oklchColor),
					rgb: "rgb(invalid)",
					hex: "#invalid",
					hsl: "hsl(invalid)",
				});
				// Optionally set an error specific to out-of-gamut if detectable
				// setError("Color might be outside the displayable sRGB gamut.");
			}
		} catch (error) {
			console.error("Error converting color:", error);
			setError("Error converting color. Please check slider values."); // Error more likely from sliders now
		}
	};

	const handleColorInput = () => {
		try {
			let processedInput = colorInput.trim();
			setError(null); // Clear previous errors

			if (!processedInput) {
				// If input is empty, don't try to parse, just return
				// The color will reflect the slider values
				return;
			}

			// --- Input Format Handling (keep as is, seems robust) ---
			if (inputFormat === "hex") {
				processedInput = processedInput.replace("#", "").toUpperCase();
				if (!/^([A-F0-9]{3}|[A-F0-9]{6})$/i.test(processedInput)) {
					throw new Error("Invalid HEX format. Use #RGB or #RRGGBB");
				}
				if (processedInput.length === 3) {
					processedInput = processedInput
						.split("")
						.map((char) => char + char)
						.join("");
				}
				processedInput = `#${processedInput}`;
			} else if (inputFormat === "hsl") {
				if (!processedInput.startsWith("hsl(")) {
					const values = processedInput.split(/[\s,]+/); // Split by space or comma
					const [h, s, l] = values.map((v, i) => {
						const num = Number.parseFloat(v.replace("%", ""));
						if (Number.isNaN(num))
							throw new Error(`Invalid value in HSL: ${v}`);
						if (i === 0) return `${num}`; // Hue
						return v.endsWith("%") ? v : `${num}%`; // Saturation/Lightness
					});
					processedInput = `hsl(${h}, ${s}, ${l})`;
				}
			} else if (inputFormat === "rgb") {
				if (!processedInput.startsWith("rgb(")) {
					const values = processedInput.split(/[\s,]+/);
					const [r, g, b] = values.map((v) => {
						const num = Number.parseInt(v, 10);
						if (Number.isNaN(num) || num < 0 || num > 255)
							throw new Error(`Invalid RGB value: ${v}`);
						return `${num}`;
					});
					processedInput = `rgb(${r}, ${g}, ${b})`;
				}
			} else if (inputFormat === "oklch") {
				if (!processedInput.startsWith("oklch(")) {
					const values = processedInput.split(/[\s,]+/);
					const [l, c, h] = values.map((v, i) => {
						const num = Number.parseFloat(v);
						if (Number.isNaN(num)) throw new Error(`Invalid OKLCH value: ${v}`);
						// Add basic validation if needed, e.g., L between 0-1, C >= 0
						return `${num}`;
					});
					processedInput = `oklch(${l} ${c} ${h})`;
				}
			}
			// --- End Input Format Handling ---

			const parsedColor = parse(processedInput);

			if (!parsedColor) {
				throw new Error(
					`Invalid color format for ${inputFormat.toUpperCase()}`,
				);
			}

			// Convert to OKLCH
			const oklchColor = oklch(parsedColor);

			if (
				!oklchColor ||
				typeof oklchColor.l === "undefined" ||
				typeof oklchColor.c === "undefined" ||
				typeof oklchColor.h === "undefined"
			) {
				// Handle cases where culori might return undefined components (though less likely with parse succeeding)
				throw new Error("Could not convert input to OKLCH values");
			}

			setOklchValues({
				// Use parsed values, fallback shouldn't be needed if parse/oklch succeed
				l: oklchColor.l,
				c: oklchColor.c,
				h: oklchColor.h, // Culori handles hue normalization
			});

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			console.error("Error parsing color:", error);
			setError(
				error.message || "Invalid color format. Please check your input.",
			);
			// Don't update sliders on error, keep last valid state
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		property: keyof typeof oklchValues,
	) => {
		const rawValue = e.target.value;
		// Allow empty input temporarily without setting NaN
		if (rawValue === "") {
			// Optionally handle empty input state if needed, or just wait for blur/next input
			return;
		}
		const value = Number.parseFloat(rawValue);
		if (!Number.isNaN(value)) {
			// Add clamping/validation specific to each property
			let clampedValue = value;
			const range = getSliderRange(property);
			if (property === "l") {
				clampedValue = Math.max(range.min, Math.min(range.max, value));
			} else if (property === "c") {
				clampedValue = Math.max(range.min, Math.min(range.max, value)); // Clamp Chroma max for usability
			} else if (property === "h") {
				// Hue wraps, so no clamping, but ensure it's treated as a number
				clampedValue = value;
			}
			setOklchValues((prev) => ({ ...prev, [property]: clampedValue }));
			// Clear manual input field after updating sliders via number input
			// setColorInput(''); // Optional: Clear text input when sliders change
			// setError(null); // Clear error when valid number is input
		} else {
			// Handle invalid number input if needed (e.g., show temporary error)
		}
	};

	const handleSliderChange = (
		value: number[],
		property: keyof typeof oklchValues,
	) => {
		setOklchValues((prev) => ({ ...prev, [property]: value[0] }));
		// Clear manual input field when sliders are used
		// setColorInput(''); // Optional: Clear text input when sliders change
		// setError(null); // Clear error when sliders change
	};

	const copyToClipboard = (text: string, format: string) => {
		if (text.includes("invalid")) return; // Don't copy invalid formats
		navigator.clipboard.writeText(text);
		setCopied(format);
		setTimeout(() => setCopied(null), 2000);
	};

	const getSliderRange = (property: keyof typeof oklchValues) => {
		switch (property) {
			case "l": // Lightness: 0 (black) to 1 (white)
				return { min: 0, max: 1, step: 0.01 };
			case "c": // Chroma: 0 (grayscale) up to ~0.37 or higher technically, but 0.4 is a safe practical max for sRGB gamut
				return { min: 0, max: 0.4, step: 0.001 }; // Finer step for chroma
			case "h": // Hue: 0 to 360 degrees
				return { min: 0, max: 360, step: 1 };
			default:
				return { min: 0, max: 1, step: 0.01 };
		}
	};

	const getPlaceholderByFormat = (format: ColorFormat) => {
		switch (format) {
			case "hex":
				return "#FFFFFF or #FFF";
			case "rgb":
				return "rgb(R,G,B)";
			case "hsl":
				return "hsl(H,S%,L%)";
			case "oklch":
				return "oklch(L C H)";
			default:
				return "Enter color value";
		}
	};

	// Determine text color based on luminance and chroma for better contrast
	const getContrastingTextColor = (
		l: number,
		c: number,
		hex: string,
	): string => {
		if (hex.includes("invalid")) return "#000000"; // Default for invalid colors
		// Use Luminance primarily. If very light (L > 0.7?), use dark text.
		// If very dark (L < 0.3?), use light text.
		// In the mid-range, consider chroma. Low chroma (near gray) might need different handling.
		// Simple threshold:
		return l > 0.65 ? "#1f2937" : "#ffffff"; // Use dark gray for light backgrounds, white for others
	};

	const textColor = getContrastingTextColor(
		oklchValues.l,
		oklchValues.c,
		colorFormats.hex,
	);
	const borderColor =
		oklchValues.l > 0.65 ? "rgba(31, 41, 55, 0.2)" : "rgba(255, 255, 255, 0.2)";

	return (
		// Use grid layout for the overall component structure on larger screens
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* Card 1: Input and Controls */}
			<Card className="relative shadow-xl h-full rounded-2xl p-2 md:p-3 bg-background">
				{/* Effects are visual, should not impact layout significantly */}
				<GlowingEffect
					blur={0}
					borderWidth={3}
					spread={80}
					glow={true}
					disabled={false}
					proximity={64}
					inactiveZone={0.01}
				/>
				{/* Responsive Padding: p-4 base, p-6 on medium screens and up */}
				<CardContent className="p-4 md:p-6">
					<div className="grid gap-6">
						{/* Color Input Section */}
						<div className="grid gap-4">
							{/* Stack label and select vertically on mobile, side-by-side on sm+ */}
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
								<Label
									htmlFor="color-input"
									className="text-base sm:text-lg font-satoshi-bold mb-2 sm:mb-0"
								>
									Input Color
								</Label>
								<Select
									value={inputFormat}
									onValueChange={(value: ColorFormat) => setInputFormat(value)}
								>
									{/* Adjust width: full on mobile, auto/fixed on larger */}
									<SelectTrigger className="w-full sm:w-[120px]">
										<SelectValue placeholder="Format" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="hex">HEX</SelectItem>
										<SelectItem value="rgb">RGB</SelectItem>
										<SelectItem value="hsl">HSL</SelectItem>
										<SelectItem value="oklch">OKLCH</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex gap-2">
								<Input
									id="color-input"
									className="font-mono" // Keep mono for readability
									placeholder={getPlaceholderByFormat(inputFormat)}
									value={colorInput}
									onChange={(e) => setColorInput(e.target.value)}
									// onBlur={handleColorInput} // Trigger parsing on blur might be better UX
								/>
								{/* Maybe add a small "Parse" button instead of instant parsing? */}
								{/* <Button onClick={handleColorInput}>Parse</Button> */}
							</div>
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
						</div>

						{/* Color Preview - aspect ratio makes it responsive */}
						<div
							className="aspect-[2/1] w-full rounded-lg border-2"
							style={{
								backgroundColor: colorFormats.rgb.includes("invalid")
									? "#888"
									: colorFormats.rgb,
							}} // Use RGB format for preview background
						/>

						{/* OKLCH Controls */}
						<div className="grid gap-6">
							{/* Lightness Control */}
							<div className="grid gap-2">
								<Label htmlFor="lightness" className="text-sm font-medium">
									Lightness (L): {oklchValues.l.toFixed(2)}
								</Label>
								{/* Stack slider and input vertically on mobile, side-by-side on sm+ */}
								<div className="flex flex-col sm:flex-row gap-4 items-center">
									<Slider
										id="lightness"
										value={[oklchValues.l]}
										min={getSliderRange("l").min}
										max={getSliderRange("l").max}
										step={getSliderRange("l").step}
										onValueChange={(value) => handleSliderChange(value, "l")}
										className="flex-1 w-full sm:w-auto" // Take full width on mobile
									/>
									<Input
										type="number"
										value={oklchValues.l.toFixed(2)} // Display formatted value
										onChange={(e) => handleInputChange(e, "l")}
										onBlur={(e) => handleInputChange(e, "l")} // Ensure update on blur
										min={getSliderRange("l").min}
										max={getSliderRange("l").max}
										step={getSliderRange("l").step}
										className="w-full sm:w-20" // Full width on mobile, fixed on sm+
									/>
								</div>
							</div>

							{/* Chroma Control */}
							<div className="grid gap-2">
								<Label htmlFor="chroma" className="text-sm font-medium">
									Chroma (C): {oklchValues.c.toFixed(3)}
								</Label>
								{/* Stack slider and input vertically on mobile, side-by-side on sm+ */}
								<div className="flex flex-col sm:flex-row gap-4 items-center">
									<Slider
										id="chroma"
										value={[oklchValues.c]}
										min={getSliderRange("c").min}
										max={getSliderRange("c").max}
										step={getSliderRange("c").step}
										onValueChange={(value) => handleSliderChange(value, "c")}
										className="flex-1 w-full sm:w-auto"
									/>
									<Input
										type="number"
										value={oklchValues.c.toFixed(3)} // Display formatted value
										onChange={(e) => handleInputChange(e, "c")}
										onBlur={(e) => handleInputChange(e, "c")}
										min={getSliderRange("c").min}
										max={getSliderRange("c").max}
										step={getSliderRange("c").step}
										className="w-full sm:w-20"
									/>
								</div>
							</div>

							{/* Hue Control */}
							<div className="grid gap-2">
								<Label htmlFor="hue" className="text-sm font-medium">
									Hue (H): {(((oklchValues.h % 360) + 360) % 360).toFixed(1)}°{" "}
									{/* Normalize display */}
								</Label>
								{/* Stack slider and input vertically on mobile, side-by-side on sm+ */}
								<div className="flex flex-col sm:flex-row gap-4 items-center">
									<Slider
										id="hue"
										value={[oklchValues.h]}
										min={getSliderRange("h").min}
										max={getSliderRange("h").max}
										step={getSliderRange("h").step}
										onValueChange={(value) => handleSliderChange(value, "h")}
										className="flex-1 w-full sm:w-auto"
										// Optional: Add hue gradient background to slider track
										// style={{ background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)' }}
									/>
									<Input
										type="number"
										value={oklchValues.h.toFixed(1)} // Display formatted value
										onChange={(e) => handleInputChange(e, "h")}
										onBlur={(e) => handleInputChange(e, "h")}
										min={getSliderRange("h").min}
										max={getSliderRange("h").max}
										step={getSliderRange("h").step}
										className="w-full sm:w-20"
									/>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card className="py-6 shadow-xl border relative rounded-2xl bg-background h-full flex flex-col">
				<GlowingEffect
					blur={0}
					borderWidth={3}
					spread={80}
					glow={true}
					disabled={false}
					proximity={64}
					inactiveZone={0.01}
				/>
				<AnimatedGridPattern
					numSquares={50}
					maxOpacity={0.1}
					duration={3}
					repeatDelay={1}
					fillColor={
						colorFormats.hex.includes("invalid") ? "#888888" : colorFormats.hex
					}
					className={cn(
						"[mask-image:radial-gradient(300px_circle_at_center,white,transparent)] sm:[mask-image:radial-gradient(450px_circle_at_center,white,transparent)]", // Adjust mask size
						"inset-x-0 inset-y-[-50%] h-[200%] skew-y-12",
					)}
				/>
				{/* Make CardContent grow to fill height, allowing footer to stick to bottom */}
				<CardContent className="flex-grow flex flex-col p-0">
					{" "}
					{/* Remove default padding here, add below */}
					{/* Inner container for padding, using responsive values */}
					<div className="flex-grow w-full p-4 md:p-6 rounded-2xl flex flex-col justify-center">
						{" "}
						{/* Center content vertically */}
						<div className="relative">
							<div className="py-4 sm:py-8 px-2 sm:px-4">
								{" "}
								{/* Reduced padding on mobile */}
								<div className="text-center mb-2">
									<span
										style={{
											color:
												oklchValues.l >= 0.8 && oklchValues.c < 0.15
													? "#000000"
													: colorFormats.hex,
										}}
										// Responsive text size
										className="text-xl sm:text-2xl font-satoshi-bold"
									>
										Color HEX
									</span>
								</div>
								<h2
									// Responsive text size and leading
									className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-tight sm:leading-none uppercase break-all"
									style={{
										color:
											oklchValues.l >= 0.8 && oklchValues.c < 0.15
												? "#000000"
												: colorFormats.hex,
									}}
								>
									{colorFormats.hex.replace("#", "")}
								</h2>
								{/* Color display card - responsive padding and max-width */}
								<div className="bg-muted-foreground/50 border-1 rounded-2xl p-2 sm:p-4 shadow-lg mx-auto max-w-md md:max-w-lg mt-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
									<div className="bg-background/95 border-1 rounded-2xl p-2 sm:p-4 shadow-lg mx-auto backdrop-blur supports-[backdrop-filter]:bg-background/60">
										<div
											// Responsive padding
											className="rounded-2xl max-w-xl mx-auto p-4 sm:p-8 flex flex-col sm:flex-row justify-between sm:space-x-4 gap-4 sm:gap-0 border-1"
											style={{
												backgroundColor: colorFormats.hex.includes("invalid")
													? "#888"
													: colorFormats.hex,
												color: textColor, // Use dynamic text color
											}}
										>
											{/* Left Side: Title and Formats */}
											{/* Responsive text size and spacing */}
											<div className="flex flex-col justify-center items-start space-y-4 sm:space-y-8 md:space-y-12">
												{/* Responsive text size */}
												<h3 className="text-xl sm:text-2xl md:text-3xl font-medium">
													Color Space
												</h3>
												{/* Use grid for alignment, adjust text size */}
												<div
													className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm sm:text-base md:text-lg w-full" // Ensure full width for grid layout
													style={{ borderColor: borderColor }}
												>
													{/* HEX Row */}
													<div className="font-satoshi-regular">HEX</div>
													<div className="font-satoshi-bold whitespace-nowrap uppercase flex justify-between items-center">
														<span>{colorFormats.hex}</span>
														<Button
															variant="ghostCopy"
															size="sm" // Custom smaller size might be needed
															onClick={() =>
																copyToClipboard(colorFormats.hex, "hex")
															}
															className="ml-2" // Add margin
														>
															{copied === "hex" ? (
																<Check className="h-4 w-4" />
															) : (
																<Copy className="h-4 w-4" />
															)}
														</Button>
													</div>

													{/* RGB Row */}
													<div className="font-satoshi-regular">RGB</div>
													<div className="font-satoshi-bold whitespace-nowrap flex justify-between items-center">
														<span>
															{colorFormats.rgb
																.replace(/[rgb()]/g, "") // More robust removal
																.split(/[\s,]+/) // Split by space or comma
																.join(", ")}
														</span>
														<Button
															variant="ghostCopy"
															size="sm"
															onClick={() =>
																copyToClipboard(colorFormats.rgb, "rgb")
															}
															className="ml-2"
														>
															{copied === "rgb" ? (
																<Check className="h-4 w-4" />
															) : (
																<Copy className="h-4 w-4" />
															)}
														</Button>
													</div>

													{/* HSL Row */}
													<div className="font-satoshi-regular">HSL</div>
													<div className="font-satoshi-bold whitespace-nowrap flex justify-between items-center">
														<span>
															{colorFormats.hsl
																.replace(/[hsl()deg]/g, "")
																.split(/[\s,]+/)
																.map((v, i) =>
																	i === 0
																		? `${Number.parseFloat(v).toFixed(0)}°`
																		: v,
																) // Format Hue
																.join(", ")}
														</span>
														<Button
															variant="ghostCopy"
															size="sm"
															onClick={() =>
																copyToClipboard(colorFormats.hsl, "hsl")
															}
															className="ml-2"
														>
															{copied === "hsl" ? (
																<Check className="h-4 w-4" />
															) : (
																<Copy className="h-4 w-4" />
															)}
														</Button>
													</div>

													{/* OKLCH Row */}
													<div className="font-satoshi-regular">OKLCH</div>
													<div className="font-satoshi-bold whitespace-nowrap flex justify-between items-center">
														<span>
															{colorFormats.oklch
																.replace(/[oklch()]/g, "")
																.split(/\s+/) // Split only by space for oklch format
																.join(", ")}
														</span>
														<Button
															variant="ghostCopy"
															size="sm"
															onClick={() =>
																copyToClipboard(colorFormats.oklch, "oklch")
															}
															className="ml-2"
														>
															{copied === "oklch" ? (
																<Check className="h-4 w-4" />
															) : (
																<Copy className="h-4 w-4" />
															)}
														</Button>
													</div>
												</div>
											</div>
										</div>
									</div>
									{/* "@ ColorSpace" Tag - Adjust positioning/size */}
									<div
										style={{
											color:
												oklchValues.l >= 0.8 && oklchValues.c < 0.15
													? "#000000"
													: colorFormats.hex,
										}}
										className="text-center text-xs sm:text-sm p-1 sm:p-2 bg-background/95 rounded-b-xl sm:rounded-b-2xl shadow-md max-w-max mx-auto absolute left-0 right-0 -bottom-4 sm:-bottom-5 dark:-bottom-5 font-satoshi-regular dark:border-x-1 dark:border-b-1"
									>
										@ ColorSpace
									</div>
								</div>
							</div>
						</div>
						{/* Footer section within the card - pushed to bottom */}
						<div className="mt-12 sm:mt-20 p-4 md:p-6 pt-0">
							{" "}
							{/* Add padding here */}
							<div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-gray-500 gap-2 text-center sm:text-left">
								<div>
									<div
										className="font-satoshi-bold"
										style={{
											color:
												oklchValues.l >= 0.8 && oklchValues.c < 0.15
													? "#000000"
													: colorFormats.hex,
										}}
									>
										Philipe Morais
									</div>
									<div className="font-satoshi-regular">Color Palette</div>
								</div>
								<div className="text-center">
									<div
										className="font-satoshi-bold"
										style={{
											color:
												oklchValues.l >= 0.8 && oklchValues.c < 0.15
													? "#000000"
													: colorFormats.hex,
										}}
									>
										{new Date().getFullYear()}
									</div>
									<div className="capitalize font-satoshi-regular">
										{new Date().toLocaleString("default", { month: "long" })}
									</div>
								</div>
								<div className="text-center sm:text-right">
									<div className="font-satoshi-regular">Selection by</div>
									<div
										className="font-satoshi-bold"
										style={{
											color:
												oklchValues.l >= 0.8 && oklchValues.c < 0.15
													? "#000000"
													: colorFormats.hex,
										}}
									>
										ColorSpace
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
