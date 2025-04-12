"use client";

import { useTheme } from "next-themes";

interface LogoProps {
	width: number;
	height: number;
}

function SvgComponent({ width, height }: LogoProps) {
	const { theme } = useTheme();

	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			width={width}
			height={height}
			viewBox="0 0 256 257"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g filter="url(#filter0_d_284_23)" strokeWidth={14.9573}>
				<path
					d="M127.519 69.366c22.548-19.607 51.867-20.583 65.175-7.637 13.737 13.362 16.342 39.249-4.469 66.926 16.974 25.126 20.959 49.897 7.358 64.013-13.602 14.116-36.794 13.922-65.431-3.967-24.391 21.061-54.732 20.429-69.165 3.931-14.433-16.498-12.251-38.034 8.47-62.761-20.891-25.523-23.613-49.68-7.108-66.808 16.506-17.13 46.491-11.631 65.17 6.303z"
					stroke="url(#paint0_linear_284_23)"
				/>
				<path
					d="M151.751 104.862c13.234 12.874 15.7 32.527 3.04 45.666-12.661 13.139-32.593 17.765-48.888 1.914-13.234-12.874-14.52-30.228-1.039-47.1 12.018-15.042 31.87-15.088 46.887-.48z"
					stroke="url(#paint1_linear_284_23)"
				/>
			</g>
			<defs>
				<filter
					id="filter0_d_284_23"
					x={-14.5}
					y={-9.95508}
					width={285}
					height={285}
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity={0} result="BackgroundImageFix" />
					<feColorMatrix
						in="SourceAlpha"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dy={4} />
					<feGaussianBlur stdDeviation={7.25} />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
					<feBlend
						in2="BackgroundImageFix"
						result="effect1_dropShadow_284_23"
					/>
					<feBlend
						in="SourceGraphic"
						in2="effect1_dropShadow_284_23"
						result="shape"
					/>
				</filter>
				<linearGradient
					id="paint0_linear_284_23"
					x1={75.2849}
					y1={53.26}
					x2={180.715}
					y2={203.83}
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#BAFFC9" />
					<stop offset={0.134615} stopColor="#BAE1FF" />
					<stop offset={0.269231} stopColor="#C9BAFF" />
					<stop offset={0.418269} stopColor="#FFBAFF" />
					<stop offset={0.538462} stopColor="#FF788C" />
					<stop offset={0.6875} stopColor="#FFB478" />
					<stop offset={0.850962} stopColor="#FFFF8C" />
				</linearGradient>
				<linearGradient
					id="paint1_linear_284_23"
					x1={75.2849}
					y1={53.26}
					x2={180.715}
					y2={203.83}
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#BAFFC9" />
					<stop offset={0.134615} stopColor="#BAE1FF" />
					<stop offset={0.269231} stopColor="#C9BAFF" />
					<stop offset={0.418269} stopColor="#FFBAFF" />
					<stop offset={0.538462} stopColor="#FF788C" />
					<stop offset={0.6875} stopColor="#FFB478" />
					<stop offset={0.850962} stopColor="#FFFF8C" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export default SvgComponent;
