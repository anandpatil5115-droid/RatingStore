import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listStores } from '../../services/storeApi';
import { submitRating, updateRating } from '../../services/ratingApi';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/StarRating';
import RatingModal from '../../components/RatingModal';
import Pagination from '../../components/Pagination';
import { initials } from '../../utils/format';

const PAGE_SIZE = 9;

const STORE_GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
  'from-fuchsia-500 to-fuchsia-600',
  'from-lime-500 to-lime-600',
];

const STORE_ICONS = ['storefront', 'shop', 'local_mall', 'business', 'domain', 'apartment', 'home_repair_service', 'build'];

function ratingBadgeClass(avg) {
  if (avg > 0) return 'bg-primary text-on-primary';
  return 'bg-surface-container-high text-on-surface-variant';
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'averageRating', label: 'Rating' },
  { value: 'createdAt', label: 'Newest' },
];

const FILTER_OPTIONS = [
  { value: '', label: 'All Stores' },
  { value: 'rated', label: 'Stores I Rated' },
  { value: 'unrated', label: "Stores I Haven't Rated" },
  { value: 'highlyRated', label: 'Highly Rated (4+)' },
];

function SkeletonCard() {
  return (
    <article className="skeleton-card rounded-xl border border-outline-variant p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="skeleton-shimmer w-12 h-12 rounded-lg" />
        <div className="skeleton-shimmer w-20 h-6 rounded-full" />
      </div>
      <div className="skeleton-shimmer w-3/4 h-5 rounded mb-2" />
      <div className="skeleton-shimmer w-full h-4 rounded mb-1" />
      <div className="skeleton-shimmer w-2/3 h-4 rounded mb-6" />
      <div className="mt-auto pt-4 border-t border-outline-variant flex items-center justify-between">
        <div className="skeleton-shimmer w-24 h-4 rounded" />
        <div className="skeleton-shimmer w-28 h-9 rounded-lg" />
      </div>
    </article>
  );
}

