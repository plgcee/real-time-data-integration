// components/RecordList.js

import { useEffect, useState } from 'react';
import axios from 'axios';

const RecordList = () => {
  const [recordsRDS1, setRecordsRDS1] = useState([]);
  const [recordsRDS2, setRecordsRDS2] = useState([]);
  const [schemaName, setSchemaName] = useState('public')
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const savedSchemaName = localStorage.getItem('schemaName');
        if (savedSchemaName) {
            setSchemaName(savedSchemaName);
        }
      try {
        // Fetch records from RDS1
        const response1 = await axios.get('/api/getRecordsRDS1');
        setRecordsRDS1(response1.data);

        // Fetch records from RDS2
        const response2 = await axios.get(`/api/getRecordsRDS2?schemaName=${encodeURIComponent(schemaName)}`);
        if(response2) {
           setRecordsRDS2(response2.data);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schemaName]); // Fetch data once on mount

  if (loading) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="border-4 border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
        </div>
      );
  }
  const handleRefresh = async () => {
    const savedSchemaName = localStorage.getItem('schemaName');
    if (savedSchemaName) {
      setSchemaName(savedSchemaName);
    }
  
    try {
      setLoading(true);
      // Fetch records from RDS1
      const response1 = await axios.get('/api/getRecordsRDS1');
      setRecordsRDS1(response1.data);
  
      // Fetch records from RDS2
      const response2 = await axios.get(`/api/getRecordsRDS2?schemaName=${encodeURIComponent(schemaName)}`);
      if (response2.data != undefined) {
        setRecordsRDS2(response2.data);
      }
    } catch (error) {
      console.error('Error refreshing records:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="record-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
      {/* Left Section for RDS1 */}
      
      <div className="rds1-records" style={{ width: '48%' }}>
        <h2 className='text-center text-3xl m-3'>Source Database</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {recordsRDS1.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.name}</td>
                <td>{record.quantity}</td>
                <td>{record.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="m-10 h-20 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={handleRefresh}>Refresh Records</button>
      {/* Right Section for RDS2 */}
      <div className="rds2-records" style={{ width: '48%' }}>
        <h2 className='text-center text-3xl m-3'>Target Database: Schema = {schemaName}</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {recordsRDS2.map((record) => (
              <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.name}</td>
              <td>{record.quantity}</td>
              <td>{record.price}</td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordList;
