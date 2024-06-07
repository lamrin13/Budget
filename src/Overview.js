import { Chart } from "react-google-charts";
import { useTheme } from "./ThemeContext";
import { useEffect, useState } from "react";


const Overview = (data) => {
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalSpend, setTotalSpend] = useState(0)
  const [chartData, setChartData] = useState([])
  const [nPay, setNPay] = useState(0);
  const [rPay, setRPay] = useState(0);
  const [sortedMap, setSortedMap] = useState(new Map());
  const { theme } = useTheme();
  useEffect(() => {
    let tmp = groupData(data)

    setChartData(tmp);
  }, [])
  const groupData = (data) => {
    
    if (data.data.length === 0) {
      return [[]]
    }
    const tmp = new Map();
    const graphData = [["From", "To", "Weight"]]
    let ti = 0, ts = 0;

    data.data.forEach(element => {


      if (tmp.has(element.Description.toLowerCase())) {
        tmp.set(element.Description.toLowerCase(), tmp.get(element.Description.toLowerCase()) + element.Amount)
      } else {
        tmp.set(element.Description.toLowerCase(), element.Amount)
      }
    });
    tmp.forEach((v, k) => {
      if (v < 0) {
        graphData.push(["Spend", k.charAt(0).toUpperCase() + k.slice(1), -Math.round(v * 100) / 100])
        ts += Math.round(-v * 100) / 100;

      } else {
        graphData.push([k.charAt(0).toUpperCase() + k.slice(1), "Income", Math.round(v * 100) / 100])
        ti += Math.round(v * 100) / 100

      }
    })

    setSortedMap(tmp)

    graphData.push(["Income", "Spend", ts])
    setTotalIncome(Math.round(ti * 100) / 100);
    setTotalSpend(Math.round(ts * 100) / 100);
    setNPay(Math.round(tmp.get("pay") * 100) / 100);
    setRPay(Math.round(tmp.get("td pay") * 100) / 100);
    return graphData
  }
  const options = {
    sankey: {
      link: { color: { fill: "#bb86fc" } },
      node: {
        colors: ["#03dac5"],
        label: { color: "#ffffff" },
      },
    },
  };
  const getTop3 = () => {
    
    let tmp = chartData.filter((e) => {
      return e[0] == "Spend"
    }).sort( (a,b) => b[2] - a[2])
    
    if(tmp.length===0){return(<div>Loading...</div>)}
    return (
      <div>
        <p>{tmp[0][1]}: ${tmp[0][2]}</p>
        <p>{tmp[1][1]}: ${tmp[1][2]}</p>
        <p>{tmp[2][1]}: ${tmp[2][2]}</p>
      </div>
    )
  }
  return (


    <div className="container-fluid mt-5">
      <div className="row align-items-center">
        <div className="col-sm-3">
          <div className={`card m-3 ${theme}`}>
            {/* <div className="card-header">Header</div> */}
            <div className="card-body">
              <h5 className="card-title text-center">Total Income</h5>
              <p className="card-text text-center h4">${totalIncome}</p>
            </div>
          </div>
          <div className={`card m-3 ${theme}`}>
            {/* <div className="card-header">Header</div> */}
            <div className="card-body">
              <h5 className="card-title text-center">Nirmal Pay</h5>
              <p className="card-text text-center h4">${nPay}</p>
            </div>
          </div>
          <div className={`card m-3 ${theme}`}>
            {/* <div className="card-header">Header</div> */}
            <div className="card-body">
              <h5 className="card-title text-center">Rutvi Pay</h5>
              <p className="card-text text-center h4">${rPay}</p>
            </div>
          </div>
        </div>
        <div className="col-sm-6 ">
          <Chart
            chartType="Sankey"
            loader={<div>Loading...</div>}
            width="100%"
            height="75vh"
            data={chartData}
            options={options}
          />
        </div>
        <div className="col-sm-3 ">
          <div className={`card m-3 ${theme}`}>
            {/* <div className="card-header text-center">Total Spend</div> */}
            <div className="card-body">
              <h5 className="card-title text-center">Total Spend</h5>
              <p className="card-text text-center h4">${totalSpend}</p>
            </div>
          </div>
          <div className={`card m-3 ${theme}`}>
            <div className="card-body">
              <h5 className="card-title text-center">Total Saving</h5>
              <p className="card-text text-center h4">${Math.round((totalIncome - totalSpend) * 100) / 100}</p>
            </div>
          </div>
          <div className={`card m-3 ${theme}`}>
            {/* <div className="card-header">Top 3</div> */}
            <div className="card-body">
              <h5 className="card-title text-center" style={{ "marginTop": "10px" }}>
                {getTop3()}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>


  );
};

export default Overview;
