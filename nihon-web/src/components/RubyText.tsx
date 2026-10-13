import { Fragment } from "react";
import { parseFurigana } from "../lib/furigana";

/**
 * Renders text that may carry furigana written as <ruby>漢字<rt>かんじ</rt></ruby>.
 * Text without that markup is shown unchanged, so this is safe to use for any lesson text.
 */
export default function RubyText({ text, showReadings = true }: { text: string; showReadings?: boolean }) {
  if (!text.includes("<ruby>")) return <>{text}</>;
  return <>{parseFurigana(text).map((part, index) => part.reading && showReadings
    ? <ruby key={index}>{part.base}<rt>{part.reading}</rt></ruby>
    : <Fragment key={index}>{part.base}</Fragment>)}</>;
}
