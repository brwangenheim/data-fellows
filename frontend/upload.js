mapboxgl.accessToken =
  "pk.eyJ1IjoiYnJvb2tlLXdhbmdlbmhlaW0iLCJhIjoiY20zMzgxcjg0MWhpbzJqcTJ0YnZ0MjJtNSJ9.twhHK9A_7E35zs6XlVTTeg";

const initialCoordinates = [-71.3993195, 41.828409];

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: initialCoordinates,
  zoom: 15,
  minZoom: 13,
});

const bounds = [
  [-71.406, 41.8229], // Southwest coordinates [lng, lat]
  [-71.392639, 41.833918], // Northeast coordinates [lng, lat]
];

map.on("load", () => {
  // Define the GeoJSON polygon for the bounds
  map.addSource("bounds-area", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [bounds[0][0], bounds[0][1]], // Southwest corner
            [bounds[0][0], bounds[1][1]], // Northwest corner
            [bounds[1][0], bounds[1][1]], // Northeast corner
            [bounds[1][0], bounds[0][1]], // Southeast corner
            [bounds[0][0], bounds[0][1]], // Close the polygon
          ],
        ],
      },
    },
  });

  // Add a fill layer to highlight the bounds
  map.addLayer({
    id: "bounds-highlight",
    type: "fill",
    source: "bounds-area",
    paint: {
      "fill-color": "#007cbf", // Adjust color as needed
      "fill-opacity": 0.1, // Set opacity for transparency
    },
  });

  // Add a border around the bounds area
  map.addLayer({
    id: "bounds-outline",
    type: "line",
    source: "bounds-area",
    paint: {
      "line-color": "#007cbf", // Border color
      "line-width": 2, // Border thickness
    },
  });
});

// Set the maximum bounds of the map
map.setMaxBounds(bounds);

// Create a draggable marker
const marker = new mapboxgl.Marker({ draggable: true })
  .setLngLat(initialCoordinates) // Set initial marker position
  .addTo(map);

const markerBounds = new mapboxgl.LngLatBounds(
  [bounds[0][0], bounds[0][1]], // Southwest corner
  [bounds[1][0], bounds[1][1]] // Northeast corner
);

// Function to update hidden latitude and longitude fields
function updateLatLngFields(lngLat) {
  document.getElementById("latitude").value = lngLat.lat;
  document.getElementById("longitude").value = lngLat.lng;
}

function constrainMarkerPosition() {
  const markerPosition = marker.getLngLat();

  // Check if the marker is outside the bounds and reset it to the nearest valid position
  if (!markerBounds.contains(markerPosition)) {
    const constrainedPosition = markerBounds.getCenter();
    marker.setLngLat(constrainedPosition);
    map.setCenter(initialCoordinates);
    map.setZoom(15);
  }
}

// Update fields initially and on dragend
updateLatLngFields(marker.getLngLat());
marker.on("dragend", () => {
  updateLatLngFields(marker.getLngLat());
  constrainMarkerPosition();
});

document.getElementById("reset-button").addEventListener("click", () => {
  map.setCenter(initialCoordinates); // Center map on initial coordinates
  map.setZoom(15);
  marker.setLngLat(initialCoordinates);
  updateLatLngFields(marker.getLngLat()); // Ensure hidden fields are updated
});

document.getElementById("zoom-in").addEventListener("click", () => {
  map.zoomIn(); // Zoom in
});

document.getElementById("zoom-out").addEventListener("click", () => {
  map.zoomOut(); // Zoom out
});

// Form submission handler
document
  .getElementById("upload-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Collect form data
    const email = document.getElementById("email").value;
    const user_name = document.getElementById("name").value;
    const species = document.getElementById("species").value;
    const genus = document.getElementById("genus").value;
    const family = document.getElementById("family").value;
    const order = document.getElementById("order").value;
    const date = document.getElementById("date").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const photo = document.getElementById("photo").files[0];

    const formData = new FormData();
    formData.append("email", email);
    formData.append("user_name", user_name);
    formData.append("species", species);
    formData.append("genus", genus);
    formData.append("family", family);
    formData.append("order", order);
    formData.append("date", date);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("photo", photo);
    formData.append("linked", null);

    // Send data to backend
    fetch("http://localhost:3000/uploads", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.upload_id) {
          // Show success message
          document.getElementById("upload-form").style.display = "none";
          document.getElementById("thank-you-message").style.display = "block";
        } else {
          // Handle errors
          console.error("Error uploading:", data.error);
          alert("Failed to upload. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      });
  });

document.getElementById("return-home").addEventListener("click", () => {
  // Redirect to home (you can change the URL as needed)
  window.location.href = "index.html"; // Replace with your home URL
});

document.getElementById("upload-another").addEventListener("click", () => {
  // Show the form again and hide the thank-you message
  document.getElementById("upload-form").style.display = "block";
  document.getElementById("thank-you-message").style.display = "none";

  // Reset the form fields
  document.getElementById("upload-form").reset();
  // Reset hidden fields
  updateLatLngFields(marker.getLngLat()); // Reset hidden latitude and longitude
});
