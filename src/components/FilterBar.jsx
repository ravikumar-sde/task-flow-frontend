import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Tag, Users, Calendar } from 'lucide-react';
import '../styles/FilterBar.css';

const FilterBar = ({ 
  onFilterChange, 
  availableLabels = [], 
  availableMembers = [],
  activeFilters = { labels: [], members: [], dueDate: null, search: '' }
}) => {
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState(activeFilters.search || '');

  const labelDropdownRef = useRef(null);
  const memberDropdownRef = useRef(null);
  const dueDateDropdownRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(event.target)) {
        setShowLabelDropdown(false);
      }
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        setShowMemberDropdown(false);
      }
      if (dueDateDropdownRef.current && !dueDateDropdownRef.current.contains(event.target)) {
        setShowDueDateDropdown(false);
      }
    };

    if (showLabelDropdown || showMemberDropdown || showDueDateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLabelDropdown, showMemberDropdown, showDueDateDropdown]);

  const handleLabelToggle = (label) => {
    const newLabels = activeFilters.labels.includes(label)
      ? activeFilters.labels.filter(l => l !== label)
      : [...activeFilters.labels, label];
    onFilterChange({ ...activeFilters, labels: newLabels });
  };

  const handleMemberToggle = (memberId) => {
    const newMembers = activeFilters.members.includes(memberId)
      ? activeFilters.members.filter(m => m !== memberId)
      : [...activeFilters.members, memberId];
    onFilterChange({ ...activeFilters, members: newMembers });
  };

  const handleDueDateSelect = (dueDateFilter) => {
    const newDueDate = activeFilters.dueDate === dueDateFilter ? null : dueDateFilter;
    onFilterChange({ ...activeFilters, dueDate: newDueDate });
    setShowDueDateDropdown(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFilterChange({ ...activeFilters, search: value });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    onFilterChange({ labels: [], members: [], dueDate: null, search: '' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Normal': return '#61bd4f';
      case 'Bug': return '#f2d600';
      case 'Feature': return '#ff9f1a';
      case 'High': return '#eb5a46';
      case 'Medium': return '#c377e0';
      case 'Low': return '#0079bf';
      default: return '#b3bac5';
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30cfd0', '#a8edea', '#fed6e3'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getMemberName = (member) => {
    return member.user.name || member.user.email?.split('@')[0] || 'Unknown';
  };

  const hasActiveFilters = activeFilters.labels.length > 0 || 
                          activeFilters.members.length > 0 || 
                          activeFilters.dueDate || 
                          activeFilters.search;

  return (
    <div className="filter-bar">
      <div className="filter-bar-left">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search cards by name or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => handleSearchChange({ target: { value: '' } })}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar-right">
        <div className="filter-icon-wrapper">
          <Filter size={16} />
          <span>Filters</span>
        </div>

        {/* Label Filter */}
        <div className="filter-dropdown-wrapper" ref={labelDropdownRef}>
          <button
            className={`filter-btn ${activeFilters.labels.length > 0 ? 'active' : ''}`}
            onClick={() => setShowLabelDropdown(!showLabelDropdown)}
          >
            <Tag size={14} />
            <span>Labels</span>
            {activeFilters.labels.length > 0 && (
              <span className="filter-count">{activeFilters.labels.length}</span>
            )}
            <ChevronDown size={14} />
          </button>

          {showLabelDropdown && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-header">
                <span>Filter by Label</span>
              </div>
              <div className="filter-dropdown-content">
                {availableLabels.length === 0 ? (
                  <div className="filter-empty">No labels available</div>
                ) : (
                  availableLabels.map(label => (
                    <label key={label} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={activeFilters.labels.includes(label)}
                        onChange={() => handleLabelToggle(label)}
                      />
                      <span
                        className="label-color-indicator"
                        style={{ backgroundColor: getPriorityColor(label) }}
                      ></span>
                      <span>{label}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Member Filter */}
        <div className="filter-dropdown-wrapper" ref={memberDropdownRef}>
          <button
            className={`filter-btn ${activeFilters.members.length > 0 ? 'active' : ''}`}
            onClick={() => setShowMemberDropdown(!showMemberDropdown)}
          >
            <Users size={14} />
            <span>Members</span>
            {activeFilters.members.length > 0 && (
              <span className="filter-count">{activeFilters.members.length}</span>
            )}
            <ChevronDown size={14} />
          </button>

          {showMemberDropdown && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-header">
                <span>Filter by Member</span>
              </div>
              <div className="filter-dropdown-content">
                {availableMembers.length === 0 ? (
                  <div className="filter-empty">No members available</div>
                ) : (
                  availableMembers.map(member => {
                    const memberId = member.user._id || member.user.id;
                    const memberName = getMemberName(member);
                    return (
                      <label key={memberId} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={activeFilters.members.includes(memberId)}
                          onChange={() => handleMemberToggle(memberId)}
                        />
                        <div
                          className="member-avatar-small"
                          style={{ background: getAvatarColor(memberName) }}
                        >
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                        <span>{memberName}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Due Date Filter */}
        <div className="filter-dropdown-wrapper" ref={dueDateDropdownRef}>
          <button
            className={`filter-btn ${activeFilters.dueDate ? 'active' : ''}`}
            onClick={() => setShowDueDateDropdown(!showDueDateDropdown)}
          >
            <Calendar size={14} />
            <span>Due Date</span>
            {activeFilters.dueDate && <span className="filter-count">1</span>}
            <ChevronDown size={14} />
          </button>

          {showDueDateDropdown && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-header">
                <span>Filter by Due Date</span>
              </div>
              <div className="filter-dropdown-content">
                <button
                  className={`filter-option-btn ${activeFilters.dueDate === 'overdue' ? 'selected' : ''}`}
                  onClick={() => handleDueDateSelect('overdue')}
                >
                  Overdue
                </button>
                <button
                  className={`filter-option-btn ${activeFilters.dueDate === 'today' ? 'selected' : ''}`}
                  onClick={() => handleDueDateSelect('today')}
                >
                  Due Today
                </button>
                <button
                  className={`filter-option-btn ${activeFilters.dueDate === 'tomorrow' ? 'selected' : ''}`}
                  onClick={() => handleDueDateSelect('tomorrow')}
                >
                  Due Tomorrow
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            <X size={14} />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;

