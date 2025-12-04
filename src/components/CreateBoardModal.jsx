import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import '../styles/Modal.css';

const BACKGROUND_COLORS = [
  '#0079BF', // Blue
  '#D29034', // Orange
  '#519839', // Green
  '#B04632', // Red
  '#89609E', // Purple
  '#CD5A91', // Pink
  '#4BBF6B', // Light Green
  '#00AECC', // Cyan
];

const CreateBoardModal = ({ isOpen, onClose, onCreateBoard, workspaceId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    backgroundColor: BACKGROUND_COLORS[0],
    workspaceId: workspaceId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update workspaceId when prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, workspaceId: workspaceId }));
  }, [workspaceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Board name is required');
      return;
    }

    if (!formData.workspaceId) {
      setError('Workspace ID is missing');
      console.error('Workspace ID is undefined in form data:', formData);
      return;
    }

    console.log('Creating board with data:', formData);
    setLoading(true);
    try {
      await onCreateBoard(formData);
      setFormData({
        name: '',
        description: '',
        backgroundColor: BACKGROUND_COLORS[0],
        workspaceId: workspaceId
      });
      onClose();
    } catch (err) {
      console.error('Board creation error:', err);
      setError(err.response?.data?.message || 'Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Board</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Board Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Project Planning"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this board about?"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Background Color</label>
              <div className="color-picker">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.backgroundColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, backgroundColor: color })}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    Creating...
                  </>
                ) : (
                  'Create Board'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;

