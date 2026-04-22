import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className="min-h-screen">
      <RouterProvider router={router} />
      <Toaster position="top-right" theme="light" />
    </div>
  );
}