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

// Formatos mais comuns e relevantes para web development.
// Outros formatos como HSV, CMYK, LAB, HWB podem ser adicionados
// se houver necessidade específica.
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
	}, [oklchValues, inputFormat]); // Updated dependency array

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (colorInput) {
			handleColorInput();
		}
	}, [colorInput, inputFormat]); // Added inputFormat to dependency array

	// Adicionar este useEffect após os outros
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setColorInput("");
		setError(null);
	}, [inputFormat]); // Updated dependency array

	const formatOklchValue = (oklchColor: {
		l: number;
		c: number;
		h: number;
	}) => {
		return `oklch(${oklchColor.l.toFixed(2)} ${oklchColor.c.toFixed(3)} ${oklchColor.h.toFixed(1)})`;
	};

	const updateColorFormats = () => {
		try {
			const oklchColor = {
				mode: "oklch" as const,
				l: oklchValues.l,
				c: oklchValues.c,
				h: oklchValues.h,
			};

			const rgbColor = rgb(oklchColor);

			setColorFormats({
				oklch: formatOklchValue(oklchValues),
				rgb: formatRgb(rgbColor),
				hex: formatHex(rgbColor),
				hsl: formatHsl(rgbColor),
			});
			setError(null);
		} catch (error) {
			console.error("Error converting color:", error);
			setError("Error converting color. Please check your input values.");
		}
	};

	const handleColorInput = () => {
		try {
			let processedInput = colorInput.trim();

			if (inputFormat === "hex") {
				// Remover # se existir
				processedInput = processedInput.replace("#", "").toUpperCase();

				// Validar se é um formato HEX válido (3 ou 6 caracteres)
				if (!/^([A-F0-9]{3}|[A-F0-9]{6})$/i.test(processedInput)) {
					throw new Error("Invalid HEX format");
				}

				// Se for um formato curto (3 caracteres), expande para 6 caracteres
				if (processedInput.length === 3) {
					processedInput = processedInput
						.split("")
						.map((char) => char + char)
						.join("");
				}

				// Adicionar # de volta
				processedInput = `#${processedInput}`;
			} else if (inputFormat === "hsl") {
				// Verifica se já está no formato completo hsl(...)
				if (!processedInput.startsWith("hsl(")) {
					// Divide os valores por espaço
					const values = processedInput.split(/\s+/);
					if (values.length !== 3) {
						throw new Error("Invalid HSL format. Use: H S% L%");
					}

					// Adiciona % se não existir nos valores de saturação e luminosidade
					const [h, s, l] = values.map((v, i) => {
						if (i === 0) return v; // Hue não precisa de %
						return v.endsWith("%") ? v : `${v}%`;
					});

					// Formata para o padrão hsl(h, s%, l%)
					processedInput = `hsl(${h}, ${s}, ${l})`;
				}
			}

			// Casos especiais para cores comuns
			if (processedInput.toUpperCase() === "#FFFFFF") {
				setOklchValues({
					l: 1,
					c: 0,
					h: 0,
				});
				return;
			}

			if (processedInput.toUpperCase() === "#000000") {
				setOklchValues({
					l: 0,
					c: 0,
					h: 0,
				});
				return;
			}

			const parsedColor = parse(processedInput);

			if (!parsedColor) {
				throw new Error("Invalid color format");
			}

			// Convert to OKLCH
			const oklchColor = oklch(parsedColor);

			if (!oklchColor) {
				throw new Error("Could not convert to OKLCH");
			}

			setOklchValues({
				l: oklchColor.l ?? 0.6,
				c: oklchColor.c ?? 0.15,
				h: oklchColor.h ?? 240,
			});

			setError(null);
		} catch (error) {
			console.error("Error parsing color:", error);
			setError("Invalid color format. Please check your input.");
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		property: keyof typeof oklchValues,
	) => {
		const value = Number.parseFloat(e.target.value);
		if (!Number.isNaN(value)) {
			setOklchValues((prev) => ({ ...prev, [property]: value }));
		}
	};

	const handleSliderChange = (
		value: number[],
		property: keyof typeof oklchValues,
	) => {
		setOklchValues((prev) => ({ ...prev, [property]: value[0] }));
	};

	const copyToClipboard = (text: string, format: string) => {
		navigator.clipboard.writeText(text);
		setCopied(format);
		setTimeout(() => setCopied(null), 2000);
	};

	const getSliderRange = (property: keyof typeof oklchValues) => {
		switch (property) {
			case "l":
				return { min: 0, max: 1, step: 0.01 };
			case "c":
				return { min: 0, max: 0.4, step: 0.01 };
			case "h":
				return { min: 0, max: 360, step: 1 };
			default:
				return { min: 0, max: 1, step: 0.01 };
		}
	};

	const getPlaceholderByFormat = (format: ColorFormat) => {
		switch (format) {
			case "hex":
				return "#FFFFFF";
			case "rgb":
				return "rgb(255, 0, 0)";
			case "hsl":
				return "0 100% 50%";
			case "oklch":
				return "oklch(1 0 0)";
			default:
				return "Enter color value";
		}
	};

	return (
		<div className="grid gap-8">
			<Card className="relative shadow-xl h-full rounded-2xl p-2 md:rounded-3xl md:p-3 bg-background">
				<GlowingEffect
					blur={0}
					borderWidth={3}
					spread={80}
					glow={true}
					disabled={false}
					proximity={64}
					inactiveZone={0.01}
				/>
				<CardContent className="p-6">
					<div className="grid gap-6">
						{/* Color Input Section */}
						<div className="grid gap-4">
							<div className="flex items-center justify-between">
								<Label className="text-lg font-satoshi-bold">Input Color</Label>
								<Select
									value={inputFormat}
									onValueChange={(value: ColorFormat) => setInputFormat(value)}
								>
									<SelectTrigger className="w-[120px]">
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
									className="font-mono"
									placeholder={getPlaceholderByFormat(inputFormat)}
									value={colorInput}
									onChange={(e) => setColorInput(e.target.value)}
								/>
							</div>
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
						</div>

						{/* Color Preview */}
						<div
							className="aspect-[2/1] w-full rounded-lg border-2"
							style={{ backgroundColor: colorFormats.rgb }}
						/>

						{/* OKLCH Controls */}
						<div className="grid gap-6">
							<div className="grid gap-2">
								<Label htmlFor="lightness" className="text-sm font-medium">
									Lightness (L): {oklchValues.l.toFixed(2)}
								</Label>
								<div className="flex gap-4 items-center">
									<Slider
										id="lightness"
										value={[oklchValues.l]}
										min={getSliderRange("l").min}
										max={getSliderRange("l").max}
										step={getSliderRange("l").step}
										onValueChange={(value) => handleSliderChange(value, "l")}
										className="flex-1"
									/>
									<Input
										type="number"
										value={oklchValues.l}
										onChange={(e) => handleInputChange(e, "l")}
										min={getSliderRange("l").min}
										max={getSliderRange("l").max}
										step={getSliderRange("l").step}
										className="w-20"
									/>
								</div>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="chroma" className="text-sm font-medium">
									Chroma (C): {oklchValues.c.toFixed(3)}
								</Label>
								<div className="flex gap-4 items-center">
									<Slider
										id="chroma"
										value={[oklchValues.c]}
										min={getSliderRange("c").min}
										max={getSliderRange("c").max}
										step={getSliderRange("c").step}
										onValueChange={(value) => handleSliderChange(value, "c")}
										className="flex-1"
									/>
									<Input
										type="number"
										value={oklchValues.c}
										onChange={(e) => handleInputChange(e, "c")}
										min={getSliderRange("c").min}
										max={getSliderRange("c").max}
										step={getSliderRange("c").step}
										className="w-20"
									/>
								</div>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="hue" className="text-sm font-medium">
									Hue (H): {oklchValues.h.toFixed(1)}°
								</Label>
								<div className="flex gap-4 items-center">
									<Slider
										id="hue"
										value={[oklchValues.h]}
										min={getSliderRange("h").min}
										max={getSliderRange("h").max}
										step={getSliderRange("h").step}
										onValueChange={(value) => handleSliderChange(value, "h")}
										className="flex-1"
									/>
									<Input
										type="number"
										value={oklchValues.h}
										onChange={(e) => handleInputChange(e, "h")}
										min={getSliderRange("h").min}
										max={getSliderRange("h").max}
										step={getSliderRange("h").step}
										className="w-20"
									/>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="py-6 shadow-xl border relative rounded-2xl bg-background">
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
					fillColor={colorFormats.hex}
					className={cn(
						"[mask-image:radial-gradient(450px_circle_at_center,white,transparent)]",
						"inset-x-0 inset-y-[-50%] h-[200%] skew-y-12",
					)}
				/>
				<CardContent>
					<div className="w-full p-6 rounded-2xl">
						<div className="p-6">
							<CardContent className="m-0">
								<div className="relative">
									<div className="py-8 px-4">
										<div className="text-center mb-2">
											<span
												style={{
													color:
														oklchValues.l >= 0.8 && oklchValues.c < 0.15
															? "#1f2937"
															: colorFormats.hex,
												}}
												className="text-2xl font-satoshi-bold"
											>
												Color HEX
											</span>
										</div>

										<h2
											className="text-center text-[80px] font-bold tracking-tight text-gray-800 leading-none uppercase"
											style={{
												color:
													oklchValues.l >= 0.8 && oklchValues.c < 0.15
														? "#1f2937"
														: colorFormats.hex,
											}}
										>
											{colorFormats.hex.replace("#", "")}
										</h2>

										<div className="bg-muted-foreground border-1 rounded-2xl p-4 shadow-lg mx-auto max-w-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
											<div className="bg-background/95 border-1 rounded-2xl p-4 shadow-lg mx-auto max-w-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
												<div
													className="rounded-2xl max-w-xl mx-auto p-8 flex justify-between space-x-4 border-1"
													style={{
														backgroundColor: colorFormats.hex,
														color: oklchValues.l >= 0.8 ? "#1f2937" : "white",
													}}
												>
													<div className="flex flex-col justify-center items-start space-y-12">
														<h3 className="text-3xl font-medium">
															Color Space
														</h3>
														<div
															className="grid grid-cols-[auto_1fr] gap-x-4 text-lg"
															style={{
																borderColor:
																	oklchValues.l >= 0.8
																		? "rgba(31, 41, 55, 0.2)"
																		: "rgba(255, 255, 255, 0.2)",
															}}
														>
															<div className="font-satoshi-regular">HEX</div>
															<div className="font-satoshi-bold whitespace-pre uppercase">
																{colorFormats.hex}
																<Button
																	variant="ghostCopy"
																	size="sm"
																	onClick={() =>
																		copyToClipboard(colorFormats.hex, "hex")
																	}
																>
																	{copied === "hex" ? (
																		<Check className="h-4 w-4" />
																	) : (
																		<Copy className="h-4 w-4" />
																	)}
																</Button>
															</div>

															<div className="font-satoshi-regular">RGB</div>
															<div className="font-satoshi-bold whitespace-pre">
																{colorFormats.rgb
																	.replace("rgb(", "")
																	.replace(")", "")
																	.split(", ")
																	.join(", ")}
																<Button
																	variant="ghostCopy"
																	size="sm"
																	onClick={() =>
																		copyToClipboard(colorFormats.rgb, "rgb")
																	}
																>
																	{copied === "rgb" ? (
																		<Check className="h-4 w-4" />
																	) : (
																		<Copy className="h-4 w-4" />
																	)}
																</Button>
															</div>

															<div className="font-satoshi-regular">HSL</div>
															<div className="font-satoshi-bold whitespace-pre">
																{colorFormats.hsl
																	.replace("hsl(", "")
																	.replace(")", "")
																	.replace("deg", "°")}
																<Button
																	variant="ghostCopy"
																	size="sm"
																	onClick={() =>
																		copyToClipboard(colorFormats.hsl, "hsl")
																	}
																>
																	{copied === "hsl" ? (
																		<Check className="h-4 w-4" />
																	) : (
																		<Copy className="h-4 w-4" />
																	)}
																</Button>
															</div>
															<div className="font-satoshi-regular">OKLCH</div>
															<div className="font-satoshi-bold whitespace-pre">
																{colorFormats.oklch
																	.replace("oklch(", "")
																	.replace(")", "")
																	.replace("deg", "°")}
																<Button
																	variant="ghostCopy"
																	size="sm"
																	onClick={() =>
																		copyToClipboard(colorFormats.oklch, "oklch")
																	}
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
													<span className="text-3xl font-medium">05</span>
												</div>
											</div>
											<div
												style={{
													color:
														oklchValues.l >= 0.8 && oklchValues.c < 0.15
															? "#1f2937"
															: colorFormats.hex,
												}}
												className="text-center text-md p-2 bg-background/95 rounded-b-2xl shadow-md max-w-max mx-auto absolute left-0 right-0 -bottom-5 dark:-bottom-6.5 font-satoshi-regular dark:border-x-1 dark:border-b-1"
											>
												@ ColorSpace
											</div>
										</div>

										<div className="mt-20 flex justify-between text-sm text-gray-500">
											<div>
												<div
													className="font-satoshi-bold"
													style={{
														color:
															oklchValues.l >= 0.8 && oklchValues.c < 0.15
																? "#1f2937"
																: colorFormats.hex,
													}}
												>
													Philipe Morais
												</div>
												<div className="font-satoshi-regular">
													Color Palette
												</div>
											</div>
											<div className="text-center">
												<div
													style={{
														color:
															oklchValues.l >= 0.8 && oklchValues.c < 0.15
																? "#1f2937"
																: colorFormats.hex,
													}}
													className="font-satoshi-bold"
												>
													{new Date().getFullYear()}
												</div>
												<div className="capitalize font-satoshi-regular">
													{new Date().toLocaleString("default", {
														month: "long",
													})}
												</div>
											</div>
											<div className="text-right">
												<div className="font-satoshi-regular">Selection by</div>
												<div
													style={{
														color:
															oklchValues.l >= 0.8 && oklchValues.c < 0.15
																? "#000000"
																: colorFormats.hex,
													}}
													className="font-satoshi-bold"
												>
													ColorSpace
												</div>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
