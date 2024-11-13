mapboxgl.accessToken =
  "pk.eyJ1IjoiYnJvb2tlLXdhbmdlbmhlaW0iLCJhIjoiY20zM3Q1eGszMWprczJucHM0cmRydGEyeCJ9.tVQTSP6_MwZLg3I7TafJgw";

const initialCoordinates = [-71.402944, 41.826528];
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: initialCoordinates,
  zoom: 15,
  minZoom: 12,
});

const bounds = [
  [-71.407, 41.824], // Southwest coordinates [lng, lat]
  [-71.396, 41.8315], // Northeast coordinates [lng, lat]
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
  map.setCenter([-71.402944, 41.826528]);
  map.setZoom(15);
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
    plants = data.map((plant) => ({
      ...plant,
      coordinates: plant.location.split(",").reverse().map(Number), // Parse location into [longitude, latitude]
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

// Function to create a popup for a selected plant
function makePopup(plant) {
  return new mapboxgl.Popup({ offset: [0, -20] }) // Adjusted offset for better positioning
    .setLngLat(plant.coordinates)
    .setHTML(
      `
      <div>
        <h3>${plant.species}</h3>
        <img src="http://localhost:3000/images/${plant.photo}" alt="${plant.species}" style="width: 100%; height: auto;" />
        <p><strong>Genus:</strong> ${plant.genus}</p>
        <p><strong>Family:</strong> ${plant.family}</p>
        <p><strong>Order:</strong> ${plant.order}</p>
        <p><strong>Date:</strong> ${plant.date}</p>
        <p><strong>Uploaded by:</strong> ${plant.user_id}</p>
      </div>
      `
    );
}

// Function to populate the plant list based on visibility
function populatePlantList(plantsToDisplay) {
  const plantList = document.getElementById("plants");
  plantList.innerHTML = ""; // Clear existing list items

  plantsToDisplay.forEach((plant) => {
    const listItem = document.createElement("li");
    listItem.className = "plant-item";
    listItem.innerText = `${plant.species} (${plant.plant_id})`;

    // Add click event to zoom to the plant location on the map
    listItem.addEventListener("click", () => {
      // Center the map on the selected plant
      map.flyTo({
        center: plant.coordinates,
        zoom: 18,
        essential: true,
        speed: 1,
        curve: 1,
      });

      if (currentPopup) currentPopup.remove();
      currentPopup = makePopup(plant).addTo(map);
    });

    plantList.appendChild(listItem);
  });
}

function addMarkers(plantsToShow) {
  markers.forEach((marker) => marker.remove());
  markers.length = 0;
  plantsToShow.forEach((plant) => {
    const marker = new mapboxgl.Marker()
      .setLngLat(plant.coordinates)
      .addTo(map);

    const popup = makePopup(plant);

    marker.setPopup(popup);

    marker.getElement().addEventListener("click", () => {
      map.flyTo({
        center: plant.coordinates,
        zoom: 18,
        essential: true,
        speed: 1.2,
        curve: 1,
      });
      if (currentPopup) currentPopup.remove();
      currentPopup = popup.addTo(map);
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
  currentFilteredPlants = plants.filter((plant) =>
    plant.species.toLowerCase().includes(query)
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
