// alt1 base libs, provides all the commonly used methods for image matching and capture
// also gives your editor info about the window.alt1 api
import * as a1lib from 'alt1';
import * as sauce from './a1sauce';
import abilitiesData from './asset/abilities.json';
import * as htmlToImage from 'html-to-image';

import './index.html';
import './appconfig.json';
import './icon.png';

var currentOverlayPosition = sauce.getSetting('overlayPosition');

function getByID(id: string) {
  return document.getElementById(id);
}

const rotationDiv = getByID('rotation');
const dropdownsContainer = getByID('dropdowns-container');
const overlay = getByID('overlay');

let dropdowns: { id: number; selectedAbility: any }[] = [];
let abilities: any[] = [];
let elements: { id: number }[] = [];
let rotationName = "Untitled Rotation";

//fetch abilities data
const fetchAbilities = async () => {
  try {
    const response = await fetch('./abilities.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    abilities = await response.json();
    console.log("Fetched abilities:", abilities);
  } catch (error) {
    console.error("Error fetching abilities.json:", error);
  }
};

// Add a new dropdown
const addDropdown = () => {
  const id = elements.length;
  elements.push({ id });
  dropdowns.push({ id, selectedAbility: null });
  renderDropdowns();
};

// Render dropdowns
const renderDropdowns = () => {
  if (!dropdownsContainer) return; // Check if dropdownsContainer exists)

  dropdownsContainer.innerHTML = ""; // Clear existing dropdowns

  dropdowns.forEach((dropdown, index) => {
    const container = document.createElement("div");
    container.className = "dropdown-container";

    // Create dropdown
    const select = document.createElement("select");
    select.className = "nisdropdown";
    select.innerHTML = `<option value="">Select an ability</option>`;
    abilities.forEach((ability) => {
      const option = document.createElement("option");
      option.value = ability.Emoji;
      option.textContent = ability.Emoji;
      if (dropdown.selectedAbility && dropdown.selectedAbility.Emoji === ability.Emoji) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      const selectedEmoji = (e.target as HTMLSelectElement).value;
      const ability = abilities.find((a) => a.Emoji === selectedEmoji);
      dropdowns[index].selectedAbility = ability || null;
      updateOverlay();
    });

    container.appendChild(select);

    // Add buttons
    const upButton = document.createElement("button");
    upButton.textContent = "Up";
    upButton.disabled = index === 0;
    upButton.addEventListener("click", () => moveUp(index));
    container.appendChild(upButton);

    const downButton = document.createElement("button");
    downButton.textContent = "Down";
    downButton.disabled = index === dropdowns.length - 1;
    downButton.addEventListener("click", () => moveDown(index));
    container.appendChild(downButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => removeDropdown(index));
    container.appendChild(deleteButton);

    dropdownsContainer.appendChild(container);
  });
};

// Move dropdown up
const moveUp = (index: number) => {
  if (index > 0) {
    [dropdowns[index - 1], dropdowns[index]] = [dropdowns[index], dropdowns[index - 1]];
    renderDropdowns();
  }
};

// Move dropdown down
const moveDown = (index: number) => {
  if (index < dropdowns.length - 1) {
    [dropdowns[index + 1], dropdowns[index]] = [dropdowns[index], dropdowns[index + 1]];
    renderDropdowns();
  }
};

// Remove a dropdown
const removeDropdown = (index: number) => {
  dropdowns.splice(index, 1);
  elements.splice(index, 1);
  renderDropdowns();
};

// Update overlay
const updateOverlay = () => {
  if (overlay) {
    overlay.innerHTML = dropdowns
      .filter((dropdown) => dropdown.selectedAbility)
      .map(
        (dropdown) =>
          `<img src="${dropdown.selectedAbility.Src}" alt="${dropdown.selectedAbility.Emoji}" class="overlay-image" />`
      )
      .join(" > ");
  }
};

let config = {
  appName: 'rotationMaster',
};

//let helperItems = {
//  Output: getByID('output'),
//  settings: getByID('Settings'),
//  RotationMaster: getByID('RotationMaster'),
//  Abilities: <HTMLUListElement>getByID('Abilities'),
//  ToggleOverlayButton: getByID('ToggleOverlayButton'),
//  NameOutput: getByID('NameOutput'),
//};

export async function startRotationMaster() {
  if (!window.alt1) {
    //helperItems.Output?.insertAdjacentHTML(
    //  'beforeend',
    //  `<div>You need to run this page in alt1 to capture the screen</div>`
    //);
    return;
  }
  if (!alt1.permissionPixel) {
    //helperItems.Output?.insertAdjacentHTML(
    //  'beforeend',
    //  `<div><p>Page is not installed as app or capture permission is not enabled</p></div>`
    //);
    return;
  }
  if (!alt1.permissionOverlay) {
    //helperItems.Output?.insertAdjacentHTML(
    //  'beforeend',
    //  `<div><p>Attempted to use Overlay but app overlay permission is not enabled. Please enable "Show Overlay" permission in Alt1 settinsg (wrench icon in corner).</p></div>`
    //);
    return;
  }

  await fetchAbilities();

  renderDropdowns();

  //if (sauce.getSetting('activeOverlay')) {
  //  var abilitiesElement = getByID('Abilities')
  //  if (abilitiesElement != null)
  //    startOverlay(abilitiesElement);
  //} else {
  //  helperItems.RotationMaster?.classList.add('overlay-disabled');
  //}
}

//async function startOverlay(element: HTMLElement) {
//  let overlay = element;
//  let styles = getComputedStyle(overlay);
//  let totalTrackeDItems = sauce.getSetting('totalTrackedItems');
//  let buffsPerRow = sauce.getSetting('buffsPerrow');
//  let refreshRate = parseInt(sauce.getSetting('overlayRefreshRate'), 10);
//  let overlayPosition;
//  await sauce.timeout(1000);
//  while (true) {
//    let uiScale = sauce.getSetting('uiScale');
//    overlayPosition = currentOverlayPosition;
//    try {
//      let dataUrl = await htmlToImage.toCanvas(overlay, {
//        backgroundColor: 'transparent',
//        width: parseInt(styles.minWidth, 10),
//        height:
//          parseInt(styles.minHeight, 10) +
//          Math.floor(totalTrackeDItems / buffsPerRow + 1) *
//          27 *
//          (uiScale / 100),
//        quality: 1,
//        pixelRatio: uiScale / 100 - 0.00999999999999999999,
//        skipAutoScale: true,
//      });

//      if (element == getByID('Abilities')) {
//        let base64 = dataUrl
//          .getContext('2d')
//          ?.getImageData(0, 0, dataUrl.width, dataUrl.height);

//        alt1.overLaySetGroup('region');
//        alt1.overLayFreezeGroup('region');
//        alt1.overLayClearGroup('region');
//        if (base64)
//          alt1.overLayImage(
//            overlayPosition.x,
//            overlayPosition.y,
//            a1lib.encodeImageString(base64),
//            base64.width,
//            refreshRate
//          );

//        alt1.overLayRefreshGroup('region');
//      }
//      else {
//        alt1.overLayClearGroup('region');
//        alt1.overLayRefreshGroup('region');
//      }
//    }
//    catch (e) {
//      console.error(`html-to-image failed to capture`, e);
//    }
//  }
//}

//async function setInactive(element: HTMLElement) {
//  if (!(element.dataset.startedTimer == 'true')) {
//    element.classList.add('inactive');
//    element.classList.remove('active');
//    element.dataset.time = '';
//  } else if (element.dataset.startedFimer == 'false') {
//    element.classList.remove('cooldown');
//    element.dataset.cooldown = '';
//  }
//}

//// loads all images as raw pixel data async, images have to be saved as *.data.png
//// this also takes care of metadata headers in the image that make browser load the image
//// with slightly wrong colors
//// this function is async, so you cant acccess the images instantly but generally takes <20ms
//// use `await imgs.promise` if you want to use the images as soon as they are loaded
//const abilityImages = a1lib.webpackImages(
//  abilitiesData.reduce((acc: { [x: string]: any; }, ability: { Title: any; Src: string; }) => {
//    const key = ability.Title;
//    const value = require(ability.Src.replace('./asset/resource', './asset/data').replace('.webp', '-noborder.data.png'));
//    acc[key] = value;
//    return acc;
//  }, {} as Record<string, any>)
//);

//let updatingOverlayPosition = false;

//function updateLocation(e: any) {
//  let ab = getByID('Abilities');
//  if (!ab) return;
//  sauce.updateSetting('overlayPosition', {
//    x: Math.floor(
//      e.x - (sauce.getSetting('uiScale') / 100) * (ab.offsetWidth / 2)
//    ),
//    y: Math.floor(
//      e.y - (sauce.getSetting('uiScale') / 100) * (ab.offsetHeight / 2)
//    ),
//  });
//  updatingOverlayPosition = false;
//  helperItems.RotationMaster?.classList.toggle(
//    'positioning',
//    updatingOverlayPosition
//  )
//}

//function initSettings() {
//  if (!localStorage[config.appName]) {
//    setDefaultSettings();
//  }
//  loadSettings();
//}

//function deleteLocalStorage() {
//  localStorage.removeItem(config.appName);
//  localStorage.removeItem('Abilities');
//  location.reload();
//}


//function setDefaultSettings() {
//  localStorage.setItem(
//    config.appName,
//    JSON.stringify({
//      activeOverlay: true,
//      overlayPosition: { x: 100, y: 100 },
//      uiScale: 100,
//      updatingOverlayPosition: false,
//      abilitiesPerRow: 10,
//    })
//  )
//}

//function loadSettings() {
//  getByID('Abilities')?.style.setProperty(
//    '--maxcount',
//    sauce.getSetting('buffsPerRow')
//  );
//  getByID('Abilities')?.style.setProperty(
//    '--totalitems',
//    helperItems.Abilities.children.length.toString()
//  );
//  getByID('Abilities')?.style.setProperty(
//    '--scale',
//    sauce.getSetting('uiScale')
//  );

//  const inputElement = settingsObject.UIScale.querySelector('input')
//  if (inputElement && parseInt(inputElement.value, 10) < 100) {
//    helperItems.Abilities.classList.add('scaled');
//  }
//}


const currentVersion = '2.0.0';
//const settingsObject = {
//  settingsHeader: sauce.createHeading(
//    'h2',
//    'Rotation Master - v' + currentVersion
//  ),
//  AbilitiesPerRow: sauce.createNumberSetting(
//    'abilitiesPerRow',
//    'Number of abilities displayed per row',
//    { defaultValue: 10, min: 1, max: 20 }
//  ),
//  Brightness: sauce.createRangeSetting(
//    'brightness',
//    '<u>Light Level</u> Control how dark inactive buffs should be - lower number being darker',
//    { defaultValue: '75', min: 5, max: 100, unit: '%' }
//  ),
//  endGeneral: sauce.createSeperator(),
//  OverlayHeader: sauce.createHeading('h2', 'Overlay'),
//  OverlayActive: sauce.createCheckboxSetting(
//    'activeOverlay',
//    "<u>Enable Overlay</u> When the overlay is toggled off - the app will hide the entire UI unless your mouse is over the app. This is for users who don't mind having a background and want to avoid the delay the overlay has",
//    sauce.getSetting('activeOverlay') ?? false
//  ),
//  OverlaySmallText: sauce.createSmallText(
//    `If the overlay does not show - check the "Show overlay" permission is enabled for this plugin in Alt1's settings or try setting the position using the button below.`
//  ),
//  OverlayPositionButton: sauce.createButton(
//    'Set Overlay Position',
//    setOverlayPosition,
//    { classes: ['nisbutton'] }
//  ),
//  ScaleHeader: sauce.createHeading('h3', 'Scale'),
//  UIScale: sauce.createRangeSetting(
//    'uiScale',
//    'Adjusts the size of the Overlay',
//    {
//      defaultValue: '100',
//      min: 50,
//      max: 200,
//    }
//  ),
//  OverlayRefreshHeader: sauce.createHeading('h3', 'Refresh Rate'),
//  OverlayRefreshRate: sauce.createRangeSetting(
//    'overlayRefreshRate',
//    'The rate that the overlay should refresh - in milliseconds. Requires reloading to take effect.',
//    { defaultValue: '50', min: 20, max: 500, unit: 'ms' }
//  ),
//  endOverlay: sauce.createSeperator(),
//  ResetHeader: sauce.createHeading('h3', 'Reset Config'),
//  ResetText: sauce.createText(
//    `This will reset your configuration and reload the plugin in an attempt to solve any problems caused by missing or bad values`
//  ),
//  resetButton: sauce.createButton('Reset All Settings', deleteLocalStorage, {
//    classes: ['nisbutton'],
//  }),
//};


//async function setOverlayPosition() {
//  a1lib.once('alt1pressed', updateLocation);
//  let oldPosition = sauce.getSetting('overlayPosition');
//  sauce.updateSetting('oldOverlayPosition', oldPosition);
//  updatingOverlayPosition = true;
//  helperItems.RotationMaster?.classList.toggle(
//    'positioning',
//    updatingOverlayPosition
//  );

//  while (updatingOverlayPosition) {
//    alt1.setTooltip('Press Alt+1 to save position');
//    let rm = getByID('RotationMaster');
//    if (!rm) return;
//    sauce.updateSetting('overlayPosition', {
//      x: Math.floor(
//        a1lib.getMousePosition()?.x ?? 100 -
//        (sauce.getSetting('uiScale') / 100) * (rm.offsetWidth / 2)
//      ),
//      y: Math.floor(
//        a1lib.getMousePosition()?.y ?? 100 -
//        (sauce.getSetting('uiScale') / 100) * (rm.offsetHeight / 2)
//      ),
//    });
//    currentOverlayPosition = sauce.getSetting('overlayPosition');
//    alt1.overLayRefreshGroup('group1')
//    await sauce.timeout(200);
//  }
//}

window.onload = function () {
  startRotationMaster();

  //check if we are running inside alt1 by ckecking if alt1 gloabl exists
  if (window.alt1) {
    //tell alt1 about the app
    //this makes alt1 show the add app button when running inside the embedded browser
    //also updates app settings if they are changed
    alt1.identifyAppUrl('./appconfig.json');

    //initSettings();
    //let settings = document.querySelector('#Settings .container');
    //Object.values(settingsObject).forEach((val) => {
    //  settings?.before(val);
    //});

    //  const brightnessInput = settingsObject.Brightness.querySelector('input');
    //  if (brightnessInput)
    //    document.documentElement.style.setProperty(
    //      '--brightness',
    //      parseInt(brightnessInput.value, 10  / 100).toString()
    //    );
    //  const mutationConfig = {
    //    attributes: false,
    //    childList: true,
    //    subtree: false,
    //  };
    //  const callback = (mutationList: any, observer: any) => {
    //    for (const mutation of mutationList) {
    //      const brightnessInput = settingsObject.Brightness.querySelector('input');
    //      if (mutation.type === 'childList' && brightnessInput) {
    //        document.documentElement.style.setProperty(
    //          '--brightness',
    //          (parseInt( brightnessInput.value, 10 ) / 100 ).toString()
    //        );
    //      }
    //    }
    //  };
    //  const observer = new MutationObserver(callback);
    ////  observer.observe(helperItems.Abilities, mutationConfig);
    //} else {
    //  let addappurl = `alt1://addapp/${new URL('./appconfig.json', document.location.href).href
    //    }`;
    //  helperItems.Output?.insertAdjacentHTML(
    //    'beforeend',
    //    `
    //	Alt1 not detected, click <a href='${addappurl}'>here</a> to add this app to Alt1
    //`
    //  );
  }
}