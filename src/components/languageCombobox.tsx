import {
  ComboboxOption,
  DimensionCombobox,
  DimensionComboboxProps,
} from "./dimensionCombobox";

// Downloaded from https://datahub.io/core/language-codes "ietf-language-tags"
import IetfLanguageTags from "../lib/ietf-language-tags.json";
import { useMemo } from "react";

const defaultOptions: ComboboxOption[] = IetfLanguageTags.map(
  ({ lang }): ComboboxOption => ({ value: lang, label: lang }),
);

type LanguageComboboxProps = Omit<
  DimensionComboboxProps,
  "label" | "options"
> & { additionalOptions?: ComboboxOption[] };

export const LanguageCombobox = (props: LanguageComboboxProps) => {
  const options = useMemo(() => {
    return props.additionalOptions
      ? [...props.additionalOptions, ...defaultOptions]
      : defaultOptions;
  }, [props.additionalOptions]);

  return <DimensionCombobox label="Language" options={options} {...props} />;
};
