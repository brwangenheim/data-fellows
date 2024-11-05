mapboxgl.accessToken =
  "pk.eyJ1IjoiYnJvb2tlLXdhbmdlbmhlaW0iLCJhIjoiY20zMzgxcjg0MWhpbzJqcTJ0YnZ0MjJtNSJ9.twhHK9A_7E35zs6XlVTTeg";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-71.402944, 41.826528],
  zoom: 15,
});

// Fetch plant data from your server or database
fetch("/uploads")
  .then((response) => response.json())
  .then((plants) => {
    plants.forEach((plant) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([plant.longitude, plant.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
          <h3>${plant.name}</h3>
          <p>${plant.species}</p>
          <p>Date: ${plant.date}</p>
        `)
        )
        .addTo(map);
    });
  })
  .catch((error) => console.error("Error fetching plant data:", error));
