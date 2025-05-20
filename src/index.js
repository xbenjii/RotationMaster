import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faPatreon } from "@fortawesome/free-brands-svg-icons";
import abilitiesData from "./asset/abilities.json";
import "./styles/main.scss";
import fox from "./asset/resource/fox.webp";
import * as A1 from "alt1/base";
import "./appconfig.json";
import "./icon.png";

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
  if (window.alt1) {
    const A1 = require("alt1/base");
    try {
      A1.identifyApp("appconfig.json");
    } catch (error) {
      console.error("Failed to initialize Alt1:", error);
    }
  } else {
    const addAppUrl = `alt1://addapp/${new URL("./appconfig.json", document.location.href).href}`;
    document.body.insertAdjacentHTML(
      "beforeend",
      `Alt1 not detected, click <a href='${addAppUrl}'>here</a> to add this app to Alt1`
    );
  }

  const [dropdowns, setDropdowns] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [elements, setElements] = useState([]);
  const [savedRotations, setSavedRotations] = useState([]); // State to store saved rotations
  const [selectedRotation, setSelectedRotation] = useState(null); // State for selected rotation
  const [rotationName, setRotationName] = useState("Untitled Rotation"); // Editable rotation name

  useEffect(() => {
    const abilitiesDataUrl = "http://localhost:3000/abilities.json";

    fetch(abilitiesDataUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          console.log("Fetched abilities:", data);
          setAbilities(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setAbilities([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching abilities.json:", error);
        setAbilities([]);
      });
  }, []);

  useEffect(() => {
    console.log("Updated abilities state:", abilities);
  }, [abilities]); // Log whenever the abilities state changes

  useEffect(() => {
    // Load saved rotations from localStorage
    const cachedRotations = localStorage.getItem("savedRotations");
    if (cachedRotations) {
      setSavedRotations(JSON.parse(cachedRotations));
    }
  }, []);

  useEffect(() => {
    if (window.alt1) {
      try {
        // Ensure Alt1 overlay permission is granted
        if (!alt1.permissionOverlay) {
          alert("Overlay permission is not granted. Please enable overlay permissions in Alt1.");
          return;
        }

        // Get the RuneScape game client dimensions
        const gameWidth = alt1.rsWidth;
        const gameHeight = alt1.rsHeight;

        // Calculate the center position
        const overlayWidth = 300; // Adjust this to match your overlay's width
        const overlayHeight = 100; // Adjust this to match your overlay's height
        const centerX = Math.floor((gameWidth - overlayWidth) / 2);
        const centerY = Math.floor((gameHeight - overlayHeight) / 2);

        // Generate the overlay content as an array of image URLs
        const overlayImages = dropdowns
          .filter((dropdown) => dropdown.selectedAbility)
          .map((dropdown) => dropdown.selectedAbility.Src);

        // Skip overlay update if no valid content
        if (overlayImages.length === 0) {
          console.warn("No abilities selected. Skipping overlay update.");
          return;
        }

        // Clear any existing overlay group
        alt1.overLayClearGroup("rotationOverlay");

        // Render the overlay content
        alt1.overLaySetGroupZIndex('rotationOverlay', 1);
        //alt1.overLaySetGroup("rotationOverlay", overlayImages, {
        //  x: centerX,
        //  y: centerY,
        //  width: overlayWidth,
        //  height: overlayHeight,
        //});
      } catch (error) {
        console.error("Failed to update Alt1 overlay:", error);
      }
    }
  }, [dropdowns]);

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

    // Update selected rotation to the newly saved rotation
    setSelectedRotation(rotationName);

    alert(`Rotation "${rotationName}" saved successfully!`);
  };

  const deleteRotation = () => {
    if (!selectedRotation) {
      alert("Please select a rotation to delete.");
      return;
    }

    const updatedRotations = savedRotations.filter((r) => r.name !== selectedRotation);
    setSavedRotations(updatedRotations);

    // Save updated rotations to localStorage
    localStorage.setItem("savedRotations", JSON.stringify(updatedRotations));

    // Clear the selected rotation and rotation name
    setSelectedRotation(null);
    setRotationName("Untitled Rotation");

    setElements([]);
    setDropdowns([]);

    alert(`Rotation "${selectedRotation}" deleted successfully!`);
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
            const ability = abilities.find((a) => a.Emoji === data.selectedAbility?.Emoji);
            return {
              id: data.id,
              selectedAbility: ability || null,
            };
          })
        );

        setElements(importedData.map((_, index) => ({ id: index })));
      };
      reader.readAsText(file);
      setRotationName(file.name);
    }
  };

  const handleSwitchRotation = (rotationName) => {
    const rotation = savedRotations.find((r) => r.name === rotationName);
    if (rotation) {
      setDropdowns(
        rotation.data.map((data) => {
          const ability = abilities.find((a) => a.Emoji === data.selectedAbility?.Emoji);
          return {
            id: data.id,
            selectedAbility: ability || null,
          };
        })
      );
      setElements(rotation.data.map((_, index) => ({ id: index })));
      setSelectedRotation(rotationName);
      setRotationName(rotationName);
    }
  };

  // Update the overlay whenever dropdowns change
  useEffect(() => {
    const overlay = document.getElementById("overlay");
    if (overlay) {
      const images = dropdowns
        .filter((dropdown) => dropdown.selectedAbility)
        .map(
          (dropdown) =>
            `<img src="${dropdown.selectedAbility.Src}" alt="${dropdown.selectedAbility.Emoji}" class="overlay-image" />`
        )
        .join(" > ");
      overlay.innerHTML = images;
    }
  }, [dropdowns]);

  return (
    <div id="rotation">
      <img src={fox} alt="Fox" className="fox-image" />
      <h1>Welcome to the Rotations Master</h1>

      {/* Rotation Name Input */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="rotation-name" style={{ marginRight: "10px" }}>
          Rotation Name:
        </label>
        <input
          className="nisinput"
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
        <button className="nisbutton" onClick={deleteRotation} title="Delete Selected Rotation">
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
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

      <div id="overlay" className="overlay"></div>
      <div style={{ marginTop: "10px" }}>
        <button onClick={addElement} className="nisbutton add-button">
          Add New
        </button>
        <button
          onClick={() => {
            setElements([]);
            setDropdowns([]);
          }}
          className="nisbutton"
          style={{ marginLeft: "10px" }}
        >
          <FontAwesomeIcon icon={faTrashCan} /> Clear All
        </button>
      </div>

      <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />
      <a
        href="https://patreon.com/IMEllamental?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"
        target="_blank"
        rel="noopener noreferrer"
        className="subtle-link"
      >
        <FontAwesomeIcon icon={faPatreon} /> Support on Patreon
      </a>
    </div>
  );
};

// Render the App component into the DOM
const rotationDiv = document.getElementById("rotation");
if (rotationDiv) {
  const root = ReactDOM.createRoot(rotationDiv); // Use createRoot for React 18+
  root.render(<App />);
};
