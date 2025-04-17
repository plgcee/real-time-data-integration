import { useState, useEffect } from 'react';

export default function CreateDatabaseModal({ onDatabaseCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [databaseName, setDatabaseName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedDatabaseName = localStorage.getItem('databaseName');
    if (savedDatabaseName) {
      setDatabaseName(savedDatabaseName);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!databaseName.trim()) {
      setError('Database name is required');
      return;
    }

    setError('');
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/createDatabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseName }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(result.message || 'Database created successfully!');
        localStorage.setItem('databaseName', databaseName);
        if (onDatabaseCreated) {
          onDatabaseCreated(databaseName);
        }
        setDatabaseName('');
        setTimeout(() => setShowModal(false), 1500); // Auto-close on success
      } else {
        setError(result.error || 'Something went wrong.');
      }
    } catch (error) {
      setError('Failed to create database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="ml-5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Create Database
      </button>

      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Create Database</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={databaseName}
                onChange={(e) => setDatabaseName(e.target.value)}
                placeholder="Enter database name"
                className="w-full px-4 py-2 mb-3 border border-gray-400 rounded-md bg-white text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Database'}
              </button>
            </form>

            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            {message && <p className="text-green-500 mt-2 text-sm">{message}</p>}

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}