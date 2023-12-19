import { FormatMode } from '@/types/types';
import { FC } from 'react';

interface Props {
  model: FormatMode;
  onChange: (model: FormatMode) => void;
}

export const FormatSelect: FC<Props> = ({ model, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as FormatMode);
  };

  return (
    <select
      className="h-[40px] w-[140px] rounded-md bg-[#1F2937] px-4 py-2 text-neutral-200"
      value={model}
      onChange={handleChange}
    >
      <option value="csv">CSV</option>
      <option value="json">JSON</option>
    </select>
  );
};
