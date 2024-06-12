import React, { useState, useEffect } from 'react';
// import { useTheme } from './ThemeContext';
import { Typeahead } from 'react-bootstrap-typeahead';
// import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const ThemeSwitcher = ({ tabData, setTabData, groupedData }) => {
  // console.log(groupedData)
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [newData, setNewData] = useState({ 'Date': '', 'Amount': 0, 'Description': '' });
  const itemsPerPage = 10;
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
    // fetchData()
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
    // const dateSplit = newData.Date.split("-")
    // const formattedDate = dateSplit.length < 3 ? newData.Date : dateSplit[1] + "/" +dateSplit[2] + "/" + dateSplit[0];
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

  const renderTable = (data, groupedData) => {
    if (!data || data.length === 0) {
      return <p>Loading...</p>;
    }
    console.log(groupedData)
    const catItems = [];
    groupedData.forEach((v,k) => {
      if(v<0)
        catItems.push({"Category": k.charAt(0).toUpperCase() + k.slice(1), "Amount": parseFloat(-v).toFixed(2)});
    })
    catItems.sort((a,b) => b.Amount - a.Amount)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // console.log(data)
    const currentItems = sortedData(data).slice(indexOfFirstItem, indexOfLastItem);
    return (
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-sm-7">
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th scope="col" role='button' onClick={() => handleSort('Date')} className='user-select-none'>Date</th>
                  <th scope="col" role='button' onClick={() => handleSort('Amount')} className='user-select-none'>Amount</th>
                  <th scope="col">Description</th>
                  {/* {isAdding && <th scope="col">Actions</th>} */}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Date}</td>
                    <td>{item.Amount}</td>
                    <td>{item.Description}</td>
                  </tr>
                ))}
                {(
                  <tr className='bg-secondary'>
                    <td>
                      <input type="date" className="form-control" name="Date" value={newData.Date} onChange={handleChange} />
                      {/* <b-form-datepicker id="example-datepicker" v-model={newData.Date}></b-form-datepicker> */}
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
            <Pagination className='text-bg-secondary'
              itemsPerPage={itemsPerPage}
              totalItems={data.length}
              currentPage={currentPage}
              paginate={paginate}
            />
          </div>
          <div className="col-sm-5">
            <table className="table table-dark table-striped">
            <thead>
                <tr>
                  <th scope="col" className='user-select-none'>Category</th>
                  <th scope="col" className='user-select-none'>Amount</th>
                  
                  {/* {isAdding && <th scope="col">Actions</th>} */}
                </tr>
              </thead>
              <tbody>
              {catItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Category}</td>
                    <td>{item.Amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    // <div className={`card text-bg-secondary m-3`}>
    //   <div className="card-body">
    //     {/* <button className="btn btn-primary mb-1" onClick={handleAddRow}>Add</button> */}
    //     {renderTable(tabData)}
    //   </div>
    // </div>
    <div className='m-3'>
      {renderTable(tabData, groupedData)}
    </div>
  );
};

const Pagination = ({ itemsPerPage, totalItems, currentPage, paginate }) => {
  const [pageNumber, setPageNumber] = useState(currentPage);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    setPageNumber(currentPage);
  }, [currentPage]);

  const handlePageChange = (event) => {
    let newPage = Number(event.target.value);
    if (newPage > totalPages) {
      newPage = totalPages;
    } else if (newPage < 1) {
      newPage = 1;
    }
    if (event.key === 'Enter') {
      paginate(newPage);
    }
  };

  const goToFirstPage = () => paginate(1);
  const goToPreviousPage = () => paginate((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => paginate((prev) => Math.min(prev + 1, totalPages));
  const goToLastPage = () => paginate(totalPages);

  return (
    <nav className="d-flex justify-content-center">
      <ul className="pagination">
        <li className="page-item">
          <button className="page-link" onClick={goToFirstPage} aria-label="First">
            &laquo;&laquo;
          </button>
        </li>
        <li className="page-item">
          <button className="page-link" onClick={goToPreviousPage} aria-label="Previous">
            &laquo;
          </button>
        </li>
        <li className="page-item">
          <input
            type="text"
            className="form-control"
            value={pageNumber}
            onChange={(event) => setPageNumber(event.target.value)}
            onBlur={() => paginate(pageNumber)}
            onKeyDown={handlePageChange}
            style={{ width: '50px', textAlign: 'center' }}
          />
        </li>
        <li className="page-item">
          <button className="page-link" onClick={goToNextPage} aria-label="Next">
            &raquo;
          </button>
        </li>
        <li className="page-item">
          <button className="page-link" onClick={goToLastPage} aria-label="Last">
            &raquo;&raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};



export default ThemeSwitcher;
