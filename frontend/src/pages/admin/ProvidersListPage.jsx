import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import BackLink from '../../components/common/BackLink';
import FilterBar from '../../components/admin/FilterBar';
import ProviderTable from '../../components/admin/ProviderTable';
import Pagination from '../../components/common/Pagination';
import { getProvidersApi } from '../../api/admin.api';

const ProvidersListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [loading, setLoading] = useState(true);

  const updateSearchParams = (next) => {
    const params = {};
    if (next.status) params.status = next.status;
    if (next.category) params.category = next.category;
    setSearchParams(params, { replace: true });
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    updateSearchParams({ status: value, category });
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    updateSearchParams({ status, category: value });
  };

  const fetchProviders = (page = 1) => {
    setLoading(true);
    getProvidersApi({ search, status, category, page, limit: 10 })
      .then(({ data }) => {
        setProviders(data.data.providers);
        setPagination(data.data.pagination);
      })
      .catch(() => toast.error('Failed to load providers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProviders(1), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, category]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <BackLink to="/admin" label="Back to Dashboard" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Service Providers</h1>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={handleStatusChange}
          category={category}
          onCategoryChange={handleCategoryChange}
        />
      </div>
      {loading ? <Loader /> : <ProviderTable providers={providers} />}
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchProviders} />
    </div>
  );
};

export default ProvidersListPage;
