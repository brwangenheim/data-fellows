mapboxgl.accessToken =
  "pk.eyJ1IjoiYnJvb2tlLXdhbmdlbmhlaW0iLCJhIjoiY20zMzgxcjg0MWhpbzJqcTJ0YnZ0MjJtNSJ9.twhHK9A_7E35zs6XlVTTeg";

const initialCoordinates = [-71.402944, 41.826528];

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: initialCoordinates,
  zoom: 15,
  minZoom: 13,
});

const bounds = [
  [-71.4066582, 41.81878], // Southwest coordinates [lng, lat]
  [-71.395, 41.832], // Northeast coordinates [lng, lat]
];

// Set the maximum bounds of the map
map.setMaxBounds(bounds);

// Create a draggable marker
const marker = new mapboxgl.Marker({ draggable: true })
  .setLngLat(initialCoordinates) // Set initial marker position
  .addTo(map);

// Function to update hidden latitude and longitude fields
function updateLatLngFields(lngLat) {
  document.getElementById("latitude").value = lngLat.lat;
  document.getElementById("longitude").value = lngLat.lng;
}

// Update fields initially and on dragend
updateLatLngFields(marker.getLngLat());
marker.on("dragend", () => {
  updateLatLngFields(marker.getLngLat());
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
    const name = document.getElementById("name").value;
    const species = document.getElementById("species").value;
    const date = document.getElementById("date").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const photo = document.getElementById("photo").files[0];

    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", name);
    formData.append("species", species);
    formData.append("date", date);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("photo", photo);

    // Send data to backend
    fetch("/api/upload", {
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

const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "data/images/"); // folder where uplaods get saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid conflicts
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("photo"), uploadController.uploadImage);
