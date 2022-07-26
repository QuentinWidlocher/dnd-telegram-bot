import hexToHsl from "hex-to-hsl";
import { ParentProps } from "solid-js";
import {
  createThemeSignal as createRealThemeSignal,
  StableContainer,
} from "telegram-webapp-solid";

function hexToCssHsl(hex: string, luminosityMult: number = 1) {
  if (!hex) return;
  const [h, s, l] = hexToHsl(hex);
  return `${h} ${s}% ${(l * luminosityMult).toFixed(2)}%`;
}

const hexToDarkerCssHsl = (hex: string) => hexToCssHsl(hex, 0.8);
const hexToLighterCssHsl = (hex: string) => hexToCssHsl(hex, 1.1);
const hexToFocusCssHsl = (hex: string, mode: string) =>
  mode == "dark" ? hexToLighterCssHsl(hex) : hexToDarkerCssHsl(hex);

function createThemeSignal() {
  if (import.meta.env.NODE_ENV === "production") {
    return createRealThemeSignal();
  } else {
    return () => ({
      colorScheme: "dark",
      themeParams: {
        bg_color: "#212121",
        text_color: "#ffffff",
        button_color: "#8774e1",
        button_text_color: "#ffffff",
      },
    });
  }
}

export function Layout(props: ParentProps) {
  const theme = createThemeSignal();

  return (
    <StableContainer
      class="flex flex-col p-5"
      data-theme={theme()?.colorScheme}
      style={{
        "--p": hexToCssHsl(theme()?.themeParams?.button_color),
        "--pf": hexToFocusCssHsl(
          theme()?.themeParams?.button_color,
          theme()?.colorScheme
        ),
        "--pc": hexToCssHsl(theme()?.themeParams?.button_text_color),
        "--n": hexToCssHsl(theme()?.themeParams?.bg_color),
        "--nf": hexToFocusCssHsl(
          theme()?.themeParams?.bg_color,
          theme()?.colorScheme
        ),
        "--nc": hexToCssHsl(theme()?.themeParams?.text_color),
        "--b1": hexToCssHsl(theme()?.themeParams?.bg_color),
        "--b2": hexToCssHsl(theme()?.themeParams?.bg_color, 0.75),
        "--b3": hexToCssHsl(theme()?.themeParams?.bg_color, 0.5),
        "--bc": hexToDarkerCssHsl(theme()?.themeParams?.text_color),
      }}
    >
      {props.children}
    </StableContainer>
  );
}
