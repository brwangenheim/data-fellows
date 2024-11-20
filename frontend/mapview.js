mapboxgl.accessToken =
  "pk.eyJ1IjoiYnJvb2tlLXdhbmdlbmhlaW0iLCJhIjoiY20zM3Q1eGszMWprczJucHM0cmRydGEyeCJ9.tVQTSP6_MwZLg3I7TafJgw";

const initialCoordinates = [-71.3993195, 41.828409];
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: initialCoordinates,
  zoom: 15,
  minZoom: 12,
});

const bounds = [
  [-71.406, 41.8229], // Southwest coordinates [lng, lat]
  [-71.392639, 41.833918], // Northeast coordinates [lng, lat]
];

// Set the maximum bounds of the map
map.setMaxBounds(bounds);

// Zoom controls
document
  .getElementById("zoom-in")
  .addEventListener("click", () => map.zoomIn());
document
  .getElementById("zoom-out")
  .addEventListener("click", () => map.zoomOut());
document.getElementById("reset-button").addEventListener("click", () => {
  map.setCenter(initialCoordinates);
  map.setZoom(15);
  if (currentPopup) currentPopup.remove();
  if (currentSelectedItem) {
    currentSelectedItem.classList.remove("selected");
  }
});

map.on("zoomend", () => {
  // Get the current zoom level
  const zoomLevel = map.getZoom();

  // If the zoom level is below the minimum zoom level, reset it
  if (zoomLevel < map.getMinZoom()) {
    map.setZoom(map.getMinZoom());
  }
});

let plants = []; // Define plants array

async function loadPlants() {
  try {
    const response = await fetch("http://127.0.0.1:3000/uploads/all");
    const data = await response.json();

    // Group plants by linked IDs or treat them as individual groups
    const groupedPlants = {};

    data.forEach((plant) => {
      let groupKey;

      // If the plant has a linked value, use it to create a group key
      if (plant.linked && plant.linked !== "null" && plant.linked !== "") {
        // Split the linked string and sort it to ensure consistency
        groupKey = [
          plant.upload_id,
          ...plant.linked.split(",").map((id) => parseInt(id.trim())),
        ]
          .sort()
          .join(", ");
      } else {
        // If no link exists, use the plant's upload_id as the groupKey
        groupKey = plant.upload_id.toString();
      }

      // If the group doesn't exist yet, create an empty array
      if (!groupedPlants[groupKey]) {
        groupedPlants[groupKey] = [];
      }

      // Add the plant to the correct group
      groupedPlants[groupKey].push({
        ...plant,
        coordinates: plant.location.split(",").reverse().map(Number), // Parse location into [longitude, latitude]
      });
    });

    // Now groupPlants should correctly contain unique groups of linked plants
    console.log(groupedPlants);

    // Convert the grouped plants object into an array
    plants = Object.values(groupedPlants).map((group) => ({
      species: group[0].species, // Use the species from the first plant
      genus: group[0].genus,
      family: group[0].family,
      order: group[0].order,
      coordinates: group[0].coordinates, // Use the first plant's coordinates
      uploads: group, // Store all grouped uploads for carousel
    }));

    console.log("Loaded plants:", plants);

    // Populate the plant list and add markers based on the fetched plants
    populatePlantList(plants);
    addMarkers(plants);
  } catch (error) {
    console.error("Error loading plant data:", error);
  }
}

loadPlants();

const markers = [];

// Function to check if a plant is within the current map bounds
function isPlantInBounds(plant) {
  const bounds = map.getBounds();
  return (
    bounds.getNorthEast().lat >= plant.coordinates[1] &&
    bounds.getNorthEast().lng >= plant.coordinates[0] &&
    bounds.getSouthWest().lat <= plant.coordinates[1] &&
    bounds.getSouthWest().lng <= plant.coordinates[0]
  );
}

let currentPopup = null; // Store the current popup
let currentSelectedItem = null;

function makePopup(uploads) {
  let currentIndex = 0;

  const popupContent = document.createElement("div");
  const updatePopup = () => {
    const plant = uploads[currentIndex];
    popupContent.innerHTML = `
      <div>
        <h3>${plant.species} (${plant.upload_id})</h3>
        <img src="http://localhost:3000/images/${plant.photo}" alt="${
      plant.species
    }" style="width: 100%; height: auto;" />
        <p><strong>Genus:</strong> ${plant.genus}</p>
        <p><strong>Family:</strong> ${plant.family}</p>
        <p><strong>Order:</strong> ${plant.order}</p>
        <p><strong>Date:</strong> ${new Date(
          plant.date
        ).toLocaleDateString()}</p>
        <p><strong>Uploaded by:</strong> ${plant.user_name}</p>
        ${
          uploads.length > 1
            ? `<button id="prev-slide">←</button><button id="next-slide">→</button>`
            : ""
        }
      </div>
    `;
    // Add navigation functionality
    if (uploads.length > 1) {
      popupContent.querySelector("#prev-slide").onclick = () => {
        currentIndex = (currentIndex - 1 + uploads.length) % uploads.length;
        updatePopup();
      };
      popupContent.querySelector("#next-slide").onclick = () => {
        currentIndex = (currentIndex + 1) % uploads.length;
        updatePopup();
      };
    }
  };

  updatePopup(); // Initialize content

  const popup = new mapboxgl.Popup({ offset: [200, -200] }) // Adjusted offset for better positioning
    .setDOMContent(popupContent);

  return popup;
}

