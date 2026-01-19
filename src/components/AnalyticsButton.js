export default function AnalyticsButton() {
  const handleClick = () => {
    window.open("http://localhost:8000", "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition duration-200"
    >
      Real Time Sales Dashboard
    </button>
  );
}
