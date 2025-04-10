import { useState, useEffect } from 'react';

export default function CreateSchemaModal() {
  const [showModal, setShowModal] = useState(false);
  const [schemaName, setSchemaName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load schema from localStorage when the component mounts
  useEffect(() => {
    const savedSchemaName = localStorage.getItem('schemaName');
    if (savedSchemaName) {
      setSchemaName(savedSchemaName);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!schemaName.trim()) {
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
        localStorage.setItem('schemaName', schemaName);
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
      {/* Open modal button */}
      <button
        onClick={() => setShowModal(true)}
        className="m-5 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-200"
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
            {/* Modal Title (Fixed Visibility) */}
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Schema</h2>

            <form onSubmit={handleSubmit}>
              {/* Input Field (Improved Contrast) */}
              <input
                type="text"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                placeholder="Enter schema name"
                className="w-full px-4 py-2 border border-gray-400 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Schema'}
              </button>
            </form>

            {/* Error & Success Messages */}
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            {message && <p className="text-green-500 mt-2 text-sm">{message}</p>}

            {/* Cancel Button */}
            <button
              onClick={() => setShowModal(false)}
              className="mt-3 w-full px-4 py-2 bg-gray-300 text-gray-900 font-semibold rounded-md hover:bg-gray-400 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
