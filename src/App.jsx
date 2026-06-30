import AppRoutes from './AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen">
      <Toaster position="top-right" containerStyle={{ zIndex: 100000 }} />
      <AppRoutes />
    </div>
  );
}

export default App;
