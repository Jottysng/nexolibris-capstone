import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './app/store';
import { ThemeProvider } from './app/ThemeContext';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<StrictMode><Provider store={store}><ThemeProvider><BrowserRouter><App /></BrowserRouter></ThemeProvider></Provider></StrictMode>);
