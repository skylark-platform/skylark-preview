import Datepicker, {
  DateValueType,
  Configs,
} from "react-tailwindcss-datepicker";
import dayjs from "dayjs";
import { FiCalendar, FiClock, FiX } from "react-icons/fi";
import { useCallback } from "react";

interface DateTimePickerProps {
  name: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const in1Day = dayjs().add(1, "day");
const in1Week = dayjs().add(1, "week");
const in2Weeks = dayjs().add(2, "week");
const in1Month = dayjs().add(1, "month");
const in3Months = dayjs().add(3, "month");
const in6Months = dayjs().add(6, "month");
const in1Year = dayjs().add(1, "year");

const shortCuts = [
  { key: "1day", text: "In a day", date: in1Day },
  { key: "1week", text: "In a week", date: in1Week },
  { key: "2week", text: "In 2 weeks", date: in2Weeks },
  { key: "1month", text: "In a month", date: in1Month },
  { key: "3months", text: "In 3 months", date: in3Months },
  { key: "6months", text: "In 6 months", date: in6Months },
  { key: "1year", text: "In 1 year", date: in1Year },
];

const datePickerConfigs: Configs = {
  shortcuts: shortCuts.reduce(
    (prev, { key, text, date }) => ({
      ...prev,
      [key]: {
        text,
        period: {
          start: date.format("YYYY-MM-DD"),
          end: date.format("YYYY-MM-DD"),
        },
      },
    }),
    {},
  ),
};

const formatDate = (value: string) => {
  return value ? dayjs(value).format("YYYY-MM-DD") : null;
};

const formatTime = (value: string) => {
  return value ? dayjs(value).format("HH:mm:ss") : "";
};

export const DateTimePicker = ({
  name,
  disabled,
  value,
  onChange,
}: DateTimePickerProps) => {
  const handleDateChange = useCallback(
    (newDateRange: DateValueType) => {
      const newDate = newDateRange?.startDate;

      if (!newDate) {
        onChange("");
        return;
      }

      const parsedDate =
        typeof newDate === "string" ? new Date(newDate) : newDate;

      const updated = dayjs(value || undefined)
        .year(parsedDate.getFullYear())
        .month(parsedDate.getMonth())
        .date(parsedDate.getDate())
        .second(0)
        .millisecond(0);

      const isoDate = updated.toISOString();

      onChange(isoDate);
    },
    [onChange, value],
  );

  const handleTimeChange = useCallback(
    (newTime: string) => {
      if (!newTime) {
        return;
      }

      const parsedTimes = newTime.split(":").map((val): number => {
        try {
          return parseInt(val) || 0;
        } catch {
          return 0;
        }
      });

      const updated = dayjs(value || undefined)
        .hour(parsedTimes?.[0] || 0)
        .minute(parsedTimes?.[1] || 0)
        .second(0)
        .millisecond(0);

      const isoDate = updated.toISOString();

      onChange(isoDate);
    },
    [onChange, value],
  );

  return (
    <div
      className="grid grid-cols-7 items-center justify-center gap-1"
      data-testid="datetime-picker"
    >
      <div className="relative col-span-4 w-full">
        <label
          className="absolute left-2 top-0 z-10 -translate-y-1/2 transform text-sm font-medium uppercase text-manatee-500 md:left-3"
          htmlFor={`${name}-date-picker`}
        >
          <span className="bg-white px-2">{"Date"}</span>
        </label>
        <Datepicker
          inputName={`${name}-date-picker`}
          inputId={`${name}-date-picker`}
          disabled={disabled}
          toggleIcon={(open) =>
            open ? (
              <FiCalendar className="h-4 w-4" />
            ) : (
              <FiX className="h-4 w-4" />
            )
          }
          value={{
            startDate: formatDate(value),
            endDate: formatDate(value),
          }}
          onChange={handleDateChange}
          useRange={false}
          asSingle
          showShortcuts
          configs={datePickerConfigs}
          inputClassName={
            "form-input w-full rounded-lg border border-gray-200 p-3 text-base text-gray-800 focus:ring-brand-primary"
          }
          containerClassName={(cls) =>
            cls.replace("border-", "") +
            " skylark-preview-date-picker text-sm w-full relative border-none [&_div.grid.grid-cols-7>button]:h-8 [&_div.grid.grid-cols-7>button]:w-8"
          }
        />
      </div>
      <div className="relative col-span-3 w-full">
        <label
          className="absolute left-2 top-0 z-10 -translate-y-1/2 transform text-sm font-medium uppercase text-manatee-500 md:left-3"
          htmlFor={`${name}-time-picker`}
        >
          <span className="bg-white px-2">{"Time"}</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 top-0 flex items-center pe-3 text-manatee-500">
            <FiClock className="h-4 w-4" aria-hidden={true} />
          </div>
          <input
            name={`${name}-time-picker`}
            type="time"
            step={60}
            disabled={disabled}
            onChange={(e) => handleTimeChange(e.target.value)}
            id={`${name}-time-picker`}
            className="form-input w-full rounded-lg border border-gray-200 p-3 text-base text-gray-800 focus:ring-brand-primary"
            value={formatTime(value)}
          />
        </div>
      </div>
    </div>
  );
};
