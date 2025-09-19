import { useState, useEffect } from "react";
import Papa from "papaparse";
import { ChevronRight, ChevronDown, CheckCircle, Circle } from "lucide-react";

function App() {
  const [items, setItems] = useState([]);
  const [searchTerms, setSearchTerms] = useState({});
  const [selectedItems, setSelectedItems] = useState({
    char1: {},
    char2: {},
    char3: {},
    char4: {},
  });
  const [foundItems, setFoundItems] = useState({});
  const [collapsedActs, setCollapsedActs] = useState({});
  const [collapsedOverworlds, setCollapsedOverworlds] = useState({});
  const [collapsedAreas, setCollapsedAreas] = useState({});
  const [collapsedCategories, setCollapsedCategories] = useState({
    Weapons: new Array(4).fill(true),
    Armor: new Array(4).fill(true),
    Jewelry: new Array(4).fill(true),
    Others: new Array(4).fill(true),
  });
  const [characterNames, setCharacterNames] = useState({
    char1: "Character 1",
    char2: "Character 2",
    char3: "Character 3",
    char4: "Character 4",
  });

  const categoryGroups = [
    { title: "Weapons", cats: ["Melee", "Melee 2", "Ranged", "Shield"] },
    { title: "Armor", cats: ["Head", "Torso", "Gloves", "Boots"] },
    { title: "Jewelry", cats: ["Neck", "Ring", "Ring 2", "Cloak"] },
    { title: "Others", cats: ["Other"] },
  ];

  const actColors = ["bg-gray-800", "bg-gray-700", "bg-gray-600", "bg-gray-500"];

  useEffect(() => {
    Papa.parse("/items-clean.csv", {
      download: true,
      header: true,
      complete: (results) => setItems(results.data),
    });
  }, []);

  const removeItem = (charKey, category) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      delete updated[charKey][category];
      return updated;
    });
  };

  const toggleCollapse = (key, type) => {
    if (type === "act") setCollapsedActs((prev) => ({ ...prev, [key]: !prev[key] }));
    if (type === "overworld")
      setCollapsedOverworlds((prev) => ({ ...prev, [key]: !prev[key] }));
    if (type === "area") setCollapsedAreas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFound = (itemName) => {
    setFoundItems((prev) => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const toggleCategoryCollapse = (catTitle, key) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catTitle]: prev[catTitle].map((val, i) =>
        i === key ? false : val
      ),
    }));
  };

  const collapseAllCategories = () => {
    const allCollapsed = {};
    categoryGroups.forEach((g) => {
      allCollapsed[g.title] = new Array(g.items.length).fill(true);
    });
    setCollapsedCategories(allCollapsed);
  };

  const allSelectedItems = Object.values(selectedItems).flatMap((char) =>
    Object.values(char).filter(Boolean)
  );

  const groupedItems = allSelectedItems.reduce((acc, itemName) => {
    const item = items.find((i) => i.Item === itemName);
    if (!item) return acc;

    const act = item.Act || "Unknown";
    const overworld = item.Overworld || "Unknown";
    const area = item.Area || "Unknown";
    const location = item.Location || "";

    if (!acc[act]) acc[act] = {};
    if (!acc[act][overworld]) acc[act][overworld] = {};
    if (!acc[act][overworld][area]) acc[act][overworld][area] = [];

    acc[act][overworld][area].push({ ...item, location });
    return acc;
  }, {});

  const allFound = (items) => items.every((i) => foundItems[i.Item]);

  const displayCategoryName = (category) => {
    if (category === "Melee 2") return "Off-Hand";
    if (category === "Ring 2") return "Ring 2";
    return category;
  };

  const alreadySelectedItems = Object.values(selectedItems)
    .flatMap(Object.values)
    .filter(Boolean);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-center text-indigo-400">
        Xuon's BG3 Items Tool
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {["char1", "char2", "char3", "char4"].map((charKey, index) => (
          <div key={charKey} className="flex flex-col gap-2">
            {/* Character Name */}
            <input
              type="text"
              value={characterNames[charKey]}
              onChange={(e) =>
                setCharacterNames((prev) => ({ ...prev, [charKey]: e.target.value }))
              }
              className="text-indigo-400 font-bold text-lg w-full bg-gray-800 border border-gray-600 rounded p-1 mb-1 text-center"
            />

            {/* Inventory Grid with placeholder */}
            <InventoryGridWithIcons
              charKey={charKey}
              selectedItems={selectedItems}
              foundItems={foundItems}
            />

            {/* Found progress */}
            <span className="text-green-400 text-sm mb-1">
              {Object.values(selectedItems[charKey] || {}).filter(Boolean).length === 0
                ? "0 / 0 items found"
                : Object.values(selectedItems[charKey])
                    .filter(Boolean)
                    .filter((i) => foundItems[i])
                    .length +
                  " / " +
                  Object.values(selectedItems[charKey]).filter(Boolean).length +
                  " items found"}
            </span>

            {/* Collapse all button */}
            <button
              className="mb-2 px-2 py-1 bg-indigo-600 rounded hover:bg-indigo-700 text-sm"
              onClick={collapseAllCategories}
            >
              Collapse All Categories
            </button>

            {/* Categories */}
            {categoryGroups.map((group, catIndex) => (
              <div key={group.title} className="mb-2">
                <h3
                  className="font-semibold flex items-center cursor-pointer text-indigo-300 mb-1"
                  onClick={() => toggleCategoryCollapse(group.title, index)}
                >
                  {collapsedCategories[group.title[catIndex]] ? (
                    <ChevronRight className="mr-2" size={16} />
                  ) : (
                    <ChevronDown className="mr-2" size={16} />
                  )}
                  {group.title}
                </h3>

                {!collapsedCategories[group.title[catIndex]] && (
                  <div className="flex flex-col gap-2">
                    {group.cats.map((category) => (
                      <CategorySelector
                        key={`${charKey}-${category}`}
                        charKey={charKey}
                        category={category}
                        items={items}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        searchTerms={searchTerms}
                        setSearchTerms={setSearchTerms}
                        removeItem={removeItem}
                        toggleFound={toggleFound}
                        foundItems={foundItems}
                        alreadySelectedItems={alreadySelectedItems}
                        displayCategoryName={displayCategoryName}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Selected item locations */}
      <h2 className="text-2xl font-semibold mb-4">Selected Item Locations</h2>
      {allSelectedItems.length === 0 && (
        <p className="text-gray-400">No items selected.</p>
      )}

      {Object.entries(groupedItems).map(([act, overworlds], actIdx) => {
        const actAllItems = Object.values(overworlds).flatMap((areas) =>
          Object.values(areas).flat()
        );
        return (
          <div
            key={act}
            className={`mb-6 p-4 rounded-lg shadow ${actColors[actIdx % actColors.length]}`}
          >
            <h3
              className={`font-bold text-lg mb-3 flex items-center cursor-pointer text-indigo-300 ${
                allFound(actAllItems) ? "line-through opacity-50" : ""
              }`}
              onClick={() => toggleCollapse(act, "act")}
            >
              {collapsedActs[act] ? (
                <ChevronRight className="mr-2" size={18} />
              ) : (
                <ChevronDown className="mr-2" size={18} />
              )}
              Act {act}
            </h3>
            {!collapsedActs[act] &&
              Object.entries(overworlds).map(([overworld, areas]) => {
                const overworldAllItems = Object.values(areas).flat();
                return (
                  <div key={overworld} className="ml-4 mb-3">
                    <h4
                      className={`font-semibold mb-2 flex items-center cursor-pointer text-indigo-200 ${
                        allFound(overworldAllItems) ? "line-through opacity-50" : ""
                      }`}
                      onClick={() =>
                        toggleCollapse(`${act}-${overworld}`, "overworld")
                      }
                    >
                      {collapsedOverworlds[`${act}-${overworld}`] ? (
                        <ChevronRight className="mr-2" size={16} />
                      ) : (
                        <ChevronDown className="mr-2" size={16} />
                      )}
                      {overworld}
                    </h4>
                    {!collapsedOverworlds[`${act}-${overworld}`] &&
                      Object.entries(areas).map(([area, items]) => (
                        <div key={area} className="ml-6 mb-2">
                          <h5
                            className={`font-medium mb-1 flex items-center cursor-pointer text-indigo-100 ${
                              allFound(items) ? "line-through opacity-50" : ""
                            }`}
                            onClick={() =>
                              toggleCollapse(`${act}-${overworld}-${area}`, "area")
                            }
                          >
                            {collapsedAreas[`${act}-${overworld}-${area}`] ? (
                              <ChevronRight className="mr-2" size={14} />
                            ) : (
                              <ChevronDown className="mr-2" size={14} />
                            )}
                            {area}
                          </h5>
                          {!collapsedAreas[`${act}-${overworld}-${area}`] && (
                            <ul className="ml-6 space-y-1 text-gray-300">
                              {items.map((item, i) => (
                                <li
                                  key={i}
                                  className={`flex items-center justify-between p-1 rounded ${
                                    foundItems[item.Item]
                                      ? "line-through opacity-50 bg-indigo-900"
                                      : ""
                                  }`}
                                >
                                  <button
                                    className="mr-2"
                                    onClick={() => toggleFound(item.Item)}
                                  >
                                    {foundItems[item.Item] ? (
                                      <CheckCircle
                                        className="text-indigo-400"
                                        size={18}
                                      />
                                    ) : (
                                      <Circle
                                        className="text-gray-400 hover:text-indigo-300"
                                        size={18}
                                      />
                                    )}
                                  </button>
                                  <span className="flex-1">
                                    <span className="font-medium text-indigo-400">
                                      {item.Item}
                                    </span>
                                    {item.location && ` - ${item.location}`}
                                    {item["Story Requirements"] &&
                                      ` (${item["Story Requirements"]})`}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}

function CategorySelector({
  charKey,
  category,
  items,
  selectedItems,
  setSelectedItems,
  searchTerms,
  setSearchTerms,
  removeItem,
  toggleFound,
  foundItems,
  alreadySelectedItems,
  displayCategoryName,
}) {
  const search = searchTerms[`${charKey}-${category}`] || "";
  const selectedForCategory = selectedItems[charKey][category];

  const filteredItems = search
    ? items.filter((i) => {
        const realCat =
          category === "Melee 2"
            ? "Melee"
            : category === "Ring 2"
            ? "Ring"
            : category;
        return (
          i["Item Type"] === realCat &&
          i.Item.toLowerCase().includes(search.toLowerCase()) &&
          !alreadySelectedItems.includes(i.Item)
        );
      })
    : [];

  const handleRemove = () => removeItem(charKey, category);

  return (
    <div
      className={`p-2 rounded border border-gray-600 shadow-sm hover:shadow-md transition-all duration-150 bg-gray-800 ${
        selectedForCategory && foundItems[selectedForCategory]
          ? "bg-green-900"
          : ""
      }`}
    >
      <h4 className="text-indigo-300 font-medium mb-1">
        {displayCategoryName(category)}
      </h4>
      {!selectedForCategory ? (
        <>
          <input
            type="text"
            value={search}
            placeholder="Search..."
            onChange={(e) =>
              setSearchTerms((prev) => ({
                ...prev,
                [`${charKey}-${category}`]: e.target.value,
              }))
            }
            className="w-full p-1 mb-1 rounded border border-gray-600 bg-gray-700 text-gray-100 text-sm"
          />
          {search && (
            <div className="max-h-28 overflow-y-auto border rounded-lg p-1 bg-gray-700 text-sm">
              {filteredItems.length ? (
                filteredItems.map((i) => (
                  <div
                    key={i.Item}
                    className={`p-1 rounded cursor-pointer ${
                      foundItems[i.Item] ? "bg-green-900" : "hover:bg-indigo-900"
                    }`}
                    onClick={() => {
                      setSelectedItems((prev) => ({
                        ...prev,
                        [charKey]: { ...prev[charKey], [category]: i.Item },
                      }));
                      setSearchTerms((prev) => ({
                        ...prev,
                        [`${charKey}-${category}`]: "",
                      }));
                    }}
                  >
                    <button
                      className="mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFound(i.Item);
                      }}
                    >
                      {foundItems[i.Item] ? (
                        <CheckCircle className="text-green-400" size={18} />
                      ) : (
                        <Circle className="text-gray-400 hover:text-green-300" size={18} />
                      )}
                    </button>
                    {i.Item}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No items found.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-between items-center bg-gray-700 p-1 rounded text-sm">
          <span className="flex items-center">
            <button
              className="mr-2"
              onClick={() => toggleFound(selectedForCategory)}
            >
              {foundItems[selectedForCategory] ? (
                <CheckCircle className="text-green-400" size={18} />
              ) : (
                <Circle className="text-gray-400 hover:text-green-300" size={18} />
              )}
            </button>
            {selectedForCategory}
          </span>
          <button onClick={handleRemove} className="text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// BG3-style inventory grid with icons + stickman placeholder
function InventoryGridWithIcons({ charKey, selectedItems, foundItems }) {
  const layout = {
    left: ["Head", "Cloak", "Torso", "Gloves", "Boots"],
    right: ["Neck", "Ring", "Ring 2"],
    bottomLeft: ["Melee", "Melee 2"],
    bottomRight: ["Ranged", "Shield"],
  };

  const renderSlot = (category) => {
    const item = selectedItems[charKey][category];
    const found = item && foundItems[item];
    const iconPath = `/icons/${category}.png`;

    return (
      <div
        key={category}
        className={`w-8 h-8 m-0.5 rounded border border-gray-600 flex items-center justify-center ${
          found ? "bg-green-700" : "bg-gray-700"
        }`}
        title={category}
      >
        <img
          src={iconPath}
          alt={category}
          className="w-5 h-5"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 p-1 rounded shadow-md mt-2">
      <div className="flex flex-row items-center">
        <div className="flex flex-col">{layout.left.map(renderSlot)}</div>
        {/* Stickman placeholder in middle */}
        <div className="w-20 h-26 mx-2 flex items-center justify-center text-gray-500 text-xs font-bold">
        <img src="/icons/Character.png" alt="Character" className="w-14 h-26" />
        </div>
        <div className="flex flex-col">{layout.right.map(renderSlot)}</div>
      </div>
      <div className="flex flex-row mt-1">
        <div className="flex flex-col">{layout.bottomLeft.map(renderSlot)}</div>
        <div className="flex flex-col ml-1">{layout.bottomRight.map(renderSlot)}</div>
      </div>
    </div>
  );
}

export default App;



