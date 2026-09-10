import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white dark:bg-gray-900">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h1>
    <p className="text-gray-500 dark:text-gray-400">Page not found</p>
    <Link to="/" className="text-primary-600 hover:underline dark:text-primary-400">
      Go back home
    </Link>
  </div>
);

export default NotFound;
