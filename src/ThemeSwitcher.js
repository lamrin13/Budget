import React, { useState, useEffect, useRef } from 'react';


const ThemeSwitcher = () => {
  const [tabsConfig, setTabsConfig] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [tabData, setTabData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ 'Date': '', 'Amount': 0, 'Description': '' });
  const itemsPerPage = 10;
  const tablesData = useRef(new Map());

  useEffect(() => {
    const fetchTabsConfig = async () => {
      try {
        const response = await fetch('https://go-sheet-wlmvfjxx6q-pd.a.run.app/getTabs');
        const data = await response.json();
        const filtered = data.filter(x => !x.startsWith('*'))
        setTabsConfig(filtered);
        filtered.forEach((element) => {
          fetchData(element, filtered[0])
        });
      } catch (error) {
        console.error('Error fetching tabs configuration:', error);
      }
    };

    fetchTabsConfig();
  }, []);

  useEffect(() => {
    if (activeTab) {
      const activeTabConfig = tabsConfig.find(tab => tab === activeTab);
      if (activeTabConfig && tablesData.current.has(activeTab)) {
        setTabData(prevData => ({ ...prevData, [activeTab]: tablesData.current.get(activeTab) }));
      }
    }
  }, [activeTab, tabsConfig]);

  const fetchData = async (tabName, firstTab) => {
    try {
      const response = await fetch("https://go-sheet-wlmvfjxx6q-pd.a.run.app/?month=" + tabName);
      const data = await response.json();
      const filtered = data.map(x => ({
        Date: x.Date,
        Amount: x.Income > 0 ? x.Income : -x.Spend,
        Description: x.Description
      }));
      tablesData.current.set(tabName, filtered)
      if (tabName === firstTab) {
        setActiveTab(tabName);
        setTabData(prevData => ({ ...prevData, [activeTab]: tablesData.current.get(activeTab) }));
      }
    } catch (error) {
      console.error(`Error fetching data for ${tabName}:`, error);
    }
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data) => {
    if (sortConfig.key) {
      const sorted = [...data].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      return sorted;
    }
    return data;
  };

  const handleAddRow = () => {
    setIsAdding(true);
  };

  const handleCancle = (e) => {
    e.preventDefault();
    setIsAdding(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setTabData(prevData => ({
      ...prevData,
      [activeTab]: [...(prevData[activeTab] || []), newData]
    }));
    const body = JSON.stringify([{
      Date: newData.Date,
      Income: newData.Amount > 0 ? Number(newData.Amount) : 0,
      Spend: newData.Amount < 0 ? Number(-newData.Amount) : 0,
      Remark: newData.Description
    }]);
    fetch("https://go-sheet-wlmvfjxx6q-pd.a.run.app/?month=" + activeTab, {
      method: "POST",
      body: body,
      headers: { "Content-type": "application/json" }
    });
    setNewData({ 'Date': '', 'Income': 0, 'Spend': 0, 'Description': '' });
    setIsAdding(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const renderTable = (data) => {
    if (!data) {
      return <p>Loading...</p>;
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData(data).slice(indexOfFirstItem, indexOfLastItem);

    return (
      <div>
        <table className="table">
          <thead>
            <tr className="table-dark">
              <th scope="col" role='button' onClick={() => handleSort('Date')} className='user-select-none'>Date</th>
              <th scope="col" role='button' onClick={() => handleSort('Amount')} className='user-select-none'>Amount</th>
              <th scope="col">Description</th>
              {/* {isAdding && <th scope="col">Actions</th>} */}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index} className={item.Amount > 0 ? 'table-success' : 'table-danger'}>
                <td>{item.Date}</td>
                <td>{item.Amount}</td>
                <td>{item.Description}</td>
              </tr>
            ))}
            {isAdding && (
              <tr>
                <td>
                  <input type="date" className="form-control" name="Date" value={newData.Date} onChange={handleChange} />
                </td>
                <td>
                  <input type="number" className="form-control" name="Amount" value={newData.Amount} onChange={handleChange} />
                </td>
                <td>
                  <div className='input-group'>
                    <input
                      type="text"
                      className="form-control"
                      name="Description"
                      value={newData.Description}
                      onChange={handleChange}
                    />
                    <button className="btn btn-success me-1 input-group-append" onClick={handleSubmit}>
                      Save
                    </button>
                    <button className="btn btn-secondary input-group-append" onClick={() => setIsAdding(false)}>
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={data.length}
          currentPage={currentPage}
          paginate={paginate}
        />
      </div>
    );
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="card m-3">
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          {tabsConfig.map((tab) => (
            <li key={tab} className="nav-item">
              <a
                className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                href="#"
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              >
                {tab}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-body">
        <button className="btn btn-primary mb-1" onClick={handleAddRow}>Add</button>
        {activeTab && renderTable(tabData[activeTab])}
      </div>
    </div>
  );
};

const Pagination = ({ itemsPerPage, totalItems, currentPage, paginate }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <a onClick={() => paginate(number)} href="#" className="page-link">
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ThemeSwitcher;
