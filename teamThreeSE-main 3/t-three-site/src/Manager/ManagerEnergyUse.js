import React, { useState } from 'react';
import { BarChart, LineChart, PieChart } from '@mui/x-charts'; 
import '../graphs/energyUse.css';

// Helper to aggregate the data based on the timeframe
const aggregateData = (rawData, timeFrame) => {
  let aggregated = [];
  let total = 0, counter = 0;

  switch (timeFrame) {
    case 'day': {
      aggregated = rawData.slice(Math.max(rawData.length - 24, 0));
      break;
    }
    case 'week': {
      const slice = rawData.slice(Math.max(rawData.length - 168, 0));
      for (let i = 0; i < slice.length; i++) {
        total += slice[i];
        counter++;
        if (counter % 24 === 0) {
          aggregated.push(total);
          total = 0;
        }
      }
      break;
    }
    case 'month': {
      const slice = rawData.slice(Math.max(rawData.length - 730, 0));
      for (let i = 0; i < slice.length; i++) {
        total += slice[i];
        counter++;
        if (counter % 73 === 0) {
          aggregated.push(total);
          total = 0;
        }
      }
      break;
    }
    case 'year': {
      for (let i = 0; i < rawData.length; i++) {
        total += rawData[i];
        counter++;
        if (counter % 730 === 0) {
          aggregated.push(total);
          total = 0;
        }
      }
      break;
    }
    default:
      aggregated = [];
  }
  return aggregated;
};

// Helper to parse the raw data from the DB.
// Optionally filters by device type (filterIn) and by resident (residentFilter).
function parseData(rawData, filterIn, residentFilter) {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return [];
  }
  const combinedData = new Array(8760).fill(0);
  rawData.forEach((localData) => {
    if (filterIn && localData.type.toLowerCase() !== filterIn.toLowerCase()) {
      return;
    }
    if (residentFilter !== 'all') {
      if (localData.owner_id !== residentFilter) {
        return;
      }
    }
    try {
      const parsed = JSON.parse(localData.data);
      const localArray = parsed.usageData;
      if (!localArray || !Array.isArray(localArray)) return;
      for (let j = 0; j < localArray.length; j++) {
        combinedData[j] += localArray[j];
      }
    } catch (e) {
      console.error('Error parsing record:', localData, e);
    }
  });
  return combinedData;
}

// Helper to sum an array of numbers.
const sumData = (dataArray) => dataArray.reduce((acc, val) => acc + val, 0);

