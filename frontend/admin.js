let selectedEntryId = null;
let entries = []; // Define entries globally

// this gets us all the entries from the backend, which are then sorted into tables
async function fetchEntries() {
  try {
    const response = await fetch("http://localhost:3000/uploads/all");
    entries = await response.json(); // Assign fetched entries to the global variable
    console.log("Fetched data:", entries);
    updateTable(entries); // Normal table = all entires
    const entriesToCombine = findEntriesToCombine(entries);

    // Combine table = just
    updateCombineTable(entriesToCombine);
  } catch (error) {
    console.error("Error fetching entries:", error);
  }
}

/* MAIN TABLE FUNCTIONS --------------------------------------------------------*/

// this populates the table based on whatever entries are on display --
// normally this is all of them, but if we're searching, it's filtered
function updateTable(entriesToDisplay) {
  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = "";

  entriesToDisplay.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.upload_id}</td>
      <td>${entry.user_name}</td>
      <td>${entry.plant_id}</td>
      <td>${entry.species}</td>
      <td>${entry.genus}</td>
      <td>${entry.family}</td>
      <td>${entry.order}</td>
      <td>${entry.date}</td>
      <td>${entry.linked}</td>
      <td><button onclick="openEditPopup(${entry.upload_id})">Edit</button></td>
      <td><button onclick="deleteEntry(${entry.upload_id})">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// this deletes an entry based on its given upload id
async function deleteEntry(upload_id) {
  const isConfirmed = window.confirm(
    "Are you sure you want to delete this entry?"
  );
  // Confirmation popup before deleting

  if (isConfirmed) {
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/uploads/delete/${upload_id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        entries = entries.filter((entry) => entry.upload_id !== upload_id);
        updateTable(entries);
        console.log(`Entry with upload_id ${upload_id} deleted successfully.`);
      } else {
        console.error("Failed to delete entry.");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  } else {
    console.log("Deletion canceled.");
  }
}

// Filter entries based on search input
function filterList() {
  const query = document.getElementById("search-bar").value.toLowerCase();

  // Filter entries based on the search query
  const filteredList = entries.filter(
    (entry) =>
      entry.user_name.toLowerCase().includes(query) ||
      entry.species.toLowerCase().includes(query) ||
      entry.genus.toLowerCase().includes(query) ||
      entry.family.toLowerCase().includes(query) ||
      entry.order.toLowerCase().includes(query) ||
      entry.upload_id == query ||
      entry.date.includes(query) ||
      entry.plant_id == query
  );

  // Update the table with the filtered list
  updateTable(filteredList);
}
// this is responsible for the editing popup, and sending any edits you make to the backend
function openEditPopup(uploadId) {
  selectedEntryId = uploadId;

  // Find the selected entry
  const entry = entries.find((e) => e.upload_id === uploadId);

  if (!entry) {
    console.error("Entry not found.");
    return;
  }

  // Populate the edit form with entry data
  document.getElementById("edit-name").value = entry.user_name || "";
  document.getElementById("edit-plant").value = entry.plant_id || "";
  document.getElementById("edit-species").value = entry.species || "";
  document.getElementById("edit-genus").value = entry.genus || "";
  document.getElementById("edit-family").value = entry.family || "";
  document.getElementById("edit-order").value = entry.order || "";
  const [latitude, longitude] = entry.location.split(",");
  document.getElementById("edit-latitude").value = latitude.trim() || "";
  document.getElementById("edit-longitude").value = longitude.trim() || "";
  document.getElementById("edit-linked").value = entry.linked || "";

  // Show the popup
  document.getElementById("edit-popup").style.display = "block";
}

async function saveChanges() {
  if (!selectedEntryId) return;

  const updatedData = {
    user_name: document.getElementById("edit-name").value,
    plant_id: document.getElementById("edit-plant").value,
    species: document.getElementById("edit-species").value,
    genus: document.getElementById("edit-genus").value,
    family: document.getElementById("edit-family").value,
    order: document.getElementById("edit-order").value,
    latitude: parseFloat(document.getElementById("edit-latitude").value),
    longitude: parseFloat(document.getElementById("edit-longitude").value),
    linked: document.getElementById("edit-linked").value,
  };

  const response = await fetch(
    `http://127.0.0.1:3000/uploads/update/${selectedEntryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    }
  );

  if (response.ok) {
    const updatedEntry = await response.json();
    console.log("Upload updated successfully:", updatedEntry);

    // Update the entries list locally
    entries = entries.map((entry) =>
      entry.upload_id === selectedEntryId ? { ...entry, ...updatedData } : entry
    );

    // Refresh the table
    updateTable(entries);

    fetchEntries();

    // Hide the popup
    closeEditPopup();
  } else {
    console.error("Failed to update upload.");
  }
}

function closeEditPopup() {
  // Hide the popup and overlay
  document.getElementById("edit-popup").style.display = "none";
  document.getElementById("popup-overlay").style.display = "none";
}

// FLAGGED TABLE FUNCTIONS -----------------------------------------------------

// updates the flagged table
function updateFlaggedTable(flaggedEntries) {
  const flaggedTableBody = document.getElementById("flagged-table-body");
  flaggedTableBody.innerHTML = "";

  flaggedEntries.forEach((entry) => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${entry.upload_id}</td>
        <td>${entry.flagged}</td>
        <td>${entry.user_name}</td>
        <td>${entry.species}</td>
        <td>${entry.genus}</td>
        <td>${entry.family}</td>
        <td>${entry.order}</td>
        <td>${entry.date}</td>
        <td>${entry.linked}</td>
        <td><button onclick="openEditPopup(${entry.upload_id})">Edit</button></td>
        <td><button onclick="discardFlag(${entry.upload_id})">Delete</button></td>
      `;
    flaggedTableBody.appendChild(row);
  });
}

