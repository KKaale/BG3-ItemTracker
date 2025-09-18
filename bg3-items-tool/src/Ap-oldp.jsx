import { useEffect, useState } from 'react';
import Papa from 'papaparse';
function App() {
  const [items, setItems] = useState([]);
  const [pickedItems, setPickedItems] = useState(() => {
    // Load saved picks from localStorage
    const saved = localStorage.getItem('pickedItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState('');

  const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSnLser-MwdvgJOpaMpIzolZAFOdsZM352St4lOYPKIxn5scnDMFocCDiCIKVWOzE42LIpuJLzVRH61/pub?gid=0&single=true&output=csv';


useEffect(() => {
  fetch(CSV_URL)
    .then((res) => res.text())
    .then((csvText) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data
            .filter(
              (item) =>
                item['Item Type'] !== 'Approval' &&
                item['Item Type'] !== 'Inspiration'
            )
            .sort((a, b) => {
              // Numeric Act sort
              const actA = parseInt(a.Act) || 0;
              const actB = parseInt(b.Act) || 0;
              if (actA !== actB) return actA - actB;

              return (a.Location || '').localeCompare(b.Location || '');
            });
          setItems(data);
        },
      });
    });
}, []);
    

  // Toggle pick
  const togglePick = (id) => {
    let updated;
    if (pickedItems.includes(id)) {
      updated = pickedItems.filter((i) => i !== id);
    } else {
      updated = [...pickedItems, id];
    }
    setPickedItems(updated);
    localStorage.setItem('pickedItems', JSON.stringify(updated));
  };

  // Filtered items by search
  const filteredItems = items.filter((item) =>
    item.Item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">BG3 Item Tracker</h1>

      <input
        type="text"
        placeholder="Search items..."
        className="mb-4 p-2 border rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <h2 className="text-xl font-semibold mb-2">Item List</h2>
      <ul className="mb-6">
        {filteredItems.map((item, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center p-2 border-b"
          >
            <div>
              <strong>{item.Item}</strong> - {item['Item Type']} - {item.Act} -{' '}
              {item.Location}
            </div>
            <button
              className={`px-2 py-1 rounded ${
                pickedItems.includes(item.Item) ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => togglePick(item.Item)}
            >
              {pickedItems.includes(item.Item) ? 'Picked' : 'Pick'}
            </button>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">My Route</h2>
      <ul>
        {pickedItems.map((id) => {
          const item = items.find((i) => i.Item === id);
          return (
            <li key={id} className="p-2 border-b">
              {item.Item} - {item.Act} - {item.Location}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
