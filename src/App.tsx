import { Toaster } from 'react-hot-toast';

import AppRoutes from './AppRoutes';

function App() {
  return (
    <div className="min-h-screen">
      <Toaster position="top-right" containerStyle={{ zIndex: 100000 }} />
      <AppRoutes />
    </div>
  );
}

export default App;
