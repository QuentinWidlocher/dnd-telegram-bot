import hexToHsl from "hex-to-hsl";
import { ParentProps } from "solid-js";
import { createThemeSignal, StableContainer } from "telegram-webapp-solid";

function hexToCssHsl(hex: string, luminosityMult: number = 1) {
  if (!hex) return;
  const [h, s, l] = hexToHsl(hex);
  return `${h} ${s}% ${(l * luminosityMult).toFixed(2)}%`;
}

const hexToDarkerCssHsl = (hex: string) => hexToCssHsl(hex, 0.8);
const hexToLighterCssHsl = (hex: string) => hexToCssHsl(hex, 1.1);
const hexToFocusCssHsl = (hex: string, mode: string) =>
  mode == "dark" ? hexToLighterCssHsl(hex) : hexToDarkerCssHsl(hex);

export function Layout(props: ParentProps) {
  const { theme } = createThemeSignal();

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
        "--b2": hexToCssHsl(theme()?.themeParams?.secondary_bg_color),
        "--b3": hexToCssHsl(
          theme()?.themeParams?.secondary_bg_color,
          theme()?.colorScheme == "dark" ? 0.75 : 0.9
        ),
        "--bc": hexToDarkerCssHsl(theme()?.themeParams?.text_color),
      }}
    >
      {props.children}
    </StableContainer>
  );
}
