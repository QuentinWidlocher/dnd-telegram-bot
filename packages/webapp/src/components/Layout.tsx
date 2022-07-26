import hexToHsl from "hex-to-hsl";
import { ParentProps } from "solid-js";
import { StableContainer } from "telegram-webapp-solid";

function hexToCssHsl(hex: string) {
  if (!hex) return;
  const [h, s, l] = hexToHsl(hex);
  return `${h} ${s}% ${l}%`;
}

function hexToDarkerCssHsl(hex: string) {
  if (!hex) return;
  const [h, s, l] = hexToHsl(hex);
  return `${h} ${s}% ${l * 0.6}%`;
}

function hexToLighterCssHsl(hex: string) {
  if (!hex) return;
  const [h, s, l] = hexToHsl(hex);
  return `${h} ${s}% ${l * 1.4}%`;
}

export function Layout(props: ParentProps) {
  const theme = () => ({
    colorScheme: "dark",
    themeParams: {
      button_color: "#5500DD",
      button_text_color: "#FFFFFF",
      bg_color: "#111111",
      text_color: "#FFFFFF",
    },
  }); // createThemeSignal()

  return (
    <StableContainer
      class="flex flex-col p-5"
      data-theme={theme()?.colorScheme}
      style={{
        "--p": hexToCssHsl(theme()?.themeParams?.button_color),
        "--pf": hexToDarkerCssHsl(theme()?.themeParams?.button_color),
        "--pc": hexToCssHsl(theme()?.themeParams?.button_text_color),
        "--n": hexToCssHsl(theme()?.themeParams?.bg_color),
        "--nf": hexToDarkerCssHsl(theme()?.themeParams?.bg_color),
        "--nc": hexToCssHsl(theme()?.themeParams?.text_color),
        "--b1": hexToLighterCssHsl(theme()?.themeParams?.bg_color),
        "--b2": hexToCssHsl(theme()?.themeParams?.bg_color),
        "--b3": hexToDarkerCssHsl(theme()?.themeParams?.bg_color),
        "--bc": hexToDarkerCssHsl(theme()?.themeParams?.text_color),
      }}
    >
      {props.children}
    </StableContainer>
  );
}
