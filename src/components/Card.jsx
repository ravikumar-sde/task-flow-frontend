import { Calendar, Tag, Users, Clock } from 'lucide-react';

const Card = ({ card, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Normal': return '#61bd4f'
      case 'Bug': return '#f2d600'
      case 'Feature': return '#ff9f1a'
      case 'High': return '#eb5a46'
      case 'Medium': return '#c377e0'
      case 'Low': return '#0079bf'
      default: return '#b3bac5';
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30cfd0', '#a8edea', '#fed6e3'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getCreatorName = () => {
    if (card.createdBy?.name) return card.createdBy.name;
    if (card.createdBy?.email) return card.createdBy.email.split('@')[0];
    return 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const creatorName = getCreatorName();

  return (
    <div className="card-item" onClick={onClick}>
      {/* Priority Label */}
      {card.labels && card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map(label => (
            <span
              key={label}
              className="card-priority-label"
              style={{ backgroundColor: getPriorityColor(label) }}
            >
            </span>
          ))}
        </div>
      )}

      {/* Card Title */}
      <h4 className="card-title">{card.title}</h4>

      {/* Card Badges */}
      <div className="card-badges">
        {card.dueDate && (
          <span className="card-badge">
            <Calendar size={12} />
            {new Date(card.dueDate).toLocaleDateString()}
          </span>
        )}
        {card.description && (
          <span className="card-badge">
            <Tag size={12} />
          </span>
        )}
        {card.assignedTo && card.assignedTo.length > 0 && (
          <span className="card-badge">
            <Users size={12} />
            {card.assignedTo.length}
          </span>
        )}
      </div>

      {/* Card Footer - Created By & Created At */}
      {(card.createdBy || card.createdAt) && (
        <div className="card-footer">
          {card.createdBy && (
            <div className="card-creator">
              <div
                className="creator-avatar"
                style={{ background: getAvatarColor(creatorName) }}
                title={card.createdBy.name || card.createdBy.email || 'Unknown'}
              >
                {creatorName.charAt(0).toUpperCase()}
              </div>
              <span className="creator-name" title={card.createdBy.name || card.createdBy.email || 'Unknown'}>
                {creatorName}
              </span>
            </div>
          )}
          {card.createdAt && (
            <div className="card-created-time" title={new Date(card.createdAt).toLocaleString()}>
              <Clock size={11} />
              <span>{formatDate(card.createdAt)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;

