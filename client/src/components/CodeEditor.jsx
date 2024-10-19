import React, { useEffect, useState } from 'react'
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { languageOptions } from "../constants/languageOptions";
import { snippet } from "../constants/snippet";
import { classnames } from "../utils/general";
import './codeEditor.css'
import { FaExpand, FaCompress, FaRegCopy, FaFileDownload } from 'react-icons/fa';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/defineTheme"
import LanguagesDropdown from './LanguageDropdown';
import ThemeDropdown from './ThemeDropdown';
import CustomInput from './CustomInput';
import OutputWindow from './OutputWindow';
import OutputDetails from './OutputDetails';
import useKeyPress from '../hooks/useKeyPress';
import DateDiff from 'date-diff';
import copy from 'copy-to-clipboard';
import StopWatch from './StopWatch';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import image from '../utils/profile.jpg'
const defaultCode = `// Type Your code here 1`;
const CodeEditor = () => {


    function loadTheme() {
        let th = { label: 'Blackboard', value: 'blackboard', key: 'blackboard' }
        if (localStorage.getItem("usertheme")) {
            th = JSON.parse(localStorage.getItem("usertheme"))
        }
        return th;

    }

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
    const [code, setCode] = useState(defaultCode);
    const [theme, setTheme] = useState("");
    const [customInput, setCustomInput] = useState("");
    const [outputDetails, setOutputDetails] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [fullScreen, setFullScreen] = useState(false);
    const [font_size, set_font_size] = useState(16)
    const [language, setLanguage] = useState(JSON.parse(localStorage.getItem("language")) || languageOptions[0]);
    const [offlineStatus, SetofflineStatus] = useState(false)
    const [dropdownOpen, setDropdownOpen]=useState(false)
    const [filename,setFilename]=useState( `Untitled.${language?.extension}`)
    const dropdownRef = useRef(null);
    // const defaultName=`Untitled.${language?.extension}`

    const token = localStorage.getItem('token');
  const navigate =useNavigate();
    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth <= 1200);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);
    function setOffline() {
        SetofflineStatus(true);
    }
    function setOnline() {
        SetofflineStatus(false)
    }
    // reset code 
    function ctrlplusr(e) {

        if (e.keyCode === 69 && e.ctrlKey) {

            e.preventDefault()
            resetCode()
        }
        else if (e.keyCode === 83 && e.ctrlKey) {
            e.preventDefault()
            downloadTxtFile()
        }
    }

  useEffect(()=>{
 setFilename(`Untitled.${language?.extension}`)
 //console.log('filename')
  },[language])
    useEffect(() => {

        window.addEventListener('online', setOnline);
        window.addEventListener('offline', setOffline);
        window.addEventListener('keydown', ctrlplusr);
        return () => {
            window.removeEventListener("online", setOnline)
            window.removeEventListener("offline", setOffline)
            window.removeEventListener('keydown', ctrlplusr)
        }
    })




    const onCodechange = (data) => {
        
        setCode(data);
        window.localStorage.setItem(language.value, JSON.stringify(data))
       
    };



    useEffect(() => {
        const prevCode = JSON.parse(localStorage.getItem(language.value));
        setCode(prevCode || snippet(language.value));

    }, [language.value]);





    const ctrlPress = useKeyPress("Control");
    const key_run = useKeyPress("F9");
    const key_save = useKeyPress("q")
    const key_fullScreen = useKeyPress("F11");




    const onSelectChange = (sl) => {

        setLanguage(sl);
        setOutputDetails(null);
        localStorage.setItem("language", JSON.stringify(sl));
    };

    const downloadTxtFile = (data) => {
        const element = document.createElement("a");
        const file = new Blob([data], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);

        element.download = `${language.value}-code.txt`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();

    }

    


    useEffect(() => {
        if (key_run) {
            handleCompile();
        }
        // eslint-disable-next-line
    }, [ctrlPress, key_run]);

    useEffect(() => {
        if (ctrlPress && key_save) {

            downloadTxtFile(code)
        }
        // eslint-disable-next-line
    }, [ctrlPress, key_save, code]);




    async function handleThemeChange(th) {
        const theme = th;

        if (["light", "vs-dark"].includes(theme.value)) {
            setTheme(theme);
        } else {

            defineTheme(theme.value)
                .then((_) => {

                    setTheme(theme);
                    localStorage.setItem("usertheme", JSON.stringify(theme));
                })
        }

    }

    const handleCompile = () => {
        
        if (processing) return
        setProcessing(true);
       

            const formData = {
                language_id: language.id,
                source_code: btoa(code),
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
                    // //console.log("res.data", response.data);
                    const token = response.data.token;
                    checkStatus(token);
                })
                .catch((err) => {
                    let error = err.response ? err.response.data : err;
                    setProcessing(false);
                    console.dir(error);

                });

        
    };
    
    
    const handlesavecode = async () => {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/auth/savecode`,
            {
              code: code,
              fileName: filename,
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          if (response.status === 201) {
            window.alert('Code saved successfully');
          }
        } catch (error) {
          if (error.response && error.response.status === 400) {
            window.alert('File name already exists');
          } else {
            window.alert('Error occurred. Please login again');
          }
        }
      };
      

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
              
                return
            }
        } catch (err) {
            setProcessing(false);
            showErrorToast();
        }
    };


    const resetCode = () => {

        let text = "Your code will be discarded and reset to the default code!";
        if (window.confirm(text)) {
            setCode(snippet(language.value))
        }

    }


    const makeFullScreen = async () => {
        if (!fullScreen) {
            // launchFullscreen(document.documentElement)
            setFullScreen(true)
        }
        else {
            // exitFullscreen();
            setFullScreen(false)
        }

    }


    useEffect(() => {
        if (key_fullScreen) {
            // makeFullScreen()
        }
        //eslint-disable-next-line
    }, [key_fullScreen]);


    // const url = window.location.pathname.split('/').pop();


    useEffect(() => {
        let th = loadTheme();
       
        handleThemeChange(th);
    }, []);

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


    const handleShare = async () => {

        try {
            await navigator.share({
                files: [
                    new File([code], 'codetext.txt', { type: "text/plain", }),
                ],
                title: 'code',
                text: 'code',
            },
                {

                    copy: true,
                    email: true,
                    print: true,
                    sms: true,
                    messenger: true,
                    facebook: true,
                    whatsapp: true,
                    twitter: true,
                    aedin: true,
                    telegram: true,
                    skype: true,
                    pinterest: true,
                    language: 'pt'
                }
            );

        } catch (err) {
            console.error(err);
        }
    };
const handlelogin=()=>{
    navigate('/login')
}

    // =======================* Split view *=====================*****==============
    useEffect(() => {
        if(!isSmallScreen)
        {   
            const resizer = document.getElementById('dragMe');
        const leftSide = resizer.previousElementSibling;
        const rightSide = resizer.nextElementSibling;


        let x = 0;
        let leftWidth = 0;

        // Handle the mousedown event
        // that's triggered when user drags the resizer
        const mouseDownHandler = function (e) {
            // Get the current mouse position

            x = e.clientX;
            leftWidth = leftSide.getBoundingClientRect().width;
            resizer.style.cursor = 'col-resize';
            document.body.style.cursor = 'col-resize';

            // Attach the listeners to `document`
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);

        };
        // Attach the handler
        resizer.addEventListener('mousedown', mouseDownHandler);

        const mouseMoveHandler = function (e) {
            // How far the mouse has been moved
            if (leftSide && rightSide) {
                const dx = e.clientX - x;


                const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
                leftSide.style.width = `${newLeftWidth}%`;

                leftSide.style.userSelect = 'none';
                leftSide.style.pointerEvents = 'none';

                rightSide.style.userSelect = 'none';
                rightSide.style.pointerEvents = 'none';
            }
        };


        const mouseUpHandler = function () {
            resizer.style.removeProperty('cursor');
            document.body.style.removeProperty('cursor');

            leftSide.style.removeProperty('user-select');
            leftSide.style.removeProperty('pointer-events');

            rightSide.style.removeProperty('user-select');
            rightSide.style.removeProperty('pointer-events');

            // Remove the handlers of `mousemove` and `mouseup`
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        }
        
    },[isSmallScreen])


    const copyToClipboard = () => {
        copy(code);
        showSuccessToast('Copied')
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        //console.log("token removed")
        setDropdownOpen(!dropdownOpen)
        navigate('/');
      };
      const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
      };

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
          }
        };
    //console.log("clicked")
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {
                !fullScreen &&
                <>
                    <div className="h-1 w-full">
                    </div>

                    <div className="flex sm:flex-row flex-col  gap-4 py-2 pb-4 border-b border-white" >
                        <div className='flex flex-row gap-4'>

                        <div className="dropdownInner ml-3">
                            <LanguagesDropdown onSelectChange={onSelectChange} Userlanguage={language} />
                        </div>
                        <div className="dropdownInner hidden lg:block">
                            <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
                        </div>
                        <button onClick={copyToClipboard} type="button" id="copytxt" className="flex items-center py-2 px-4 mr-3  text-xs font-medium  rounded-lg border focus:outline-none hover:bg-gray-700 hover:text-blue-700 focus:z-10  focus:ring-gray-500 bg-gray-800 border-gray-600 hover:text-white hover:bg-gray-700">
                            <FaRegCopy fontSize={18} color="white" />
                        </button>
                        <button onClick={makeFullScreen} type="button" className="hidden lg:block flex items-center py-2 px-4 mr-3 text-xs font-medium  rounded-lg border focus:outline-none hover:bg-gray-700 hover:text-blue-700 focus:z-10  focus:ring-gray-500 bg-gray-800 border-gray-600 hover:text-white hover:bg-gray-700">
                            <FaExpand fontSize={16} color="white" />
                        </button>
                        <button onClick={downloadTxtFile} type="button" className="hidden lg:block flex items-center py-2 px-4 mr-3 text-xs font-medium  rounded-lg border focus:outline-none hover:bg-gray-700 hover:text-blue-700 focus:z-10  focus:ring-gray-500 bg-gray-800 border-gray-600 hover:text-white hover:bg-gray-700">
                            <FaFileDownload fontSize={16} color="white" />
                        </button>
                        
                        </div>

                        <div   ref={dropdownRef}
                         className="px-4  mx-auto justify-end flex items-center" style={{
                            flex: 1
                        }} >



                            <button
                                disabled={processing || offlineStatus}
                                onClick={handleCompile} type="button" className="text-white hover:border font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">

                                {

                                    processing ?
                                        <>
                                            <svg role="status" className="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                            </svg>
                                            running...
                                        </>
                                        :
                                        "Run"

                                }
                            </button>


                            <button onClick={handlesavecode} type="button" className="text-white   hover:border font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">
                                {"Save"}
                            </button>

                            <button onClick={resetCode} type="button" className="text-white   hover:border font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">
                                {"Reset"}
                            </button>
                            <button onClick={handleShare} type="button" className="text-white bg-[#db2777] hover:bg-[#ec4899]   focus:outline-none font-medium rounded-lg text-sm px-3 py-1 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">
                                Share
                            </button>
                            {
                                token ? (<button onClick={toggleDropdown}> <img src={image} alt='profile' height={30} width={30} /></button>)
                                :(<button onClick={handlelogin} type="button" className="text-white bg-[#db2777] hover:bg-[#ec4899]   focus:outline-none font-medium rounded-lg text-sm px-3 py-1 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">
                                    Login
                                </button>)
                            }
                            {dropdownOpen && (
                <div className="absolute flex flex-col z-50 top-10 right-0 mt-2 w-[145px] bg-white rounded-md shadow-md">
                  <a 
                  
                    href={"/profile"}
                    className={`  text-[14px] border-b border-bordergray leading-[21px] w-full text-left py-[12px] pl-[22px] `}
                  >
                    My Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className={`  text-[14px] leading-[21px] w-full text-left py-[12px] pl-[22px] `}
                  >
                    Log Out
                  </button>
                </div>
              )}
                           

                        </div>
                    </div >
                </>
            }


            < div className="pt-2 flex md:flex-row flex-col  space-x-4  border-2 border-t-0 border-b-0 border-gray-600"
                style={{
                    height: fullScreen ? "99vh" : `${!isSmallScreen?`calc(100vh - 6.4vh )`:`120vh`}`,
                }}>
                <div className={`flex flex-col h-full  sm:overflow-hidden overflow-auto  justify-start items-end ${!isSmallScreen?`container__left`:``}`}>
                   { token &&( <input value={filename} onChange={(e)=>{setFilename(e.target.value)}} className='py-2 px-4 rounded-md lg:mr-0 mr-12' ></input>)}
                    <CodeEditorWindow
                        code={code}
                        Fontoptions={{
                            fontSize: font_size
                        }}
                        onChange={onCodechange}
                        language={language?.value}
                        theme={theme.value}
                        isFullScreen={fullScreen}
                    />
                </div>
               
                {!isSmallScreen && (<div className="resizer mt-1" id="dragMe">
                    <svg stroke="currentColor" fill="#f1f5f9" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                    <svg stroke="currentColor" fill="#f1f5f9" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                </div>)}

                <div className="flex  flex-col container__right relative h-full px-1 pt-1"
                    style={{ flex: "1 1 0%" }}>
                    {
                        fullScreen && <button onClick={makeFullScreen} type="button" className="flex items-center py-2 px-4 mr-3 text-xs font-medium  rounded-lg border focus:outline-none hover:bg-gray-700 hover:text-blue-700 focus:z-10  focus:ring-gray-500 bg-gray-800 border-gray-600 hover:text-white hover:bg-gray-700 mt-2"
                            style={{
                                width: "fit-content"
                            }}>
                            {
                                fullScreen ? <FaCompress color='white' /> : <FaExpand color='white' />

                            }
                        </button>
                    }

                    <OutputWindow lang={language.value} outputDetails={outputDetails} offlineStatus={offlineStatus} />
                    <div className="flex flex-col items-end">
                        <CustomInput
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                        />

                        {fullScreen && <button
                            onClick={handleCompile}
                            disabled={!code || processing}
                            className={classnames(
                                "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0 font-bold",
                                (!code || processing) ? "opacity-50" : ""
                            )}
                        >
                            {processing ? "Processing..." : "F9 -  Run Code"}
                        </button>}


                    </div>
                    {<OutputDetails runcode={handleCompile} savecode={downloadTxtFile} outputDetails={outputDetails}

                        lang={language.value}
                    />}

                    <StopWatch />

                </div>
            </div >
        </>

    )
}

export default CodeEditor;