import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import abilitiesData from "./asset/abilities.json"; // Assuming abilities.json is in the same directory
import "./styles/main.scss"; // Assuming you have a CSS file for styling
import fox from "./asset/resource/fox.webp";

// DropdownWithButtons Component
const DropdownWithButtons = ({ abilities, index, moveUp, moveDown, removeElement, setDropdowns }) => {
  const [filter, setFilter] = useState(""); // State to manage the filter input
  const [selectedAbility, setSelectedAbility] = useState(null); // State to manage the selected ability

  const filteredAbilities = abilities.filter(
    (a) =>
      a.Category.toLowerCase().includes(filter.toLowerCase()) ||
      a.Emoji.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDropdownChange = (e) => {
    const selectedEmoji = e.target.value; // Extract the selected value from the event
    const ability = abilities.find((a) => a.Emoji === selectedEmoji); // Find the full ability object
    setSelectedAbility(ability);

    // Update the dropdowns state in the parent component
    setDropdowns((prev) =>
      prev.map((dropdown, i) =>
        i === index
          ? { ...dropdown, selectedAbility: ability } // Update the selected dropdown
          : dropdown // Keep other dropdowns unchanged
      )
    );
  };

  return (
    <div className="dropdown-container">
      {/* Filter input */}
      <input
        type="text"
        placeholder="Search..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="nisinput"
      />
      {/* Dropdown */}
      <select
        className="nisdropdown"
        value={selectedAbility ? selectedAbility.Emoji : ""}
        onChange={handleDropdownChange}
      >
        <option value="">Select an ability</option>
        {filteredAbilities.map((a) => (
          <option key={a.EmojiId} value={a.Emoji}>
            {a.Emoji}
          </option>
        ))}
      </select>

      {/* Display selected ability details */}
      {selectedAbility && (
        <img
          src={selectedAbility.Src}
          alt={selectedAbility.Emoji}
          className="ability-image"
        />
      )}

      {/* Buttons */}
      <div className="button-group">
        <button
          className="nisbutton up-button"
          onClick={() => moveUp(index)}
          disabled={index === 0} // Disable if it's the first element
        >
          <FontAwesomeIcon icon={faChevronUp} />
        </button>
        <button
          className="nisbutton down-button"
          onClick={() => moveDown(index)}
          disabled={index === abilities.length - 1} // Disable if it's the last element
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
        <button
          className="nisbutton delete-button"
          onClick={() => removeElement(index)}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [dropdowns, setDropdowns] = useState([
    { id: 1, selectedAbility: null },
    { id: 2, selectedAbility: null },
  ]); // Example dropdown containers

  const [abilities, setAbilities] = useState([]);
  const [elements, setElements] = useState([]);
  const [showFileNameInput, setShowFileNameInput] = useState(false); // Toggle for file name input
  const [fileName, setFileName] = useState("dropdown-data"); // Default file name

  // Fetch abilities.json data
  useEffect(() => {
    setAbilities(abilitiesData); // Load abilities data
  }, []);

  // Function to add a new DropdownWithButtons
  const addElement = () => {
    setElements([...elements, {id : elements.length}]); // Add a new empty object to the elements array
  };

  const moveUp = (index) => {
    if (index > 0) {
      const newElements = [...elements];
      [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]]; // Swap logic
      setElements(newElements);
    }
  };

  const moveDown = (index) => {
    if (index < elements.length - 1) {
      const newElements = [...elements];
      [newElements[index + 1], newElements[index]] = [newElements[index], newElements[index + 1]]; // Swap logic
      setElements(newElements);
    }
  };

  const removeElement = (index) => {
    const newElements = elements.filter((_, i) => i !== index);
    setElements(newElements);
  };

  const handleExport = () => {
    const dataToExport = dropdowns.map((dropdown) => ({
      id: dropdown.id,
      selectedAbility: dropdown.selectedAbility
        ? { Emoji: dropdown.selectedAbility.Emoji } // Only export the Emoji property
        : null,
    }));

    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "rotations.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const importedData = JSON.parse(e.target.result);

        // Clear current dropdowns and elements
        setDropdowns([]);
        setElements([]);

        // Update the dropdowns state with imported data
        setDropdowns(
          importedData.map((data) => {
            const ability = abilitiesData.find((a) => a.Emoji === data.selectedAbility.Emoji);
            return {
              id: data.id,
              selectedAbility: ability || null, // Ensure the full ability object is set
            };
          })
        );

        // Update the elements array to match the imported dropdowns
        setElements(importedData.map((_, index) => ({ id: index })));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div id="rotation">
      <img src={fox} alt="Fox" className="fox-image" />
      <h1>Welcome to the Rotations App</h1>

      {/* Export and Import Buttons */}
      <div>
        <button className="nisbutton" onClick={handleExport}>Export</button>
        <input
          type="file"
          accept="application/json"
          onChange={handleImport}
          style={{ display: "none" }}
          id="import-file"
        />
        <label htmlFor="import-file">
          <button
            className="nisbutton"
            onClick={() => document.getElementById("import-file").click()}
          >
            Import
          </button>
        </label>
      </div>

      <p>Add your rotation below.</p>
      <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />

      {/* Render all DropdownWithButtons elements */}
      {elements.map((element, index) => (
        <DropdownWithButtons
          key={element.id}
          abilities={abilities}
          index={index}
          moveUp={moveUp}
          moveDown={moveDown}
          removeElement={removeElement}
          setDropdowns={setDropdowns} // Pass setDropdowns as a prop
        />
      ))}

      {/* Button to add a new DropdownWithButtons */}
      <button onClick={addElement} className="nisbutton add-button" style={{ marginTop: "10px" }}>
        Add New
      </button>
    </div>
  );
};

// Render the App component into the DOM
const rotationDiv = document.getElementById("rotation");
if (rotationDiv) {
  const root = ReactDOM.createRoot(rotationDiv); // Use createRoot for React 18+
  root.render(<App />);
}
