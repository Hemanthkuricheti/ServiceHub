import { Link } from 'react-router-dom';
import { CARD_TINTS, ICON_TINTS } from '../../utils/colorStyles';

const StatCard = ({ icon: Icon, label, value, color = 'primary', to }) => {
  const content = (
    <>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${ICON_TINTS[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </>
  );

  const className = `flex items-center gap-4 rounded-xl border p-4 ${CARD_TINTS[color]} ${
    to ? 'transition hover:shadow-sm dark:hover:border-primary-500' : ''
  }`;

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
};

export default StatCard;
