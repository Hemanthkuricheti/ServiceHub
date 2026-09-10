import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import { getDashboardStatsApi } from '../../api/admin.api';
import { useTheme } from '../../context/ThemeContext';

const STATUS_COLORS = {
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  incomplete: '#9ca3af',
};

const STATUS_LABELS = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  incomplete: 'Incomplete',
};

const Overview = () => {
  const [stats, setStats] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridStroke = isDark ? '#374151' : '#f3f4f6';
  const tickFill = isDark ? '#9ca3af' : '#6b7280';
  const cursorFill = isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb';
  const tooltipStyle = isDark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f3f4f6' }
    : undefined;

  useEffect(() => {
    getDashboardStatsApi()
      .then(({ data }) => setStats(data.data.stats))
      .catch(() => toast.error('Failed to load dashboard stats'));
  }, []);

  if (!stats) return <Loader fullScreen />;

  const pieData = ['approved', 'pending', 'rejected', 'incomplete']
    .map((key) => ({ key, name: STATUS_LABELS[key], value: stats[key] || 0 }))
    .filter((d) => d.value > 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Providers" value={stats.total} color="blue" to="/admin/providers" />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={stats.pending}
          color="amber"
          to="/admin/providers?status=pending"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={stats.approved}
          color="primary"
          to="/admin/providers?status=approved"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="red"
          to="/admin/providers?status=rejected"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Provider Registrations · Last 6 Months
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: cursorFill }} contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Registrations"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Application Status Breakdown
          </h2>
          {pieData.length === 0 ? (
            <p className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No applications yet
            </p>
          ) : (
            <div className="flex h-64 items-center gap-4">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    isAnimationActive={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {pieData.map((entry) => (
                  <div key={entry.key} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[entry.key] }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">{entry.name}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.round((entry.value / stats.total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
