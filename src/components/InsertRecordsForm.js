import { useState } from 'react';

export default function InsertRecordsModal() {
  const [showModal, setShowModal] = useState(false);
  const [products] = useState([
    { id: 1, name: 'Apple iPhone 16 Pro', price: 79900, quantity: 100 },
    { id: 2, name: 'Samsung S25 Ultra 5G', price: 153900, quantity: 200 },
    { id: 3, name: 'Google Pixel 9 Pro Fold', price: 109900, quantity: 150 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const databaseName = localStorage.getItem('databaseName');

    if (!databaseName) {
      setError('Database name is required');
      return;
    }

    setError('');
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/insertRecords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseName, products }),
      });
      
      const result = await res.json();

      if (res.ok) {
        setMessage(result.message);
        setShowModal(false);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to insert records');
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="flex flex-col sm:flex-row justify-center items-center mb-6 gap-4 overflow-hidden">
<button
    onClick={() => setShowModal(true)}
    className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition duration-200"
    >Insert Product Records
  </button>
      
  {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-96"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Product Records</h2>

      {/* Table */}
      <table className="w-full text-left border-collapse mb-4">
        <thead>
          <tr className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-gray-300 dark:border-gray-600">
              <td className="p-2 text-gray-900 dark:text-gray-200">{product.id}</td>
              <td className="p-2 text-gray-900 dark:text-gray-200">{product.name}</td>
              <td className="p-2 text-gray-900 dark:text-gray-200">${product.price.toLocaleString()}</td>
              <td className="p-2 text-gray-900 dark:text-gray-200">{product.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Submit Button */}
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Records'}
        </button>
      </form>

      {/* Error & Success Messages */}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {message && <p className="text-green-500 mt-2">{message}</p>}

      {/* Cancel Button */}
      <button
        onClick={() => setShowModal(false)}
        className="mt-4 w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  );
}