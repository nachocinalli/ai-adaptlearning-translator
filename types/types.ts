export type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4';
export type FormatMode = 'csv' | 'json'; 
export interface TranslateBody {
  
  inputLanguage: string;
  outputLanguage: string;
  inputCode: string;
  model: OpenAIModel;
  format: FormatMode;
  apiKey: string;
}

export interface TranslateResponse {
  code: string;
}
