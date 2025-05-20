import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import abilitiesData from "./asset/abilities.json"; // Assuming abilities.json is in the same directory
import "./styles/main.scss"; // Assuming you have a CSS file for styling
import fox from "./asset/resource/fox.webp";

// DropdownWithButtons Component
const DropdownWithButtons = ({ abilities, index, moveUp, moveDown, removeElement, setDropdowns, dropdown }) => {
  const [filter, setFilter] = useState(""); // State to manage the filter input

  const filteredAbilities = abilities.filter(
    (a) =>
      a.Category.toLowerCase().includes(filter.toLowerCase()) ||
      a.Emoji.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDropdownChange = (e) => {
    const selectedEmoji = e.target.value; // Extract the selected value from the event
    const ability = abilities.find((a) => a.Emoji === selectedEmoji); // Find the full ability object

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
        value={dropdown.selectedAbility ? dropdown.selectedAbility.Emoji : ""}
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
      {dropdown.selectedAbility && (
        <img
          src={dropdown.selectedAbility.Src}
          alt={dropdown.selectedAbility.Emoji}
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
  const [dropdowns, setDropdowns] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [elements, setElements] = useState([]);
  const [savedRotations, setSavedRotations] = useState([]); // State to store saved rotations
  const [selectedRotation, setSelectedRotation] = useState(null); // State for selected rotation
  const [rotationName, setRotationName] = useState("Untitled Rotation"); // Editable rotation name

  useEffect(() => {
    setAbilities(abilitiesData); // Load abilities data

    // Load saved rotations from localStorage
    const cachedRotations = localStorage.getItem("savedRotations");
    if (cachedRotations) {
      setSavedRotations(JSON.parse(cachedRotations));
    }
  }, []);

  const addElement = () => {
    const newElement = { id: elements.length };
    setElements([...elements, newElement]);
    setDropdowns((prev) => [...prev, { id: newElement.id, selectedAbility: null }]);
  };

  const saveRotation = () => {
    if (!rotationName.trim()) {
      alert("Please provide a valid rotation name before saving.");
      return;
    }
    
    const newRotation = {
      name: rotationName,
      data: dropdowns.map((dropdown) => ({
        id: dropdown.id,
        selectedAbility: dropdown.selectedAbility
          ? { Emoji: dropdown.selectedAbility.Emoji }
          : null,
      })),
    };

    const updatedRotations = [...savedRotations, newRotation];
    setSavedRotations(updatedRotations);

    // Save to localStorage
    localStorage.setItem("savedRotations", JSON.stringify(updatedRotations));

    alert(`Rotation "${rotationName}" saved successfully!`);
  };

  const moveUp = (index) => {
    if (index > 0) {
      const newElements = [...elements];
      [newElements[index - 1], newElements[index]] = [newElements[index], newElements[index - 1]]; // Swap logic
      setElements(newElements);

      const newDropdowns = [...dropdowns];
      [newDropdowns[index - 1], newDropdowns[index]] = [newDropdowns[index], newDropdowns[index - 1]]; // Swap logic
      setDropdowns(newDropdowns);
    }
  };

  const moveDown = (index) => {
    if (index < elements.length - 1) {
      const newElements = [...elements];
      [newElements[index + 1], newElements[index]] = [newElements[index], newElements[index + 1]]; // Swap logic
      setElements(newElements);

      const newDropdowns = [...dropdowns];
      [newDropdowns[index + 1], newDropdowns[index]] = [newDropdowns[index], newDropdowns[index + 1]]; // Swap logic
      setDropdowns(newDropdowns);
    }
  };

  const removeElement = (index) => {
    const newElements = elements.filter((_, i) => i !== index);
    setElements(newElements);

    const newDropdowns = dropdowns.filter((_, i) => i !== index);
    setDropdowns(newDropdowns);
  };
  
  const handleExport = () => {
    const dataToExport = dropdowns.map((dropdown) => ({
      id: dropdown.id,
      selectedAbility: dropdown.selectedAbility
        ? { Emoji: dropdown.selectedAbility.Emoji }
        : null,
    }));

    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${rotationName || "rotation"}.json`;
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
              selectedAbility: ability || null,
            };
          })
        );

        setElements(importedData.map((_, index) => ({ id: index })));
      };
      reader.readAsText(file);
    }
  };

  const handleSwitchRotation = (rotationName) => {
    const rotation = savedRotations.find((r) => r.name === rotationName);
    if (rotation) {
      setDropdowns(
        rotation.data.map((data) => {
          const ability = abilitiesData.find((a) => a.Emoji === data.selectedAbility.Emoji);
          return {
            id: data.id,
            selectedAbility: ability || null,
          };
        })
      );
      setElements(rotation.data.map((_, index) => ({ id: index })));
      setSelectedRotation(rotationName);
      setSelectedRotation(rotationName);
    }
  };

  return (
    <div id="rotation">
      <img src={fox} alt="Fox" className="fox-image" />
      <h1>Welcome to the Rotations App</h1>

      {/* Rotation Name Input */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="rotation-name" style={{ marginRight: "10px" }}>
          Rotation Name:
        </label>
        <input
          id="rotation-name"
          type="text"
          value={rotationName}
          onChange={(e) => setRotationName(e.target.value)}
          placeholder="Enter rotation name"
          style={{ padding: "5px", width: "200px" }}
        />
      </div>

      {/* Save, Export, and Import Buttons */}
      <div>
        <button className="nisbutton" onClick={saveRotation}>
          Save
        </button>
        {/* Dropdown to switch between saved rotations */}
        <select
          className="nisdropdown"
          style={{ marginLeft: "10px" }}
          value={selectedRotation || ""}
          onChange={(e) => handleSwitchRotation(e.target.value)}
        >
          <option value="" disabled>
            Select Saved Rotation
          </option>
          {savedRotations.map((rotation) => (
            <option key={rotation.name} value={rotation.name}>
              {rotation.name}
            </option>
          ))}
        </select>

        <button className="nisbutton" onClick={handleExport}>
          Export
        </button>
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

      {elements.map((element, index) => (
        <DropdownWithButtons
          key={element.id}
          abilities={abilities}
          index={index}
          moveUp={moveUp}
          moveDown={moveDown}
          removeElement={removeElement}
          setDropdowns={setDropdowns}
          dropdown={dropdowns[index]}
        />
      ))}

      <div style={{ marginTop: "10px" }}>
        <button onClick={addElement} className="nisbutton add-button">
          Add New
        </button>
        <button
          onClick={() => {
            setElements([]);
            setDropdowns([]);
          }}
          className="nisbutton clear-button"
          style={{ marginLeft: "10px" }}
        >
          <i className="fas fa-trash" style={{ marginRight: "5px" }}></i> Clear All
        </button>
      </div>
    </div>
  );
};

// Render the App component into the DOM
const rotationDiv = document.getElementById("rotation");
if (rotationDiv) {
  const root = ReactDOM.createRoot(rotationDiv); // Use createRoot for React 18+
  root.render(<App />);
}
