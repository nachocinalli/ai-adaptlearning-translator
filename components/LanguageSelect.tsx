import type { FC } from 'react';

interface Props {
  language: string;
  onChange: (language: string) => void;
}

export const LanguageSelect: FC<Props> = ({ language, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      className="w-full rounded-md bg-[#1F2937] px-4 py-2 text-neutral-200"
      value={language}
      onChange={handleChange}
    >
      {languages
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((language) => (
          <option key={language.value} value={language.label}>
            {language.label}
          </option>
        ))}
    </select>
  );
};

//list the top 10 languages
const languages = [
  {
    label: 'English',
    value: 'en',
  },
  {
    label: 'Chinese',
    value: 'zh',
  },
  {
    label: 'Spanish',
    value: 'es',
  },
  {
    label: 'French',
    value: 'fr',
  },
  {
    label: 'Russian',
    value: 'ru',
  },
  {
    label: 'Arabic',
    value: 'ar',
  },
  {
    label: 'Portuguese',
    value: 'pt',
  },
  
  {
    label: 'Japanese',
    value: 'ja',
  },
  {
    label: 'German',
    value: 'de',
  },
  {
    label: 'Korean',
    value: 'ko',
  },
  {
    label: 'Italian',
    value: 'it',
  },
  {
    label: 'Dutch',
    value: 'nl',
  }
 
 ,
];
