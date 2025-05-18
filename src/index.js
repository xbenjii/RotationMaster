import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import abilitiesData from "./asset/abilities.json"; // Assuming abilities.json is in the same directory
import "./styles/main.scss"; // Assuming you have a CSS file for styling
import fox from "./asset/resource/fox.webp";

// DropdownWithButtons Component
const DropdownWithButtons = ({ abilities, index, moveUp, moveDown, removeElement }) => {
  const [filter, setFilter] = useState(""); // State to manage the filter input
  const [selectedAbility, setSelectedAbility] = useState(null); // State to manage the selected ability]

  const filteredAbilities = abilities.filter(
    (a) =>
      a.Category.toLowerCase().includes(filter.toLowerCase()) ||
      a.Emoji.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDropdownChange = (e) => {
    const selectedEmoji = e.target.value; // Use Emoji instead of Title
    const ability = abilities.find((a) => a.Emoji === selectedEmoji);
    setSelectedAbility(ability);
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
  const [abilities, setAbilities] = useState([]);
  const [elements, setElements] = useState([]);

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

  return (
    <div id="rotation">
      <img src={fox} alt="Fox" className="fox-image" />
      <h1>Welcome to the Rotations App</h1>
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
