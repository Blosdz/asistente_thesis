import { Toaster } from 'react-hot-toast';

import AppRoutes from './AppRoutes';

function App() {
  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <AppRoutes />
    </div>
  );
}

export default App;
