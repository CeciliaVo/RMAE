import React from 'react'
import ReactDOM from 'react-dom/client'
import "react-toastify/dist/ReactToastify.css";
import App from './App.jsx'
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ToastContainer
          autoClose={3000}
          closeOnClick
          pauseOnFocusLoss={false}
          pauseOnHover={false}
        />
  </React.StrictMode>,
)
