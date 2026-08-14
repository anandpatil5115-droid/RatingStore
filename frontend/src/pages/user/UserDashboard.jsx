import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listStores } from '../../services/storeApi';
import { formatAvg } from '../../utils/format';
import StarRating from '../../components/StarRating';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import ErrorBox from '../../components/ErrorBox';
import { initials } from '../../utils/format';

const PAGE_SIZE = 9;

const STORE_COLORS = [
  { bg: 'bg-blue-50', icon: 'text-blue-600' },
  { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  { bg: 'bg-violet-50', icon: 'text-violet-600' },
  { bg: 'bg-amber-50', icon: 'text-amber-600' },
  { bg: 'bg-rose-50', icon: 'text-rose-600' },
  { bg: 'bg-cyan-50', icon: 'text-cyan-600' },
  { bg: 'bg-fuchsia-50', icon: 'text-fuchsia-600' },
  { bg: 'bg-lime-50', icon: 'text-lime-600' },
];

function ratingBadgeClass(avg) {
  if (avg > 0) return 'bg-primary text-on-primary';
  return 'bg-surface-container-high text-on-surface-variant';
}

export default function UserDashboard() {
  const { search: debouncedSearch } = useOutletContext();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listStores({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sortBy,
        order: sortOrder,
      });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const totalStores = data?.total ?? 0;
  const avgRating = data?.items?.length
    ? (data.items.reduce((sum, s) => sum + (s.averageRating || 0), 0) / data.items.length).toFixed(1)
    : '—';

  if (loading) return <Loading label="Loading stores…" />;
  if (error) return <ErrorBox message={error} />;

  if (!data || data.items.length === 0) {
    return (
      <div className="py-8 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">storefront</span>
        <h3 className="font-headline-md text-headline-md text-on-surface">
          {debouncedSearch ? 'No stores match your search' : 'No stores registered yet'}
        </h3>
        {debouncedSearch && (
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Try a different name or address.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-space-sm">
            Discover &amp; rate stores
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Search stores by name or address and share your rating.
          </p>
        </div>
        <div className="flex gap-space-sm">
          <button
            className="h-9 px-space-md rounded-lg border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-space-xs"
            aria-label="Filter"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          <button
            className="h-9 px-space-md rounded-lg border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-space-xs"
            onClick={handleSort}
            aria-label="Sort"
          >
            <span className="material-symbols-outlined text-[18px]">sort</span>
            Sort
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="w-full rounded-xl mb-space-xl border border-outline-variant overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-primary-container to-primary p-space-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-lg">
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-[32px] text-on-primary">storefront</span>
              <div>
                <div className="font-display-lg text-display-lg text-on-primary leading-none">{totalStores}</div>
                <div className="font-label-md text-label-md text-on-primary/80">Total Stores</div>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-[32px] text-on-primary">star</span>
              <div>
                <div className="font-display-lg text-display-lg text-on-primary leading-none">{avgRating}</div>
                <div className="font-label-md text-label-md text-on-primary/80">Average Rating</div>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-[32px] text-on-primary">rate_review</span>
              <div>
                <div className="font-display-lg text-display-lg text-on-primary leading-none">{data.total}</div>
                <div className="font-label-md text-label-md text-on-primary/80">Total Ratings</div>
              </div>
            </div>
          </div>
          <div className="mt-space-md pt-space-md border-t border-white/20">
            <p className="font-body-md text-body-md text-on-primary/90">
              Browse stores, read reviews, and share your own ratings to help others discover the best places.
            </p>
          </div>
        </div>
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        {data.items.map((store, idx) => {
          const color = STORE_COLORS[idx % STORE_COLORS.length];
          const avg = Number(store.averageRating || 0);
          return (
            <article
              key={store.id}
              className="bg-surface rounded-xl border border-outline-variant p-space-lg flex flex-col hover:border-primary hover:shadow-md transition-all duration-200 group"
            >
              {/* Card header: icon + rating badge */}
              <div className="flex justify-between items-start mb-space-md">
                <div className={`w-12 h-12 rounded-lg ${color.bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-[24px] ${color.icon}`}>storefront</span>
                </div>
                <div className={`px-2 py-1 rounded-full flex items-center gap-1 font-label-md text-label-md ${ratingBadgeClass(avg)}`}>
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {avg > 0 ? `${avg.toFixed(1)} / 5` : 'No ratings'}
                </div>
              </div>

              {/* Store name + address */}
              <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs group-hover:text-primary transition-colors">
                {store.name}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant flex items-start gap-1 mb-space-lg">
                <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">location_on</span>
                <span className="line-clamp-2">{store.address || 'No address provided'}</span>
              </p>

              {/* Card footer: your rating + action */}
              <div className="mt-auto pt-space-md border-t border-outline-variant flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-caption text-caption text-on-surface-variant">Your Rating</span>
                  <StarRating value={0} readOnly sizeClass="stars-sm" />
                </div>
                <button
                  type="button"
                  className="h-[36px] px-space-md shrink-0 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
                  onClick={() => alert('Submit rating for: ' + store.name)}
                >
                  Submit Rating
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {data.items.length > 0 && (
        <div className="mt-space-lg border border-outline-variant rounded-xl bg-surface overflow-hidden">
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={PAGE_SIZE}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}