import { useState, useEffect } from 'react';

export default function InsertRecordsModal() {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([
    { id: 1, name: 'Apple Iphone 16 Pro', price: 79900, quantity: 100 },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="ml-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Insert Product Records
      </button>

      {showModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center w-full"
    onClick={() => setShowModal(false)}
  >
    <div
      className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 md:w-2/3 lg:w-1/3 xl:w-1/4"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold mb-4">Product Records</h2>

      <table className="min-w-full border-collapse mb-4">
        <thead>
          <tr>
            <th className="border-b px-4 py-2 text-left">ID</th>
            <th className="border-b px-4 py-2 text-left">Name</th>
            <th className="border-b px-4 py-2 text-left">Price</th>
            <th className="border-b px-4 py-2 text-left">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="border-b px-4 py-2">{product.id}</td>
              <td className="border-b px-4 py-2">{product.name}</td>
              <td className="border-b px-4 py-2">${product.price.toFixed(2)}</td>
              <td className="border-b px-4 py-2">{product.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Records'}
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
