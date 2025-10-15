import { useState } from 'react'
import './SearchBar.css'

const SearchBar = ({ onSearch, placeholder = 'Search medical records...' }) => {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsSearching(true)
    await onSearch(query)
    setIsSearching(false)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-bar__form">
        <div className="search-bar__input-wrapper">
          <span className="search-bar__icon">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="search-bar__input"
            aria-label="Search medical records"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="search-bar__clear"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="search-bar__button"
          disabled={isSearching}
          aria-label="Search"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  )
}

export default SearchBar

