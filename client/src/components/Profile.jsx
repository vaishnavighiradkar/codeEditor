import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import image from '../utils/profile.jpg'
import { useRef } from 'react';
const Profile = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const token = localStorage.getItem('token');
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleGetCode = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/getcode`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    handleGetCode();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    console.log("clicked")
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    console.log("token removed")
    setDropdownOpen(!dropdownOpen)
    navigate('/');
  };
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const handlehome = () => {
    navigate('/')
  }
  const handleOpenEditor = () => {
    navigate('/profile/openedfile', { state: {fileName: selectedFile.fileName, code: selectedFile.code } });
  };
  return (<>
    <div className="flex sm:flex-row flex-col gap-4 py-2 pb-4 border-b border-white">
      <div className='flex flex-row gap-4 ml-auto' ref={dropdownRef}>
        <button
          onClick={handlehome}
          type="button"
          className="text-white hover:border font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2"
        >
          {"Home"}
        </button>
        <button onClick={toggleDropdown}>
          <img src={image} alt='profile' height={30} width={30} />
        </button>

        {dropdownOpen && (
          <div className="absolute flex flex-col z-50 top-10 right-0 mt-2 w-[145px] bg-white rounded-md shadow-md">

            <button
              onClick={handleLogout}
              className={`text-[14px] leading-[21px] w-full text-left py-[12px] pl-[22px]`}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-gray-100 border-r border-gray-300 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Files</h2>
        {files.map((file) => (
          <div
            key={file._id}
            className="p-2 mb-2 cursor-pointer bg-white hover:bg-gray-200 border border-gray-300 rounded"
            onClick={() => handleFileClick(file)}
          >
            {file.fileName}
          </div>
        ))}
      </div>
      <div className="w-3/4 p-4 overflow-y-auto">
        {
          selectedFile && (<button onClick={handleOpenEditor} className="text-white hover:border font-medium rounded-lg text-sm px-3 py-2 mt-0 my-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">{"Open in Editor"}</button>)
        }
        {selectedFile ? (
          <textarea
            className="w-full h-full p-4 border border-gray-300 rounded"
            value={selectedFile.code}
            readOnly
          />
        ) : (
          <p className="text-gray-500">Select a file to view its content</p>
        )}

      </div>
    </div>
  </>
  );
};

export default Profile;
