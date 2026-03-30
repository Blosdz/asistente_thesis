import AppRoutes from './AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <AppRoutes />
    </div>
  );
}

export default App;
