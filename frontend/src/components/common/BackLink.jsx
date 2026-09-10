import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackLink = ({ to, label = 'Back' }) => (
  <Link
    to={to}
    className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-primary-600 hover:underline dark:text-primary-400"
  >
    <ArrowLeft className="h-4 w-4" />
    {label}
  </Link>
);

export default BackLink;
