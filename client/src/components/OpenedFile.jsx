import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CodeEditorWindow from './CodeEditorWindow';
import { getLanguageFromExtension } from '../constants/getLanguageFromExtension';

const OpenedFile = () => {
  const location = useLocation();
  const { fileName, code } = location.state || {  fileName: '', code: '' };
  const [currentCode, setCurrentCode] = useState(code);
  const language = getLanguageFromExtension(fileName);
  console.log('code:', code);

  const onChange = (newCode) => {
    setCurrentCode(newCode);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/updatecode`,
        {
          fileName,
          code: currentCode,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert('Code saved successfully!');
      } else {
        console.error('Unexpected response:', response);
        alert('Failed to save code.');
      }
    } catch (error) {
      console.error('Error saving code:', error);
      alert('Failed to save code.');
    }
  };

  return (
    <div className="h-screen p-4">
      <CodeEditorWindow
        code={currentCode}
        Fontoptions={{
          fontSize: '16',
        }}
        onChange={onChange}
        language={language}
        theme="vs-dark"
        isFullScreen={false}
      />
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Save
      </button>
    </div>
  );
};

export default OpenedFile;