function findFlaggedEntries(entries) {
  const flaggedEntries = entries.filter(
    (entry) => entry.flagged !== null && entry.flagged !== "null"
  );

  updateTable(flaggedEntries);
}

// discardFlag should just set the flag to null`

// SIMILAR TABLE FUNCTIONS -----------------------------------------------------

function updateCombineTable(entriesToCombine) {
  const combineTableBody = document.getElementById("combine-table-body");
  combineTableBody.innerHTML = ""; // Clear previous table content

  entriesToCombine.forEach(([entry1, entry2]) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${entry1.species}</td>
      <td>${entry1.upload_id}</td>
      <td>${entry1.user_name}</td>
      <td>${entry2.upload_id}</td>
      <td>${entry2.user_name}</td>
      <td>
        <button onclick="combineEntries(${entry1.upload_id}, ${entry2.upload_id})">Combine</button>
        <button onclick="dontCombineEntries(${entry1.upload_id}, ${entry2.upload_id})">Discard</button>
      </td>
    `;

    combineTableBody.appendChild(row);
  });
}

function findEntriesToCombine(entries) {
  const entriesToCombine = [];

  // Compare every pair of entries
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      // Only compare entries with the same species
      if (entries[i].species == entries[j].species) {
        const [lat1, lon1] = entries[i].location.split(",").map(Number);
        const [lat2, lon2] = entries[j].location.split(",").map(Number);

        if (
          entries[i].linked.split(",").includes(entries[j].upload_id.toString())
        ) {
          continue; // skips if already linked to each other
        }

        // Calculate the distance between the two entries
        const distance = calculateDistance(lat1, lon1, lat2, lon2);

        if (distance) {
          entriesToCombine.push([entries[i], entries[j]]);
        }
      }
    }
  }

  return entriesToCombine;
}

async function combineEntries(uploadId1, uploadId2) {
  console.log(`Combining entries: ${uploadId1} and ${uploadId2}`);

  try {
    // Fetch the details for both entries (entry 1 and entry 2)
    const response1 = await fetch(`http://127.0.0.1:3000/uploads/${uploadId1}`);
    const entry1 = await response1.json();
    const response2 = await fetch(`http://127.0.0.1:3000/uploads/${uploadId2}`);
    const entry2 = await response2.json();

    // Ensure both entries exist
    if (!entry1 || !entry2) {
      console.error("One or both entries could not be found.");
      return;
    }

    console.log(`Entry 1:`, entry1);
    console.log(`Entry 2:`, entry2);

    // Get the current linked IDs for both entries, if any

    const linked1 = entry1.linked
      ? entry1.linked
          .split(",")
          .filter((id) => id && id !== "null" && id !== null) // Filter out empty and "null"
      : [];

    const linked2 = entry2.linked
      ? entry2.linked
          .split(",")
          .filter((id) => id && id !== "null" && id !== null) // Filter out empty and "null"
      : [];

    const not_linked1 = entry1.not_linked
      ? entry1.linked
          .split(",")
          .filter((id) => id && id !== "null" && id !== null)
      : [];

    const not_linked2 = entry2.not_linked
      ? entry2.linked
          .split(",")
          .filter((id) => id && id !== "null" && id !== null)
      : [];

    // TODO: make this so it's checking all the values in not_linked, not just setting equal
    if (not_linked1.includes(entry2.upload_id)) pass;
    if (not_linked2.includes(entry1.upload_id)) pass;

    // Merge the linked lists and ensure no duplicates or invalid values
    const newLinked = Array.from(
      new Set([
        ...linked1,
        ...linked2,
        uploadId1.toString(),
        uploadId2.toString(),
      ])
    ).filter((id) => id); // Filter out any invalid or empty IDs

    // Remove the own ID from the linked list (don't want to link to itself)
    const updatedLinked1 = newLinked.filter(
      (id) => id !== uploadId1.toString()
    );
    const updatedLinked2 = newLinked.filter(
      (id) => id !== uploadId2.toString()
    );

    const [latitude1, longitude1] = entry1.location.split(",");
    const [latitude2, longitude2] = entry2.location.split(",");

    // Prepare the updated entries with merged linked IDs
    const updatedEntry1 = {
      ...entry1,
      linked: updatedLinked1.join(","),
      latitude: latitude1, // Keep latitude of entry 1
      longitude: longitude1, // Keep longitude of entry 1
    };
    const updatedEntry2 = {
      ...entry2,
      linked: updatedLinked2.join(","),
      latitude: latitude2, // Keep latitude of entry 2
      longitude: longitude2, // Keep longitude of entry 2
    };

    // Update both entries in the database via PUT requests
    const updateResponse1 = await fetch(
      `http://127.0.0.1:3000/uploads/update/${uploadId1}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry1),
      }
    );

    const updateResponse2 = await fetch(
      `http://127.0.0.1:3000/uploads/update/${uploadId2}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry2),
      }
    );

    console.log(`Entry 1 Latitude: ${latitude1}, Longitude: ${longitude1}`);
    console.log(`Entry 2 Latitude: ${latitude2}, Longitude: ${longitude2}`);

    // Ensure all other linked entries get the updated links
    if (updateResponse1.ok && updateResponse2.ok) {
      // If entry 1's linked field was updated, fetch all linked IDs and update them
      for (const linkedId of newLinked) {
        if (
          linkedId === uploadId1.toString() ||
          linkedId === uploadId2.toString()
        ) {
          continue;
        }

        const linkedEntryResponse = await fetch(
          `http://127.0.0.1:3000/uploads/${linkedId}`
        );
        const linkedEntry = await linkedEntryResponse.json();

        // Ensure the entry is not null and the linked field is updated
        if (
          linkedEntry &&
          linkedEntry.linked !== "null" &&
          linkedEntry.linked !== null
        ) {
          const currentLinked = linkedEntry.linked
            ? linkedEntry.linked
                .split(",")
                .filter((id) => id && id !== "null" && id !== null)
            : [];
          const updatedLinked = Array.from(
            new Set([...currentLinked, ...newLinked])
          ).filter((id) => id && id !== linkedId.toString());

          const [latitude3, longitude3] = linkedEntry.location.split(",");

          // Update the linked field of the other linked entries
          const updatedLinkedEntry = {
            ...linkedEntry,
            linked: updatedLinked.join(","),
            latitude: latitude3, // Keep its own latitude
            longitude: longitude3, // Keep its own longitude
          };

          await fetch(`http://127.0.0.1:3000/uploads/update/${linkedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedLinkedEntry),
          });
        }
      }

      console.log("Entries combined and linked successfully!");

      // Re-fetch the entries to update the table and refresh the UI
      await fetchEntries();
    } else {
      console.error("Failed to update one or both entries.");
    }
  } catch (error) {
    console.error("Error combining entries:", error);
  }
}

const round = (value, decimals) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  lat1 = round(lat1, 6);
  lon1 = round(lon1, 6);
  lat2 = round(lat2, 6);
  lon2 = round(lon2, 6);

  const dLat = Math.abs(lat1 - lat2).toFixed(10);
  const dLon = Math.abs(lon1 - lon2).toFixed(10);

  console.log(`Checking distance: dLat = ${dLat}, dLon = ${dLon}`);

  return dLat <= 0.0001 && dLon <= 0.0001;
}

// the discard button for the similar table
async function dontCombineEntries(uploadID1, uploadID2) {
  const upload1 = await fetch(`http://127.0.0.1:3000/uploads/${uploadID1}`);
  const upload2 = await fetch(`http://127.0.0.1:3000/uploads/${uploadID2}`);

  const not_linked1 = {
    ...upload1,
    not_linked: upload2.upload_id,
  };

  await fetch(`http://127.0.0.1:3000/uploads/update/${uploadId1}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(not_linked1),
  });

  const not_linked2 = {
    ...upload2,
    not_linked: upload1.upload_id,
  };

  await fetch(`http://127.0.0.1:3000/uploads/update/${uploadId1}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(not_linked2),
  });
}

document.getElementById("search-bar").addEventListener("input", filterList);

// Fetch and display entries on page load
fetchEntries();
