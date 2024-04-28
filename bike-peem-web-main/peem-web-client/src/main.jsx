import React from 'react'

//router
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//context
import { UserAuthContextProvider } from './context/UserAuthContext.jsx';

//styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

//component
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import Register from './component/login/Register.jsx';
import Login from './component/login/Login.jsx';
import Home from './component/Home.jsx';
import Album from './component/Album.jsx';
import NewCollection from './component/NewCollection.jsx';
import ViewEmp from './component/ViewEmp.jsx';
import DeleteEmp from './component/DeleteEmp.jsx';
import Search from './component/Search.jsx';
import TestSearchPic from './component/TestSearchPic.jsx';
import Modall from './component/ModalTest/Modal.jsx';
// import Md from './component/ModalTest/Md.jsx';
import Example from './component/tt.jsx';
import Conclude from './component/Conclude.jsx';
import Greeting from './component/Greeting.jsx';
import History from './component/History.jsx';
import NewShow from './component/NewShow.jsx';

//create router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/home',
    element: <ProtectedRoute><Home /></ProtectedRoute>
  },
  {
    path: '/album',
    element: <ProtectedRoute><Album /></ProtectedRoute>
  },
  {
    path: '/newCollection',
    element: <ProtectedRoute><Modall /></ProtectedRoute>
  },
  {
    path: '/viewEmp/',
    element: <ProtectedRoute><Album /></ProtectedRoute>
  },
  {
    path: '/viewEmp/:name',
    element: <ProtectedRoute><ViewEmp /></ProtectedRoute>
  },
  {
    path: '/history/',
    element: <ProtectedRoute><Search /></ProtectedRoute>
  },
  {
    path: '/searchbyimg/',
    element: <ProtectedRoute><TestSearchPic /></ProtectedRoute>
  },
  {
    path: '/tt/:name',
    element: <ProtectedRoute><Example /></ProtectedRoute>
  },
  {
    path: '/tt/',
    element: <ProtectedRoute><Album /></ProtectedRoute>
  },
  {
    path: '/conclude',
    element: <ProtectedRoute><Conclude /></ProtectedRoute>
  },
  {
    path: '/history/:name',
    element: <ProtectedRoute><Search /></ProtectedRoute>
  },
  {
    path: '/history/',
    element: <ProtectedRoute><Conclude /></ProtectedRoute>
  },
  {
    path: '/greeting/',
    element: <ProtectedRoute><Greeting /></ProtectedRoute>
  },
  {
    path: '/allhistory/',
    element: <ProtectedRoute><History /></ProtectedRoute>
  },
  {
    path: '/testnew/',
    element: <ProtectedRoute><NewShow /></ProtectedRoute>
  },
  {
    path: '/reg/',
    element: <Register />
  },



]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserAuthContextProvider>
      <RouterProvider router={router} />
    </UserAuthContextProvider>
  </React.StrictMode>,
);