// ManagerEnergyUse Component
// Props:
// - timeFrame: "day", "week", "month", or "year"
// - deviceType: e.g., "all", "light", "radiator", etc.
// - rawDataIn: array of device records
// - selectedResident: used to filter data by resident if needed
const ManagerEnergyUse = ({ timeFrame, deviceType, rawDataIn, selectedResident }) => {
  const [chartType, setChartType] = useState("bar");

  if (!rawDataIn) {
    return <div>No data available</div>;
  }

  // Create variables for each device type:
  const allRawData = parseData(rawDataIn, null, selectedResident);
  const lightRawData = parseData(rawDataIn, 'light', selectedResident);
  const radiatorRawData = parseData(rawDataIn, 'radiator', selectedResident);
  const blindRawData = parseData(rawDataIn, 'blind', selectedResident);
  const plugRawData = parseData(rawDataIn, 'plug', selectedResident);

  // Aggregate data based on timeframe:
  const aggregatedAll = aggregateData(allRawData, timeFrame);
  const aggregatedLight = aggregateData(lightRawData, timeFrame);
  const aggregatedRadiator = aggregateData(radiatorRawData, timeFrame);
  const aggregatedBlind = aggregateData(blindRawData, timeFrame);
  const aggregatedPlug = aggregateData(plugRawData, timeFrame);

  // Select the filtered aggregated data based on deviceType.
  let filteredAggregated;
  switch (deviceType.toLowerCase()) {
    case 'all':
      filteredAggregated = aggregatedAll;
      break;
    case 'light':
      filteredAggregated = aggregatedLight;
      break;
    case 'radiator':
      filteredAggregated = aggregatedRadiator;
      break;
    case 'blind':
      filteredAggregated = aggregatedBlind;
      break;
    case 'plug':
      filteredAggregated = aggregatedPlug;
      break;
    default:
      filteredAggregated = aggregatedAll;
  }

  //for the days get the current hour as the latest point and the past 23
  var currentDate = new Date();
  var currentHour = currentDate.getHours();
  
  // Generate dynamic time labels for the last 24 hours
  function generateLastDayHours() {
    const hours = [];
    
    for (let i = 0; i < 24; i++) {
      // Calculate hour (going back 23 hours from current hour)
      let hourValue = (currentHour - 23 + i + 24) % 24;
      // Format as "HH:00"
      let formattedHour = hourValue.toString().padStart(2, '0') + ':00';
      hours.push(formattedHour);
    }
    
    return hours;
  }
  
  // Replace the static hours array with the dynamic one
  const xDataMap = {
    day: generateLastDayHours(),
    week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    month: ['1st', '4th', '7th', '10th', '13th', '16th', '19th', '22nd', '25th', '28th'],
    year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  const xData = xDataMap[timeFrame] || [];

  // build the series array for bar/line charts.
  const series = [
    { name: 'All Devices', data: aggregatedAll, color: 'rgba(0, 123, 255, 0.7)' }
  ];
  if (deviceType.toLowerCase() !== 'all') {
    let color = 'rgba(0, 123, 255, 0.7)';
    if (deviceType.toLowerCase() === 'light') color = 'rgba(255, 205, 86, 0.7)';
    if (deviceType.toLowerCase() === 'radiator') color = 'rgba(75, 192, 114, 0.7)';
    if (deviceType.toLowerCase() === 'blind') color = 'rgba(153, 102, 255, 0.7)';
    if (deviceType.toLowerCase() === 'plug') color = 'rgba(255, 99, 132, 0.7)';
    series.push({
      name: deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
      data: filteredAggregated,
      color
    });
  }

  let chartComponent;
  if (chartType === "bar") {
    chartComponent = (
      <BarChart
        series={series}
        xAxis={[{ data: xData, scaleType: 'band' }]}
        height={290}
      />
    );
  } else if (chartType === "line") {
    chartComponent = (
      <LineChart
        series={series}
        xAxis={[{ data: xData, scaleType: 'band' }]}
        height={290}
      />
    );
  } else if (chartType === "pie") {
    let pieData = [];
    if (deviceType.toLowerCase() === 'all') {
      // grouping the raw data by resident.
      const residentMap = {};
      rawDataIn.forEach((record) => {
        if (selectedResident !== 'all' && record.owner_id !== selectedResident) {
          return;
        }
        try {
          const parsed = JSON.parse(record.data);
          const usageArray = parsed.usageData;
          const recordSum = Array.isArray(usageArray)
            ? usageArray.reduce((a, b) => a + b, 0)
            : 0;
          const owner = record.owner_id.substring(0, 8);
          if (owner) {
            residentMap[owner] = (residentMap[owner] || 0) + recordSum;
          }
        } catch (e) {
          console.error(e);
        }
      });
      pieData = Object.entries(residentMap).map(([owner, total]) => ({
        label: owner, 
        value: total
      }));
    } else {
      // for a specific device, show 100% of the usage
      pieData = [
        {
          label: deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
          value: sumData(filteredAggregated)
        }
      ];
    }
    chartComponent = (
      <PieChart
        series={[{
          data: pieData,
          dataLabels: {
            enabled: true,
            formatter: ({ datum }) => datum.label,
            style: {
              fill: '#000',
              fontSize: 14,
              textAnchor: 'start',
              transform: 'translate(200px, 0)' 
            }        
          }
        }]}
        height={290}
      />
    );
  }

  return (
    <div className="energyBase">
      <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>
          Energy Usage {deviceType.toLowerCase() !== 'all'
            ? `for ${deviceType} devices`
            : 'for All Devices'}
        </h3>
        <div className="chart-toggle">
          <div className="segmented-control">
            <div 
              className={`segment ${chartType === "bar" ? "active" : ""}`}
              onClick={() => setChartType("bar")}>
              Bar
            </div>
            <div 
              className={`segment ${chartType === "line" ? "active" : ""}`}
              onClick={() => setChartType("line")}>
              Line
            </div>
            <div 
              className={`segment ${chartType === "pie" ? "active" : ""}`}
              onClick={() => setChartType("pie")}>
              Pie
            </div>
          </div>
        </div>
      </div>
      {chartComponent}
    </div>
  );
};

export default ManagerEnergyUse;