function StatsBanner({ totalStores, avgRating, totalRatings }) {
  return (
    <div className="w-full rounded-xl mb-6 border border-outline-variant overflow-hidden">
      <div className="bg-gradient-to-r from-primary via-primary-container to-primary p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[32px] text-on-primary">storefront</span>
            <div>
              <div className="font-display-lg text-display-lg text-on-primary leading-none">{totalStores}</div>
              <div className="font-label-md text-label-md text-on-primary/80">Total Stores</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[32px] text-on-primary">star</span>
            <div>
              <div className="font-display-lg text-display-lg text-on-primary leading-none">{avgRating}</div>
              <div className="font-label-md text-label-md text-on-primary/80">Average Rating</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[32px] text-on-primary">rate_review</span>
            <div>
              <div className="font-display-lg text-display-lg text-on-primary leading-none">{totalRatings}</div>
              <div className="font-label-md text-label-md text-on-primary/80">Total Ratings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ isSearch }) {
  return (
    <div className="empty-state">
      <div className="es-icon">
        <span className="material-symbols-outlined text-[28px]">storefront</span>
      </div>
      <h4>{isSearch ? 'No stores match your search' : 'No stores registered yet'}</h4>
      {isSearch && <p className="mt-1 text-sm">Try a different name or address.</p>}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-box flex-col items-center text-center">
      <span className="material-symbols-outlined text-[32px] mb-2">error</span>
      <p className="mb-3">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default function UserDashboard() {
  const { search: debouncedSearch } = useOutletContext();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingBusy, setRatingBusy] = useState(false);

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

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
    setSortDropdownOpen(false);
  };

  const handleFilter = (value) => {
    setFilterBy(value);
    setPage(1);
    setFilterDropdownOpen(false);
  };

  const handleClearSort = (e) => {
    e.stopPropagation();
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  const handleClearFilter = (e) => {
    e.stopPropagation();
    setFilterBy('');
    setPage(1);
  };

  const handleOpenRatingModal = (store) => {
    setSelectedStore(store);
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedStore(null);
  };

  const handleSubmitRating = async (rating) => {
    if (!selectedStore) return;
    setRatingBusy(true);
    try {
      if (selectedStore.userRating) {
        await updateRating(selectedStore.id, rating);
        toast.success('Rating updated!');
      } else {
        await submitRating(selectedStore.id, rating);
        toast.success('Rating submitted!');
      }
      handleCloseRatingModal();
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setRatingBusy(false);
    }
  };

  const handleStarClick = async (store, rating) => {
    setRatingBusy(true);
    try {
      if (store.userRating) {
        await updateRating(store.id, rating);
        toast.success('Rating updated!');
      } else {
        await submitRating(store.id, rating);
        toast.success('Rating submitted!');
      }
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setRatingBusy(false);
    }
  };

  const isSortActive = sortBy !== 'name' || sortOrder !== 'asc';
  const isFilterActive = filterBy !== '';
  const activeFilterLabel = FILTER_OPTIONS.find((o) => o.value === filterBy)?.label || '';

  const filteredItems = data?.items?.filter((store) => {
    if (!filterBy) return true;
    if (filterBy === 'rated') return store.userRating != null;
    if (filterBy === 'unrated') return store.userRating == null;
    if (filterBy === 'highlyRated') return (store.averageRating || 0) >= 4;
    return true;
  }) || [];

  const totalStores = data?.items?.length || 0;
  const avgRating = totalStores
    ? (data.items.reduce((sum, s) => sum + (s.averageRating || 0), 0) / totalStores).toFixed(1)
    : '—';
  const totalRatings = data?.total || 0;

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-1">Discover &amp; rate stores</h2>
          <p className="text-sm text-on-surface-variant">Search stores by name or address and share your rating.</p>
        </div>
        <div className="flex gap-2 relative">
          {/* Filter Button */}
          <div className="relative">
            <button
              type="button"
              className={`h-9 px-3 rounded-lg border font-label-md text-label-md transition-all duration-150 flex items-center gap-1.5 ${
                isFilterActive
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'border-outline text-on-surface hover:bg-surface-container-low'
              }`}
              onClick={() => { setFilterDropdownOpen(!filterDropdownOpen); setSortDropdownOpen(false); }}
              aria-label="Filter"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
              {isFilterActive && (
                <span className="ml-1 w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
              )}
            </button>
            {filterDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg z-50 min-w-[200px] py-1">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                      filterBy === opt.value ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'
                    }`}
                    onClick={() => handleFilter(opt.value)}
                  >
                    <span>{opt.label}</span>
                    {filterBy === opt.value && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                ))}
                {isFilterActive && (
                  <div className="border-t border-outline-variant mt-1 pt-1">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-[13px] text-danger hover:bg-danger-bg transition-colors flex items-center gap-2"
                      onClick={handleClearFilter}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Clear filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sort Button */}
          <div className="relative">
            <button
              type="button"
              className={`h-9 px-3 rounded-lg border font-label-md text-label-md transition-all duration-150 flex items-center gap-1.5 ${
                isSortActive
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'border-outline text-on-surface hover:bg-surface-container-low'
              }`}
              onClick={() => { setSortDropdownOpen(!sortDropdownOpen); setFilterDropdownOpen(false); }}
              aria-label="Sort"
            >
              <span className="material-symbols-outlined text-[18px]">sort</span>
              Sort
              {isSortActive && (
                <span className="material-symbols-outlined text-[14px]">
                  {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </span>
              )}
            </button>
            {sortDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg z-50 min-w-[160px] py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                      sortBy === opt.value ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'
                    }`}
                    onClick={() => handleSort(opt.value)}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && (
                      <span className="material-symbols-outlined text-[16px]">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </button>
                ))}
                {isSortActive && (
                  <div className="border-t border-outline-variant mt-1 pt-1">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-[13px] text-danger hover:bg-danger-bg transition-colors flex items-center gap-2"
                      onClick={handleClearSort}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Reset sort
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter/sort chips */}
      {(isFilterActive || isSortActive) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-on-surface-variant">Active:</span>
          {isFilterActive && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {activeFilterLabel}
              <button type="button" onClick={handleClearFilter} className="hover:text-primary/70">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}
          {isSortActive && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label} {sortOrder === 'asc' ? '↑' : '↓'}
              <button type="button" onClick={handleClearSort} className="hover:text-primary/70">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}
        </div>
      )}

      {/* Stats Banner */}
      <StatsBanner totalStores={totalStores} avgRating={avgRating} totalRatings={totalRatings} />

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!data || data.items.length === 0) && (
        <EmptyState isSearch={!!debouncedSearch} />
      )}

      {/* Store Cards Grid */}
      {!loading && data && data.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((store, idx) => {
            const gradient = STORE_GRADIENTS[idx % STORE_GRADIENTS.length];
            const icon = STORE_ICONS[idx % STORE_ICONS.length];
            const avg = Number(store.averageRating || 0);
            const userRating = store.userRating;
            return (
              <article
                key={store.id}
                className="store-card-hover bg-surface rounded-xl border border-outline-variant flex flex-col transition-all duration-150 ease-out hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 group"
              >
                {/* Card gradient header */}
                <div className={`relative bg-gradient-to-br ${gradient} px-5 py-5 flex items-center justify-between`}>
                  <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px] text-white">{icon}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="text-white font-bold text-sm">
                      {avg > 0 ? avg.toFixed(1) : '—'}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 flex flex-col flex-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors duration-150">
                    {store.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant flex items-start gap-1.5 mb-4">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">location_on</span>
                    <span className="line-clamp-2">{store.address || 'No address provided'}</span>
                  </p>

                  {/* Card footer */}
                  <div className="mt-auto pt-4 border-t border-outline-variant flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs text-on-surface-variant">Your Rating</span>
                      {userRating ? (
                        <StarRating
                          value={userRating}
                          readOnly
                          sizeClass="stars-sm"
                        />
                      ) : (
                        <StarRating
                          value={0}
                          onChange={(val) => handleStarClick(store, val)}
                          sizeClass="stars-sm"
                          disabled={ratingBusy}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      className="h-9 px-4 shrink-0 rounded-lg font-label-md text-label-md transition-all duration-150 active:scale-95 btn-rating"
                      onClick={() => handleOpenRatingModal(store)}
                      disabled={ratingBusy}
                    >
                      {userRating ? 'Modify' : 'Rate Now'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && data && filteredItems.length > 0 && (
        <div className="mt-6 border border-outline-variant rounded-xl bg-surface overflow-hidden">
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={PAGE_SIZE}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Rating Modal */}
      {selectedStore && (
        <RatingModal
          open={ratingModalOpen}
          onClose={handleCloseRatingModal}
          store={selectedStore}
          existing={selectedStore.userRating}
          busy={ratingBusy}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  );
}
