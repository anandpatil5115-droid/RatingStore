import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { listStores } from "../../services/storeApi";
import { submitRating, updateRating } from "../../services/ratingApi";
import { useToast } from "../../context/ToastContext";
import StarRating from "../../components/StarRating";
import RatingModal from "../../components/RatingModal";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "rating", label: "Average Rating" },
  { value: "newest", label: "Newest First" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Stores" },
  { value: "rated", label: "Rated by You" },
  { value: "unrated", label: "Not Yet Rated" },
  { value: "highlyRated", label: "Highly Rated" },
];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-shimmer" style={{ height: 48, width: 48, borderRadius: 12, marginBottom: 12 }} />
      <div className="skeleton-shimmer" style={{ height: 20, width: "70%", marginBottom: 8 }} />
      <div className="skeleton-shimmer" style={{ height: 14, width: "50%", marginBottom: 16 }} />
      <div className="skeleton-shimmer" style={{ height: 16, width: "40%", marginBottom: 12 }} />
      <div className="skeleton-shimmer" style={{ height: 32, width: "100%", borderRadius: 8 }} />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <span className="es-icon material-symbols-outlined">storefront</span>
      <p>{message}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-box">
      <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 8 }}>error</span>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry} style={{ marginTop: 8 }}>
          Retry
        </button>
      )}
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useOutletContext();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterBy, setFilterBy] = useState("all");
  const [data, setData] = useState({ stores: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ratingModal, setRatingModal] = useState({ open: false, store: null, currentRating: 0 });
  const [sortDropdown, setSortDropdown] = useState(false);
  const [filterDropdown, setFilterDropdown] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listStores({
        page,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
        filterBy,
        userId: user?.id,
      });
      setData({ stores: res.stores || [], total: res.total || 0 });
    } catch (err) {
      setError(err.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, filterBy, user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const close = () => {
      setSortDropdown(false);
      setFilterDropdown(false);
    };
    if (sortDropdown || filterDropdown) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [sortDropdown, filterDropdown]);

  const handleSort = (value) => {
    if (value === sortBy) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(value);
      setSortOrder("asc");
    }
    setPage(1);
    setSortDropdown(false);
  };

  const handleFilter = (value) => {
    setFilterBy(value);
    setPage(1);
    setFilterDropdown(false);
  };

  const handleClearSort = (e) => {
    e.stopPropagation();
    setSortBy("name");
    setSortOrder("asc");
    setPage(1);
  };

  const handleClearFilter = (e) => {
    e.stopPropagation();
    setFilterBy("all");
    setPage(1);
  };

  const handleOpenRatingModal = (store) => {
    setRatingModal({
      open: true,
      store,
      currentRating: store.userRating || 0,
    });
  };

  const handleCloseRatingModal = () => {
    setRatingModal({ open: false, store: null, currentRating: 0 });
  };

  const handleSubmitRating = async (rating) => {
    if (!ratingModal.store) return;
    try {
      if (ratingModal.currentRating) {
        await updateRating(ratingModal.store.id, rating);
        toast.success("Rating updated!");
      } else {
        await submitRating(ratingModal.store.id, rating);
        toast.success("Rating submitted!");
      }
      handleCloseRatingModal();
      load();
    } catch (err) {
      toast.error(err.message || "Failed to submit rating");
    }
  };

  const handleStarClick = (store, starValue) => {
    setRatingModal({
      open: true,
      store,
      currentRating: store.userRating || 0,
    });
  };

  const filteredItems = data.stores.filter((store) => {
    if (filterBy === "rated") return !!store.userRating;
    if (filterBy === "unrated") return !store.userRating;
    if (filterBy === "highlyRated") return store.averageRating >= 4;
    return true;
  });

  const totalStores = data.total;
  const avgRating = data.stores.length
    ? (data.stores.reduce((s, st) => s + (st.averageRating || 0), 0) / data.stores.length).toFixed(1)
    : "0.0";
  const totalRatings = data.stores.reduce((s, st) => s + (st.totalRatings || 0), 0);

  const totalPages = Math.ceil(data.total / PAGE_SIZE);

  const getSortLabel = () => {
    const opt = SORT_OPTIONS.find((o) => o.value === sortBy);
    return opt ? opt.label : "Sort";
  };

  const getFilterLabel = () => {
    const opt = FILTER_OPTIONS.find((o) => o.value === filterBy);
    return opt ? opt.label : "Filter";
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Browse Stores</h1>
        <p className="page-sub">Discover and rate your favorite stores</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon material-symbols-outlined">storefront</span>
          <div className="stat-value">{totalStores}</div>
          <div className="stat-label">Total Stores</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon material-symbols-outlined">star</span>
          <div className="stat-value">{avgRating}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon material-symbols-outlined">rate_review</span>
          <div className="stat-value">{totalRatings}</div>
          <div className="stat-label">Total Ratings</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-actions">
          <div className="dropdown-wrapper">
            <button
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setFilterDropdown(!filterDropdown);
                setSortDropdown(false);
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>
              {getFilterLabel()}
              {filterBy !== "all" && (
                <span className="clear-icon material-symbols-outlined" onClick={handleClearFilter}>close</span>
              )}
            </button>
            {filterDropdown && (
              <div className="dropdown-menu">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`dropdown-item ${filterBy === opt.value ? "active" : ""}`}
                    onClick={() => handleFilter(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="dropdown-wrapper">
            <button
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setSortDropdown(!sortDropdown);
                setFilterDropdown(false);
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sort</span>
              {getSortLabel()}
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
              </span>
              {sortBy !== "name" && (
                <span className="clear-icon material-symbols-outlined" onClick={handleClearSort}>close</span>
              )}
            </button>
            {sortDropdown && (
              <div className="dropdown-menu">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`dropdown-item ${sortBy === opt.value ? "active" : ""}`}
                    onClick={() => handleSort(opt.value)}
                  >
                    {opt.label}
                    {sortBy === opt.value && (
                      <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 4 }}>
                        {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState message="No stores found matching your criteria." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((store) => (
            <div key={store.id} className="store-card store-card-hover">
              <div className="store-card-header">
                <span className="material-symbols-outlined store-icon">storefront</span>
                <div>
                  <h3 className="store-name">{store.name}</h3>
                  <p className="store-address">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                    {store.address}
                  </p>
                </div>
              </div>

              <div className="store-card-rating">
                <span className="store-rating-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span>
                  {store.averageRating ? store.averageRating.toFixed(1) : "N/A"}
                </span>
                <span className="store-rating-count">
                  {store.totalRatings || 0} rating{(store.totalRatings || 0) !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="store-card-user">
                <span className="your-rating-label">Your Rating</span>
                {store.userRating ? (
                  <div className="your-rating-display">
                    <div className="stars stars-sm">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`star ${s <= store.userRating ? "filled" : ""}`}>★</span>
                      ))}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleOpenRatingModal(store)}
                      style={{ marginLeft: 4 }}
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <div className="your-rating-empty">
                    <div className="stars stars-sm">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className="star"
                          onClick={() => handleStarClick(store, s)}
                          style={{ cursor: "pointer" }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <button
                      className="btn btn-rating btn-sm"
                      onClick={() => handleOpenRatingModal(store)}
                    >
                      Rate Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {ratingModal.open && (
        <RatingModal
          store={ratingModal.store}
          currentRating={ratingModal.currentRating}
          onSubmit={handleSubmitRating}
          onClose={handleCloseRatingModal}
        />
      )}
    </div>
  );
}
