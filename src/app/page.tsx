"use client";

import ColorConverter from "@/components/color-converter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import ColourfulText from "@/components/ui/colourful-text";
import Logo from "@/components/logo";
import { useTheme } from "next-themes";

export default function Home() {
	const { theme } = useTheme();

	return (
		<div className="min-h-screen flex flex-col items-center">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
				<div className="container flex h-14 items-center justify-between">
					<Link href="/">
						<div className="flex items-center gap-2 font-semibold">
							<Logo width={35} height={35} />
							ColorSpace
						</div>
					</Link>
					<div className="flex items-center gap-4">
						<Button variant="outline" size="icon" asChild>
							<Link
								href="https://github.com/PhMoraiis/ColorSpace"
								target="_blank"
								rel="noopener noreferrer"
							>
								<FaGithub className="h-4 w-4" />
							</Link>
						</Button>
						<ModeToggle />
					</div>
				</div>
			</header>
			<main className="flex-1">
				<section className="container flex flex-col items-center justify-center gap-4 pb-8 pt-6 md:pt-10 lg:py-16">
					<div className="mx-auto flex max-w-[950px] flex-col items-center gap-4 text-center">
						<span className="font-shadows text-3xl">
							Cores que fazem você parar e repensar
						</span>
						<h1 className="text-3xl font-bold leading-tight md:text-5xl lg:text-7xl lg:leading-[1.1] font-whyte uppercase">
							<ColourfulText text="Converta cores com precisão" />
						</h1>
						<p className="max-w-[750px] text-lg text-muted-foreground sm:text-lg font-satoshi-regular">
							Converta entre os formatos de cores OKLCH, RGB, HEX e HSL.
							Perfeito para desenvolvedores que trabalham com Tailwind e Shadcn
							<span className="font-satoshi-regular">/</span>UI.
						</p>
					</div>
				</section>
				<section className="pb-16">
					<div className="mx-auto max-w-full">
						<ColorConverter />
					</div>
				</section>
				<section className="container py-16 border-t px-4 lg:px-0">
					<div className="mx-auto max-w-[980px] grid gap-8 md:grid-cols-3">
						<div className="space-y-2">
							<h3 className="text-2xl font-shadows">
								{theme === "dark" ? (
									<ColourfulText text="Por que OKLCH?" />
								) : (
									"Por que OKLCH?"
								)}
							</h3>
							<p className="text-muted-foreground">
								OKLCH é um espaço de cores perceptualmente uniforme que
								proporciona melhor controle sobre as propriedades das cores.
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-2xl font-shadows">
								{theme === "dark" ? (
									<ColourfulText text="Controle Preciso" />
								) : (
									"Controle Preciso"
								)}
							</h3>
							<p className="text-muted-foreground">
								Ajuste as cores com controles deslizantes precisos e entradas
								numéricas para resultados perfeitos.
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-2xl font-shadows">
								{theme === "dark" ? (
									<ColourfulText text="Diversos formatos" />
								) : (
									"Diversos formatos"
								)}
							</h3>
							<p className="text-muted-foreground">
								Converta entre formatos de cores populares com um único clique.
								Copie e cole com facilidade.
							</p>
						</div>
					</div>
				</section>
			</main>
			<footer className="border-t py-6 md:py-0">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<p className="text-center text-sm leading-loose text-muted-foreground md:text-left font-satoshi-regular">
						Contruído com{" "}
						<Link
							href="https://nextjs.org"
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							Next.js
						</Link>
						. O código fonte está disponível em{" "}
						<Link
							href="https://github.com/PhMoraiis/ColorSpace"
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							Github
						</Link>
						.
					</p>
					<p className="text-center text-sm text-muted-foreground md:text-left">
						<Link
							href="https://linkedin.com/in/ph-morais/"
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							Acompanhe as novidades
						</Link>
					</p>
				</div>
			</footer>
		</div>
	);
}
