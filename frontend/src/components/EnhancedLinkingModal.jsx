// Enhanced Linking Modal Component
export function EnhancedLinkingModal({ selectedUser, users, onClose, onLink }) {
  const [linkType, setLinkType] = useState("admin");
  const [selectedLinkUser, setSelectedLinkUser] = useState(null);
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedBulkUsers, setSelectedBulkUsers] = useState([]);

  const handleBulkToggle = (userId) => {
    setSelectedBulkUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkLink = async () => {
    if (selectedBulkUsers.length === 0) return;
    
    for (const userId of selectedBulkUsers) {
      await onLink({
        learnerId: userId,
        linkType,
        linkedUserId: selectedLinkUser.id
      });
    }
    
    setSelectedBulkUsers([]);
    setBulkMode(false);
  };

  const getAvailableUsers = () => {
    return users.filter(u => {
      if (linkType === "admin") return u.role === "ADMIN" && u.id !== selectedUser.id;
      return u.role === "GUARDIAN" && u.id !== selectedUser.id;
    });
  };

  return (
    <div className="enhanced-link-modal">
      <div className="modal-header">
        <h2>Link User Relationships</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="modal-tabs">
        <button
          className={`tab ${!bulkMode ? 'active' : ''}`}
          onClick={() => setBulkMode(false)}
        >
          Single Link
        </button>
        <button
          className={`tab ${bulkMode ? 'active' : ''}`}
          onClick={() => setBulkMode(true)}
        >
          Bulk Link
        </button>
        <button
          className="tab"
          onClick={() => setShowHierarchy(!showHierarchy)}
        >
          View Hierarchy
        </button>
      </div>

      {showHierarchy ? (
        <div className="hierarchy-view">
          <h3>Relationship Hierarchy</h3>
          <div className="hierarchy-tree">
            <div className="hierarchy-node admin-node">
              <span className="node-label">Admin</span>
              <span className="node-name">{selectedUser.assignedAdmin?.fullName || "Not Assigned"}</span>
            </div>
            <div className="hierarchy-connector">↓</div>
            <div className="hierarchy-node learner-node">
              <span className="node-label">Learner</span>
              <span className="node-name">{selectedUser.fullName}</span>
            </div>
            <div className="hierarchy-connector">↓</div>
            <div className="hierarchy-node guardian-node">
              <span className="node-label">Guardian</span>
              <span className="node-name">{selectedUser.guardian?.fullName || "Not Assigned"}</span>
            </div>
          </div>
        </div>
      ) : bulkMode ? (
        <div className="bulk-link-section">
          <div className="link-type-selector">
            <label>Link Type:</label>
            <select value={linkType} onChange={e => setLinkType(e.target.value)}>
              <option value="admin">Assign Admin</option>
              <option value="guardian">Assign Guardian</option>
            </select>
          </div>

          <div className="user-selector">
            <label>Select {linkType === 'admin' ? 'Admin' : 'Guardian'}:</label>
            <select onChange={e => setSelectedLinkUser(users.find(u => u.id === parseInt(e.target.value)))}>
              <option value="">Choose a user...</option>
              {getAvailableUsers().map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="bulk-users-list">
            <label>Select Learners to Link:</label>
            <div className="users-grid">
              {users.filter(u => u.role === "STUDENT").map(u => (
                <div key={u.id} className="user-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedBulkUsers.includes(u.id)}
                    onChange={() => handleBulkToggle(u.id)}
                  />
                  <span>{u.fullName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="btn-link"
              onClick={handleBulkLink}
              disabled={!selectedLinkUser || selectedBulkUsers.length === 0}
            >
              Link {selectedBulkUsers.length} Users
            </button>
          </div>
        </div>
      ) : (
        <div className="single-link-section">
          <div className="link-type-selector">
            <label>Link Type:</label>
            <select value={linkType} onChange={e => setLinkType(e.target.value)}>
              <option value="admin">Assign Admin to Learner</option>
              <option value="guardian">Assign Guardian to Learner</option>
            </select>
          </div>

          <div className="user-selector">
            <label>Select {linkType === 'admin' ? 'Admin' : 'Guardian'}:</label>
            <select onChange={e => setSelectedLinkUser(users.find(u => u.id === parseInt(e.target.value)))}>
              <option value="">Choose a user...</option>
              {getAvailableUsers().map(u => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>

          {selectedLinkUser && (
            <div className="link-preview">
              <h4>Preview:</h4>
              <div className="preview-content">
                <div className="preview-item">
                  <span className="label">Learner:</span>
                  <span className="value">{selectedUser.fullName}</span>
                </div>
                <div className="preview-item">
                  <span className="label">{linkType === 'admin' ? 'Admin' : 'Guardian'}:</span>
                  <span className="value">{selectedLinkUser.fullName}</span>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="btn-link"
              onClick={() => onLink({ learnerId: selectedUser.id, linkType, linkedUserId: selectedLinkUser.id })}
              disabled={!selectedLinkUser}
            >
              Create Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// CSS for Enhanced Linking Modal
const enhancedLinkingStyles = `
.enhanced-link-modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 600px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.tab {
  padding: 10px 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-weight: 600;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.tab.active {
  color: #2196f3;
  border-bottom-color: #2196f3;
}

.tab:hover {
  color: #333;
}

.hierarchy-view {
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.hierarchy-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hierarchy-node {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  text-align: center;
  min-width: 200px;
  border: 2px solid #ddd;
}

.admin-node {
  background: #fce4ec;
  border-color: #c2185b;
}

.learner-node {
  background: #e3f2fd;
  border-color: #1976d2;
}

.guardian-node {
  background: #e8f5e9;
  border-color: #388e3c;
}

.node-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.node-name {
  display: block;
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.hierarchy-connector {
  font-size: 1.5rem;
  color: #999;
}

.single-link-section,
.bulk-link-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.link-type-selector,
.user-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-type-selector label,
.user-selector label {
  font-weight: 600;
  color: #333;
}

.link-type-selector select,
.user-selector select {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.link-type-selector select:focus,
.user-selector select:focus {
  outline: none;
  border-color: #2196f3;
}

.bulk-users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bulk-users-list label {
  font-weight: 600;
  color: #333;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
}

.user-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-checkbox:hover {
  background: #f0f0f0;
}

.user-checkbox input {
  cursor: pointer;
}

.user-checkbox span {
  font-size: 0.9rem;
  color: #333;
}

.link-preview {
  padding: 1rem;
  background: #f0f7ff;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
}

.link-preview h4 {
  margin: 0 0 0.75rem 0;
  color: #333;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-item .label {
  font-weight: 600;
  color: #666;
}

.preview-item .value {
  color: #333;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 1rem;
  border-top: 2px solid #f0f0f0;
}

.btn-cancel,
.btn-link {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-link {
  background: #2196f3;
  color: white;
}

.btn-link:hover:not(:disabled) {
  background: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-link:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
`;
