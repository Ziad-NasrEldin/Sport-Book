import {
  fontFamily as jakartaFamily,
  loadFont as loadJakarta,
} from "@remotion/google-fonts/PlusJakartaSans";
import {
  fontFamily as lexendFamily,
  loadFont as loadLexend,
} from "@remotion/google-fonts/Lexend";

loadJakarta("normal", {
  subsets: ["latin"],
  weights: ["500", "700", "800"],
});

loadLexend("normal", {
  subsets: ["latin"],
  weights: ["500", "700"],
});

export const FONT_STACKS = {
  display: jakartaFamily,
  body: jakartaFamily,
  ui: lexendFamily,
} as const;
