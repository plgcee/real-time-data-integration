import { useEffect, useState } from 'react';
import axios from 'axios';
import { updateLastActivity } from '../lib/db';

const RecordList = () => {
  const [recordsRDS1, setRecordsRDS1] = useState([]);
  const [recordsRDS2, setRecordsRDS2] = useState([]);
  const [schemaName, setSchemaName] = useState('public');
  const [databaseName, setDatabaseName] = useState('postgres');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error state

  // State for managing modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        updateLastActivity(); // Update activity timestamp

        // Fetch database info from localStorage
        const savedSchemaName = localStorage.getItem('schemaName');
        const savedDatabaseName = localStorage.getItem('databaseName');
        if (savedSchemaName) setSchemaName(savedSchemaName);
        if (savedDatabaseName) setDatabaseName(savedDatabaseName);

        // Fetch records from RDS1
        const response1 = await axios.get(`/api/getRecordsRDS1?databaseName=${encodeURIComponent(databaseName)}`);
        // Check if the response has the expected structure
        if (response1.data && response1.data.success) {
          setRecordsRDS1(response1.data.data || []);
        } else {
          setRecordsRDS1([]);
          console.warn('Unexpected response format from RDS1:', response1.data);
        }

        // Fetch records from RDS2
        const response2 = await axios.get(`/api/getRecordsRDS2?schemaName=${encodeURIComponent(schemaName)}`);
        // Check if the response has the expected structure
        if (response2.data && response2.data.success) {
          setRecordsRDS2(response2.data.data || []);
        } else {
          setRecordsRDS2([]);
          console.warn('Unexpected response format from RDS2:', response2.data);
        }
      } catch (err) {
        console.error('Error fetching records:', err);
        setError(err.response?.data || { message: err.message });
        setRecordsRDS1([]);
        setRecordsRDS2([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schemaName, databaseName]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    updateLastActivity(); // Update activity timestamp

    try {
      // Update state from localStorage with null checks
      const savedSchemaName = localStorage.getItem('schemaName');
      const savedDatabaseName = localStorage.getItem('databaseName');
      
      // Only update state if values exist in localStorage
      if (savedSchemaName) {
        setSchemaName(savedSchemaName);
      }
      
      if (savedDatabaseName) {
        setDatabaseName(savedDatabaseName);
      }

      // Use the updated state values for API calls
      const dbToUse = savedDatabaseName || databaseName;
      const schemaToUse = savedSchemaName || schemaName;

      const response1 = await axios.get(`/api/getRecordsRDS1?databaseName=${encodeURIComponent(dbToUse)}`);
      // Check if the response has the expected structure
      if (response1.data && response1.data.success) {
        setRecordsRDS1(response1.data.data || []);
      } else {
        setRecordsRDS1([]);
        console.warn('Unexpected response format from RDS1:', response1.data);
      }

      const response2 = await axios.get(`/api/getRecordsRDS2?schemaName=${encodeURIComponent(schemaToUse)}`);
      // Check if the response has the expected structure
      if (response2.data && response2.data.success) {
        setRecordsRDS2(response2.data.data || []);
      } else {
        setRecordsRDS2([]);
        console.warn('Unexpected response format from RDS2:', response2.data);
      }
    } catch (err) {
      console.error('Error refreshing records:', err);
      setError(err.response?.data || { message: err.message });
      setRecordsRDS1([]);
      setRecordsRDS2([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setCurrentRecord(record);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!currentRecord) return;

    try {
      setLoading(true);
      updateLastActivity(); // Update activity timestamp
      const savedDatabaseName = localStorage.getItem('databaseName');
      const response = await axios.post('/api/editRecord', {
        ...currentRecord,
        databaseName: savedDatabaseName,
      });

      if (response.data.success) {
        setRecordsRDS1((prevRecords) =>
          prevRecords.map((record) =>
            record.id === currentRecord.id ? currentRecord : record
          )
        );
        setShowEditModal(false);
      } else {
        throw new Error('Failed to update record');
      }
    } catch (err) {
      console.error('Error submitting edited record:', err);
      setError(err.response?.data || { message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRecord((prevRecord) => ({
      ...prevRecord,
      [name]: value,
    }));
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 bg-red-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error: {error.message || 'Unknown Error'}</h2>
          {error.stack && <pre className="text-sm mt-2 whitespace-pre-wrap">{error.stack}</pre>}
        </div>
      ) : (
        <>
          {/* Header & Refresh Button */}
<div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 overflow-hidden">
  <h1 className="text-white text-xl font-semibold whitespace-nowrap">Record Management</h1>
  <button
    onClick={handleRefresh}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg shadow-md flex items-center gap-2 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
    aria-label="Refresh Records"
  >
    🔄 <span>Refresh Records</span>
  </button>
</div>

  
          {/* Tables */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* RDS1 */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-center mb-3">
                Source DB: <span className="text-blue-700">{databaseName}</span>
              </h2>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border">ID</th>
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      <th className="px-4 py-2 border">Price</th>
                      <th className="px-4 py-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsRDS1 && recordsRDS1.length > 0 ? (
                      recordsRDS1.map((record) => (
                        <tr key={record.id} className="text-center border-t">
                          <td className="px-4 py-2 border">{record.id}</td>
                          <td className="px-4 py-2 border">{record.name}</td>
                          <td className="px-4 py-2 border">{record.quantity}</td>
                          <td className="px-4 py-2 border">{record.price}</td>
                          <td className="px-4 py-2 border">
                            <button
                              onClick={() => handleEditClick(record)}
                              className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-black rounded-md transition"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                          No records found in this database
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
  
            {/* RDS2 */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-center mb-3">
                Target DB: <span className="text-green-700">Schema = {schemaName}</span>
              </h2>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border">ID</th>
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      <th className="px-4 py-2 border">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsRDS2 && recordsRDS2.length > 0 ? (
                      recordsRDS2.map((record) => (
                        <tr key={record.id} className="text-center border-t">
                          <td className="px-4 py-2 border">{record.id}</td>
                          <td className="px-4 py-2 border">{record.name}</td>
                          <td className="px-4 py-2 border">{record.quantity}</td>
                          <td className="px-4 py-2 border">{record.price}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                          No records found in this schema
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
  
          {/* Modal */}
          {showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl w-96 max-w-full">
      <h3 className="text-xl font-semibold mb-4">Edit Record</h3>
      <form onSubmit={handleEditSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          value={currentRecord?.name || ''}
          onChange={handleInputChange}
          placeholder="Name"
          className="w-full border border-gray-600 bg-gray-800 text-white rounded px-3 py-2 placeholder-gray-400"
        />
        <input
          type="number"
          name="quantity"
          value={currentRecord?.quantity || ''}
          onChange={handleInputChange}
          placeholder="Quantity"
          className="w-full border border-gray-600 bg-gray-800 text-white rounded px-3 py-2 placeholder-gray-400"
        />
        <input
          type="number"
          name="price"
          value={currentRecord?.price || ''}
          onChange={handleInputChange}
          placeholder="Price"
          className="w-full border border-gray-600 bg-gray-800 text-white rounded px-3 py-2 placeholder-gray-400"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        </>
      )}
    </div>
  );
  
};

export default RecordList;
