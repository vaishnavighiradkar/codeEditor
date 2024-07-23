import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CodeEditorWindow from './CodeEditorWindow';
import { getLanguageFromExtension } from '../constants/getLanguageFromExtension';
import StopWatch from './StopWatch';
import CustomInput from './CustomInput';
import OutputWindow from './OutputWindow';
import OutputDetails from './OutputDetails';
import { toast } from "react-toastify";

const OpenedFile = () => {
  const location = useLocation();
  const { fileName, code } = location.state || { fileName: '', code: '' };
  const [currentCode, setCurrentCode] = useState(code);
  const { name: languageName, id: languageId } = getLanguageFromExtension(fileName);
  const [processing, setProcessing] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [offlineStatus, SetofflineStatus] = useState(false);
  const [outputDetails, setOutputDetails] = useState(null);
  const checkStatus = async (token) => {
    const options = {
        method: "GET",
        url: process.env.REACT_APP_RAPID_API_URL + "/" + token,
        params: { base64_encoded: "true", fields: "*" },
        headers: {
            'x-rapidapi-key': process.env.REACT_APP_RAPID_API_KEY,
'x-rapidapi-host': process.env.REACT_APP_RAPID_API_HOST
        },
    };


    try {
        let response = await axios.request(options);
        let statusId = response.data.status?.id;

        // Processed - we have a result
        if (statusId === 1 || statusId === 2) {
            /* So, if statusId ===1 OR statusId ===2 
            that means our code is still processing and 
            we need to call the API again to check 
            if we get any results or not.*/
            setTimeout(() => {
                checkStatus(token)
            }, 2000)
            return
        } else {
            setProcessing(false)
            setOutputDetails(response.data)
            showSuccessToast(`Compiled Successfully!`)
            // console.log('response.data', response.data)
            return
        }
    } catch (err) {
        console.log("err", err);
        setProcessing(false);
        showErrorToast();
    }
};
const showSuccessToast = (msg) => {
  toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
  });
};
const showErrorToast = (msg) => {
  toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
  });
};
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

  const handleCompile = () => {
    if (processing) return;
    setProcessing(true);

    const formData = {
      language_id: languageId,
      source_code: btoa(currentCode),
      stdin: btoa(customInput),
    };

    const options = {
      method: "POST",
      url: process.env.REACT_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        'x-rapidapi-key': process.env.REACT_APP_RAPID_API_KEY,
        'x-rapidapi-host': process.env.REACT_APP_RAPID_API_HOST,
        'Content-Type': 'application/json'
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        setProcessing(false);
        console.dir(error);
      });
  };

  return (
    <>
      <div className="flex sm:flex-row flex-col gap-4 py-2 pb-4 border-b border-white">
        <div className="px-4 mx-auto justify-end flex items-center" style={{ flex: 1 }}>
          <button
            onClick={handleSave}
            className="text-white hover:border font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2"
          >
            Save
          </button>
          <button
            disabled={processing || offlineStatus}
            onClick={handleCompile}
            type="button"
            className="text-white hover:border font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2"
          >
            {processing ? (
              <>
                <svg role="status" className="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                </svg>
                running...
              </>
            ) : "Run"}
          </button>
        </div>
      </div>

      <div className="pt-2 flex md:flex-row flex-col space-x-4 border-2 border-t-0 border-b-0 border-gray-600" style={{ height: "99vh" }}>      
        <div className="flex flex-col h-full sm:overflow-hidden overflow-auto flex-1">
          <CodeEditorWindow
            code={currentCode}
            Fontoptions={{ fontSize: '16' }}
            onChange={onChange}
            language={languageName} 
            theme='Active4D'
            isFullScreen={false}
          />
        </div>
        <div className="flex flex-col md:w-1/3">
          <OutputWindow lang={languageName} outputDetails={outputDetails} offlineStatus={offlineStatus} />
          <div className="flex flex-col items-end mt-4">
            <CustomInput customInput={customInput} setCustomInput={setCustomInput} />
          </div>
          <OutputDetails runcode={handleCompile} outputDetails={outputDetails} lang={languageName} />
          <StopWatch />
        </div>
      </div>
    </>
  );
};

export default OpenedFile;
