import React, { useState, useEffect } from 'react';
import { executeSmartSearch } from '../utils/searchLogic';
import DataTable from './DataTable';

const SearchPanel = ({ masterData, onProcessResults, onDone }) => {
  const columns = masterData && masterData.length > 0 ? Object.keys(masterData[0]) : [];
  const defaultCol = columns.length > 0 ? columns[0] : '';

  // State to hold 4 distinct search conditions
  const [conditions, setConditions] = useState([
    { column: defaultCol, query: '' },
    { column: defaultCol, query: '' },
    { column: defaultCol, query: '' },
    { column: defaultCol, query: '' }
  ]);
  
  const [pendingResults, setPendingResults] = useState(null);

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  useEffect(() => {
    const hasActiveSearch = conditions.some(c => c.column && c.query.trim() !== '');
    if (hasActiveSearch) {
      const results = executeSmartSearch(masterData, conditions);
      setPendingResults(results);
    } else {
      setPendingResults(null);
    }
  }, [conditions, masterData]);

  const handleReset = () => {
    setConditions([
      { column: defaultCol, query: '' },
      { column: defaultCol, query: '' },
      { column: defaultCol, query: '' },
      { column: defaultCol, query: '' }
    ]);
    setPendingResults(null);
  };

  const handleDecision = (decision) => {
    if (decision === 'YES') {
      onProcessResults(pendingResults);
    }
    handleReset(); // Clear inputs after adding to workspace
  };

  return (
    <div className="card">
      <h2 className="card-title">🔍 MULTI-COLUMN LIVE SEARCH</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Fill out up to 4 columns to refine your search (AND condition). Empty fields are ignored.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {conditions.map((cond, index) => (
          <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', width: '20px' }}>{index + 1}.</span>
            <div className="input-group" style={{ flex: 1 }}>
              <select 
                className="form-control"
                value={cond.column} 
                onChange={(e) => handleConditionChange(index, 'column', e.target.value)}
              >
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ flex: 2 }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Search value..." 
                value={cond.query} 
                onChange={(e) => handleConditionChange(index, 'query', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="action-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-outline" onClick={handleReset}>🔄 CLEAR</button>
        <button className="btn" style={{backgroundColor: '#1e3a8a', color: 'white'}} onClick={onDone}>🏁 FINISH WORKFLOW</button>
      </div>

      {pendingResults && pendingResults.length > 0 && (
        <div className={`prompt-box alert-info`} style={{ marginTop: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <strong>Found {pendingResults.length} matching records. Add unique records to your workspace?</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => handleDecision('YES')}>YES</button>
            <button className="btn btn-outline" onClick={() => handleDecision('NO')}>NO</button>
          </div>
        </div>
      )}

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