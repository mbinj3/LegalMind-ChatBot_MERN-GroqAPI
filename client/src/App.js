import './App.css';
import Home from './pages/Home';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Home />
    </ToastProvider>
  );
}

export default App;
