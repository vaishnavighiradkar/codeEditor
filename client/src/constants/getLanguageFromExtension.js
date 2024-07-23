// utils/languageOptions.js
import { langMap } from './languageOptions';

export const getLanguageFromExtension = (fileName) => {
  const ext = fileName.split('.').pop();
  const language = Object.keys(langMap).find(key => langMap[key] === ext);
  return language || 'plaintext'; // Default to plaintext if no match found
};
