// utils/languageOptions.js
import { languageOptions } from './languageOptions';

export const getLanguageFromExtension = (fileName) => {
  const ext = fileName.split('.').pop();
  const language = languageOptions.find(option => option.extension === ext);

  if (language) {
    return {
      name: language.name,
      id: language.id
    };
  }
};
