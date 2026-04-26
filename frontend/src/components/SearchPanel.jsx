import React, { useState, useEffect } from 'react';
import { executeSmartSearch } from '../utils/searchLogic';
import DataTable from './DataTable';

const SearchPanel = ({ masterData, stagedDataCount, onProcessResults, onDone }) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingResults, setPendingResults] = useState(null);

  const columns = masterData && masterData.length > 0 ? Object.keys(masterData[0]) : [];

  if (columns.length > 0 && !selectedColumn) {
    setSelectedColumn(columns[0]);
  }

  // Real-Time Search Trigger: Runs immediately when query or column changes
  useEffect(() => {
    if (searchQuery.trim().length > 0 && selectedColumn) {
      const results = executeSmartSearch(masterData, selectedColumn, searchQuery);
      setPendingResults(results);
    } else {
      setPendingResults(null);
    }
  }, [searchQuery, selectedColumn, masterData]);

  const handleReset = () => {
    setSearchQuery('');
    setPendingResults(null);
  };

  const handleDecision = (decision) => {
    if (decision === 'YES') {
      onProcessResults(pendingResults);
    }
    setPendingResults(null);
    setSearchQuery(''); // Clears the input so user can search again immediately
  };

  const renderPrompt = () => {
    if (!pendingResults) return null;

    let promptMessage = "";
    let alertClass = "alert-info"; 

    if (stagedDataCount === 0) {
      promptMessage = `${pendingResults.length} matching records found. Do you want to add these records to a new Excel file?`;
      alertClass = "alert-info";
    } else if (pendingResults.length > stagedDataCount) {
      promptMessage = `Previous search had ${stagedDataCount} records. New search has more records (${pendingResults.length}). Do you want to add these to a new file?`;
      alertClass = "alert-warning";
    } else {
      promptMessage = `Previous search had ${stagedDataCount} records. New search has fewer records (${pendingResults.length}). Do you want to replace previous records and update the new file?`;
      alertClass = "alert-success";
    }

    return (
      <div className={`prompt-box ${alertClass}`}>
        <div style={{ flex: 1 }}>
          <strong>{promptMessage}</strong>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => handleDecision('YES')}>YES</button>
          <button className="btn btn-outline" onClick={() => handleDecision('NO')}>NO</button>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <h2 className="card-title">🔍 DYNAMIC LIVE SEARCH</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Select a column and start typing. Results will appear instantly using phonetic fuzzy matching.
      </p>
      
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="input-group">
          <label className="input-label">Select Target Column</label>
          <select 
            className="form-control"
            value={selectedColumn} 
            onChange={(e) => setSelectedColumn(e.target.value)}
          >
            {columns.map((col, idx) => (
              <option key={idx} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Live Search Value</label>
          <input 
            type="text" 
            className="form-control"
            placeholder="Type 'tablipatra' to find 'तबदीलपत्र'..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="action-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-outline" onClick={handleReset}>🔄 CLEAR</button>
        <button className="btn" style={{backgroundColor: '#1e3a8a', color: 'white'}} onClick={onDone}>🏁 FINISH WORKFLOW</button>
      </div>

      {renderPrompt()}

      {/* Real-Time Scrollable Preview Box */}
      {pendingResults && pendingResults.length > 0 && (
        <div style={{ marginTop: '2rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-main)' }}>
            Live Preview: {pendingResults.length} Matches Found
          </h3>
          <DataTable data={pendingResults} />
        </div>
      )}
    </div>
  );
};

export default SearchPanel;