import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { FiCheck, FiX, FiChevronDown } from "react-icons/fi";
import clsx from "clsx";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface DimensionComboboxProps {
  label: string;
  selectedValue: ComboboxOption["value"];
  options: ComboboxOption[];
  onChange: (value?: ComboboxOption) => void;
}

export const DimensionCombobox = ({
  label,
  selectedValue,
  options,
  onChange,
}: DimensionComboboxProps) => {
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? options
      : options.filter(
          (option) =>
            option.label.toLowerCase().includes(query.toLowerCase()) ||
            option.value.toLowerCase().includes(query.toLowerCase()),
        );

  const selectedOption = options.find(({ value }) => selectedValue === value);

  return (
    <Combobox value={selectedOption || ""} onChange={onChange}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default rounded-lg border border-gray-200 py-1 text-left text-sm text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <Combobox.Label className="absolute left-2 top-0 -translate-y-1/2 transform text-xs font-medium uppercase text-manatee-500 md:left-3">
            <span className="bg-white px-2">{label}</span>
          </Combobox.Label>

          <Combobox.Button as="div" className="">
            <Combobox.Input
              className="w-full border-none py-2 pl-4 pr-10 text-sm leading-5 text-gray-800 focus:ring-0"
              displayValue={(option: ComboboxOption) => option.label}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button className="absolute inset-y-0 right-0 top-0 flex items-center pr-2 text-manatee-500">
              <FiChevronDown className="h-6 w-6" />
            </button>
          </Combobox.Button>
          {(query || selectedValue) && (
            <button
              className="absolute inset-y-0 right-8 top-0 text-manatee-500 transition-colors hover:text-brand-primary"
              onClick={() => {
                onChange();
                setQuery("");
              }}
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
        <Transition
          afterLeave={() => setQuery("")}
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-24 w-full overflow-auto rounded-md bg-white py-0.5 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                {`Nothing found.`}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  className={({ active }) =>
                    `relative cursor-default select-none py-1 pl-6 pr-4 ${
                      active ? "bg-brand-primary text-white" : "text-gray-900"
                    }`
                  }
                  key={option.value}
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={clsx(
                          "`block truncate",
                          selected ? "font-medium" : "font-normal",
                        )}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          className={clsx(
                            "absolute inset-y-0 left-0 top-0 flex items-center pl-1 text-lg",
                            active ? "text-black" : "text-brand-primary",
                          )}
                        >
                          <FiCheck aria-hidden="true" className="h-4 w-4" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};
