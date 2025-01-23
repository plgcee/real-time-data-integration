import { useState, useEffect } from 'react';

export default function CreateSchemaModal() {
  const [showModal, setShowModal] = useState(false);
  const [schemaName, setSchemaName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // On modal open, try to load the schema name from localStorage
  const loadSchemaFromLocalStorage = () => {
    const savedSchemaName = localStorage.getItem('schemaName');
    if (savedSchemaName) {
      setSchemaName(savedSchemaName);
    }
  };

  // Call loadSchemaFromLocalStorage when the component mounts
  useEffect(() => {
    loadSchemaFromLocalStorage();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!schemaName) {
      setError('Schema name is required');
      return;
    }

    setError('');
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/createSchema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemaName }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(result.message);
        localStorage.setItem('schemaName', schemaName); // Store schema name in localStorage
        setSchemaName('');
        setShowModal(false);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to create schema');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="m-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Schema
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Create Schema</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                placeholder="Enter schema name"
                className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Schema'}
              </button>
            </form>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {message && <p className="text-green-500 mt-2">{message}</p>}

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
