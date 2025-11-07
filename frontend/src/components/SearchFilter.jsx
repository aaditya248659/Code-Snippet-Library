import React, { useState } from 'react';

const SearchFilter = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('');

  const languages = [
    'cpp', 'python', 'javascript', 'java', 'c', 
    'go', 'rust', 'typescript', 'php', 'ruby'
  ];

  const popularTags = [
    'arrays', 'strings', 'algorithms', 'math', 'recursion',
    'sorting', 'searching', 'dynamic-programming', 'graphs',
    'trees', 'beginner', 'intermediate', 'advanced'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLang(lang);
    onFilter({ lang, tag: selectedTag, sort: sortBy });
  };

  const handleTagChange = (e) => {
    const tag = e.target.value;
    setSelectedTag(tag);
    onFilter({ lang: selectedLang, tag, sort: sortBy });
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
    onFilter({ lang: selectedLang, tag: selectedTag, sort });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLang('');
    setSelectedTag('');
    setSortBy('');
    onFilter({ lang: '', tag: '', sort: '' });
    onSearch('');
  };

  return (
    <div className="search-filter">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search snippets by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn btn-primary">
          🔍 Search
        </button>
      </form>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={selectedLang}
            onChange={handleLanguageChange}
            className="filter-select"
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="tag">Tag:</label>
          <select
            id="tag"
            value={selectedTag}
            onChange={handleTagChange}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {popularTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort">Sort By:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="filter-select"
          >
            <option value="">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="views">Most Viewed</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {(selectedLang || selectedTag || searchTerm || sortBy) && (
          <button onClick={clearFilters} className="btn btn-outline clear-btn">
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;