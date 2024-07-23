import React from 'react'
import CodeEditor from "./components/CodeEditor.jsx";
import { ToastContainer } from "react-toastify";
import Login from './components/Login.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup.jsx';
import Profile from './components/Profile.jsx';
import OpenedFile from './components/OpenedFile.jsx';
const App = () => {
  return (
    <>
      {console.log(process.env.REACT_APP_RAPID_API_URL)}
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
      {/* <JsonEditor /> */}

      <Router>
        <Routes>
          <Route exact path="/" element={<CodeEditor />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path='/profile' element={<Profile/>}/>
          <Route exact path="/profile/openedfile" element={<OpenedFile />} />
          {/* <Route exact path="/codeeditor" element={<CodeEditor />} />
          <Route exact path="/jsoneditor" element={<JsonEditor />} /> */}
        </Routes>
      </Router>
    </>
  )
}

export default App