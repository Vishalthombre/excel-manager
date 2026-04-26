import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css'; 
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import SearchPanel from './components/SearchPanel';
import DataTable from './components/DataTable';

function App() {
  const [masterData, setMasterData] = useState(null);
  const [stagedData, setStagedData] = useState([]);
  const [isDone, setIsDone] = useState(false); // Tracks if the user clicked "Done"
  const [theme, setTheme] = useState('light'); // Set to light by default to match document wireframes

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleDataParsed = (data) => {
    setMasterData(data);
    setStagedData([]);
    setIsDone(false);
  };

  // Handles logic for Case A and Case B replacement from the Requirement Doc
  const handleProcessResults = (newResults) => {
    if (stagedData.length === 0) {
      setStagedData(newResults); // Initial Search
    } else if (newResults.length > stagedData.length) {
      // Case A: Add to new file (we will replace for simplicity of keeping data clean, or append based on specific need. Document implies replacing the view with the new broader dataset)
      setStagedData(newResults); 
    } else {
      // Case B: Replace previous records
      setStagedData(newResults);
    }
  };

  const handleExportExcel = () => {
    if (stagedData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(stagedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Compiled Data");
    XLSX.writeFile(workbook, "Filtered_Records.xlsx");
  };

  return (
    <div className="app-layout">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="main-content">
        {!masterData ? (
          <div className="card" style={{ maxWidth: '800px', margin: '4rem auto' }}>
            <FileUpload onDataParsed={handleDataParsed} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="top-status-bar">
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Master File Loaded: </span>
                <strong style={{ color: 'var(--text-main)' }}>{masterData.length} records</strong>
              </div>
              <button className="btn btn-outline" onClick={() => setMasterData(null)}>📁 Change File</button>
            </div>

            {!isDone ? (
              <>
                <SearchPanel 
                  masterData={masterData} 
                  stagedDataCount={stagedData.length} 
                  onProcessResults={handleProcessResults}
                  onDone={() => setIsDone(true)}
                />

                {stagedData.length > 0 && (
                  <div className="card">
                    <h3 style={{marginBottom: '1rem'}}>Current Staged Records ({stagedData.length})</h3>
                    <DataTable data={stagedData} />
                  </div>
                )}
              </>
            ) : (
              /* Final Result Screen */
              <div className="prompt-box alert-info" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '2rem' }}>
                <h2>🏁 FINAL RESULT</h2>
                <p>You have compiled <strong>{stagedData.length}</strong> refined records.</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={handleExportExcel} disabled={stagedData.length === 0}>
                    📥 DOWNLOAD EXCEL
                  </button>
                  <button className="btn btn-outline" onClick={() => setIsDone(false)}>
                    ⬅ Back to Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;