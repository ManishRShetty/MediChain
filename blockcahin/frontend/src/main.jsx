import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import createStore from 'react-auth-kit/createStore';

const store = createStore({
  authName: '_auth',
  authType: 'localstorage',
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'https:',
});

import AuthProvider from 'react-auth-kit';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider store={store}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
