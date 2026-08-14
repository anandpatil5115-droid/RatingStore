import { useState, useEffect } from 'react';
import { SearchIcon, CloseIcon } from './Icons';
import useDebounce from '../hooks/useDebounce';

export default function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  const [text, setText] = useState(value || '');
  const debounced = useDebounce(text, 350);

  useEffect(() => {
    onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    if (value !== debounced) setText(value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={`search ${className}`}>
      <SearchIcon />
      <input
        type="text"
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {text && (
        <button
          type="button"
          className="modal-close"
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
          onClick={() => setText('')}
          aria-label="Clear search"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}