// Function to populate the plant list based on visibility
function populatePlantList(plantsToDisplay) {
  const plantList = document.getElementById("plants");
  plantList.innerHTML = ""; // Clear existing list items

  plantsToDisplay.forEach((group) => {
    const uploadIds = group.uploads.map((p) => p.upload_id).join(", ");

    const listItem = document.createElement("li");
    listItem.className = "plant-item";
    listItem.id = `plant-item-${group.uploads[0].upload_id}`;
    listItem.innerText = `${group.species} (${uploadIds})`;

    // Add click event to zoom to the plant group location on the map
    listItem.addEventListener("click", () => {
      // Center the map on the group's location (using the first plant as the reference)
      map.flyTo({
        center: group.coordinates,
        zoom: 18,
        essential: true,
        speed: 1,
        curve: 1,
        // Once the flyTo is complete, show the popup
        bearing: 0,
        pitch: 0,
      });

      // Remove the previously selected item class
      if (currentSelectedItem) {
        currentSelectedItem.classList.remove("selected");
      }

      // Add the selected class to the clicked item
      listItem.classList.add("selected");
      currentSelectedItem = listItem;

      // Scroll the item into view smoothly
      listItem.scrollIntoView({ behavior: "smooth", block: "center" });

      // Remove the previous popup if it exists
      if (currentPopup) currentPopup.remove();

      // Create and add a new popup
      currentPopup = makePopup(group.uploads);
      currentPopup.setLngLat(group.coordinates).addTo(map); // Ensure the popup is added at the correct coordinates
    });

    plantList.appendChild(listItem);
  });
}

function addMarkers(groupedPlants) {
  markers.forEach((marker) => marker.remove());
  markers.length = 0;

  groupedPlants.forEach((plantGroup) => {
    const marker = new mapboxgl.Marker()
      .setLngLat(plantGroup.coordinates)
      .addTo(map);

    const popup = makePopup(plantGroup.uploads); // Pass the full group here
    marker.setPopup(popup);

    marker.getElement().addEventListener("click", () => {
      map.flyTo({
        center: plantGroup.coordinates,
        zoom: 18,
        essential: true,
        speed: 1,
        curve: 1,
      });
      if (currentPopup) currentPopup.remove();
      currentPopup = popup.addTo(map);

      // Find the corresponding list item by using the first upload_id in the group
      const listItem = document.getElementById(
        `plant-item-${plantGroup.uploads[0].upload_id}` // Adjusted to match the first plant's upload_id
      );

      if (currentSelectedItem) {
        currentSelectedItem.classList.remove("selected");
      }

      // Add the selected class to the clicked list item
      listItem.classList.add("selected");
      currentSelectedItem = listItem;

      // Scroll the selected list item into view
      listItem.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    markers.push(marker);
  });
}

// Function to filter the plant list based on search input
let currentFilteredPlants = [];

// Filter plant list based on search input
function filterPlantList() {
  const query = document.getElementById("search-bar").value.toLowerCase();

  // Filter plants based on the search query
  currentFilteredPlants = plants.filter(
    (plant) =>
      // Check if the upload_id exists in any of the uploads
      plant.uploads.some((upload) => upload.upload_id == Number(query)) ||
      // Check if the species, genus, family, or order includes the query in the first upload's fields
      plant.uploads[0].species.toLowerCase().includes(query) ||
      plant.uploads[0].genus.toLowerCase().includes(query) ||
      plant.uploads[0].family.toLowerCase().includes(query) ||
      plant.uploads[0].order.toLowerCase().includes(query)
  );

  // If no search query, show all plants
  if (query === "") {
    currentFilteredPlants = plants;
  }

  // Update the plant list and markers based on the filtered results
  populatePlantList(currentFilteredPlants);
  addMarkers(currentFilteredPlants);
}

// Add event listener for search input
document
  .getElementById("search-bar")
  .addEventListener("input", filterPlantList);

// Initialize plant list
populatePlantList(plants);
