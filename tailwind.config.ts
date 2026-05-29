import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 고령층 UX 원칙 (ux_principles.md) 기반 디자인 토큰
      fontSize: {
        // 최소 18px (절대 금지: 16px 이하)
        "elder-sm": ["18px", { lineHeight: "1.6" }],
        "elder-base": ["20px", { lineHeight: "1.6" }],
        "elder-lg": ["24px", { lineHeight: "1.5" }],
        "elder-xl": ["28px", { lineHeight: "1.4" }],
      },
      spacing: {
        // 터치 영역: 최소 44px (iOS HIG), 권장 56px (고령층)
        "touch-min": "44px",
        "touch-standard": "56px",
        "touch-large": "64px",
      },
      colors: {
        // 위험도 색상 시스템 (notification_flow.md)
        risk: {
          critical: {
            bg: "#FEE2E2",
            text: "#DC2626",
            border: "#FECACA",
          },
          high: {
            bg: "#FEF3C7",
            text: "#D97706",
            border: "#FDE68A",
          },
          medium: {
            bg: "#FFF9C4",
            text: "#CA8A04",
            border: "#FEF08A",
          },
          safe: {
            bg: "#DCFCE7",
            text: "#16A34A",
            border: "#BBF7D0",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
