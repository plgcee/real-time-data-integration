import { useEffect, useState } from 'react';
import axios from 'axios';

const RecordList = () => {
  const [recordsRDS1, setRecordsRDS1] = useState([]);
  const [recordsRDS2, setRecordsRDS2] = useState([]);
  const [schemaName, setSchemaName] = useState('public');
  const [databaseName, setDatabaseName] = useState('postgres');
  const [loading, setLoading] = useState(true);

  // State for managing modal
  const [showEditModal, setShowEditModal] = useState(false); // To control modal visibility
  const [currentRecord, setCurrentRecord] = useState(null); // To store the record being edited

  useEffect(() => {
    const fetchData = async () => {
      const savedSchemaName = localStorage.getItem('schemaName');
      const savedDatabaseName = localStorage.getItem('databaseName');
      if (savedSchemaName) setSchemaName(savedSchemaName);
      if (savedDatabaseName) setDatabaseName(savedDatabaseName);

      try {
        // Fetch records from RDS1
        const response1 = await axios.get(`/api/getRecordsRDS1?databaseName=${encodeURIComponent(databaseName)}`);
        setRecordsRDS1(response1.data);

        // Fetch records from RDS2
        const response2 = await axios.get(`/api/getRecordsRDS2?schemaName=${encodeURIComponent(schemaName)}`);
        if (response2) setRecordsRDS2(response2.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schemaName, databaseName]);

  const handleRefresh = async () => {
    const savedSchemaName = localStorage.getItem('schemaName');
    const savedDatabaseName = localStorage.getItem('databaseName');
    if (savedSchemaName) setSchemaName(savedSchemaName);
    if (savedDatabaseName) setDatabaseName(savedDatabaseName);
    setLoading(true);
    try {
      const response1 = await axios.get(`/api/getRecordsRDS1?databaseName=${encodeURIComponent(databaseName)}`);
      setRecordsRDS1(response1.data);

      const response2 = await axios.get(`/api/getRecordsRDS2?schemaName=${encodeURIComponent(schemaName)}`);
      if (response2.data) setRecordsRDS2(response2.data);
    } catch (error) {
      console.error('Error refreshing records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open the edit modal and set the current record
  const handleEditClick = (record) => {
    setCurrentRecord(record); // Set the record to be edited
    setShowEditModal(true);   // Show the modal
  };

  // Handle submission of the edited data
  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    if (!currentRecord) return;
    
    // Get the saved database name (you may want to set it from local storage, state, or other means)
    const savedDatabaseName = localStorage.getItem('databaseName');
  
    try {
      setLoading(true);
  
      // Send the updated record to the API
      const response = await axios.post('/api/editRecord', {
        ...currentRecord, // Include the current record data
        databaseName: savedDatabaseName, // Include the database name
      });
  
      if (response.data.success) {
        // Update the local state with the edited record
        setRecordsRDS1((prevRecords) =>
          prevRecords.map((record) =>
            record.id === currentRecord.id ? currentRecord : record
          )
        );
  
        setShowEditModal(false); // Close the modal after successful edit
      } else {
        console.error('Error updating record');
      }
    } catch (error) {
      console.error('Error submitting edited record:', error);
    } finally {
      setLoading(false);
    }
  };
  

  // Handle input changes in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRecord((prevRecord) => ({
      ...prevRecord,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="inline-block animate-spin border-4 border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="record-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
      {/* Left Section for RDS1 */}
      <div className="rds1-records" style={{ width: '48%' }}>
        <h2 className="text-center text-3xl m-3">Source Database - {databaseName}</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {recordsRDS1.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.name}</td>
                <td>{record.quantity}</td>
                <td>{record.price}</td>
                <td className="text-center">
                  <button
                    onClick={() => handleEditClick(record)}
                    className="px-5 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refresh Button */}
      <button
        className="m-10 h-20 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={handleRefresh}
      >
        Refresh Records
      </button>

      {/* Right Section for RDS2 */}
      <div className="rds2-records" style={{ width: '48%' }}>
        <h2 className="text-center text-3xl m-3">Target Database: Schema = {schemaName}</h2>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Edit Record</h2>

            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={currentRecord?.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={currentRecord?.quantity || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={currentRecord?.price || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordList;
