import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';
import { Typeahead } from 'react-bootstrap-typeahead';

const ThemeSwitcher = ({ tabData, setTabData }) => {

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [newData, setNewData] = useState({ 'Date': '', 'Amount': 0, 'Description': '' });
  const itemsPerPage = 10;
  const tablesData = useRef(new Map());
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState([]);
  // const options = [
  //   { id: 1, label: 'Alabama' },
  //   { id: 2, label: 'Alaska' },
  //   { id: 3, label: 'Arizona' },
  //   { id: 4, label: 'Arkansas' },
  //   { id: 5, label: 'California' },
  //   // Add more options as needed
  // ];
  useEffect(() => {
    fetchOptions()
    fetchData()
  }, [])

  const fetchOptions = async () => {
    try {
      const response = await fetch("https://go-sheet-wlmvfjxx6q-pd.a.run.app/categories");
      const data = await response.json();
      const options = data.map(x => ({
        id: x, label: x
      }));
      setOptions(options);
    } catch (error) {
      console.error("Error fetching categories: ", error)
    }
  }
  const fetchData = async () => {
    try {
      const response = await fetch("https://go-sheet-wlmvfjxx6q-pd.a.run.app/all");
      const data = await response.json();
      const filtered = data.map(x => ({
        Date: x.date,
        Amount: x.income > 0 ? x.income : -x.spend,
        Description: x.remark
      }));
      setTabData(filtered)
      // tablesData.current.set(tabName, filtered)
    } catch (error) {
      console.error(`Error fetching data:`, error);
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



  const handleSubmit = (e) => {
    e.preventDefault();
    // setTabData(prevData => ({
    //   ...prevData,
    //   [activeTab]: [...(prevData[activeTab] || []), newData]
    // }));
    const body = JSON.stringify([{
      Date: newData.Date,
      Income: newData.Amount > 0 ? Number(newData.Amount) : 0,
      Spend: newData.Amount < 0 ? Number(-newData.Amount) : 0,
      Remark: selected[0].label
    }]);
    // console.log(body)
    fetch("https://go-sheet-wlmvfjxx6q-pd.a.run.app/", {
      method: "POST",
      body: body,
      headers: { "Content-type": "application/json" }
    });

    setTabData(prevData => [...prevData, {
      Date: newData.Date,
      Amount: Number(newData.Amount),
      Description: selected[0].label
    }]);
    setNewData({ 'Date': '', 'Amount': 0, 'Description': '' });
    setSelected([])
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const renderTable = (data) => {
    // console.log(data)
    if (!data) {
      return <p>Loading...</p>;
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // console.log(data)
    const currentItems = sortedData(data).slice(indexOfFirstItem, indexOfLastItem);

    // const currentItems = data
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
            {(
              <tr>
                <td>
                  <input type="date" className="form-control" name="Date" value={newData.Date} onChange={handleChange} />
                </td>
                <td>
                  <input type="number" className="form-control" name="Amount" value={newData.Amount} onChange={handleChange} />
                </td>
                <td>
                  <div className='input-group'>
                    <Typeahead
                      id="basic-typeahead"
                      labelKey="label"
                      multiple={false}
                      options={options}
                      placeholder="Category"
                      selected={selected}
                      onChange={setSelected}
                    />
                    <button className="btn btn-success me-1 input-group-append" onClick={handleSubmit}>
                      Save
                    </button>
                    <button className="btn btn-secondary input-group-append" onClick={() => {
                      setNewData({ 'Date': '', 'Amount': 0, 'Description': '' });
                      setSelected([]);
                    }
                    }>
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
  const { theme } = useTheme();
  return (
    <div className={`card m-3 ${theme}`}>
      <div className="card-body">
        {/* <button className="btn btn-primary mb-1" onClick={handleAddRow}>Add</button> */}
        {renderTable(tabData)}
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
            <a role='button' onClick={() => paginate(number)} className="page-link">
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ThemeSwitcher;
