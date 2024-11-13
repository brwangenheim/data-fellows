// Mock data for the table entries and flagged items
const entries = [
  { id: 1, user: "User A", species: "Species A", date: "2024-11-01" },
  { id: 2, user: "User B", species: "Species B", date: "2024-11-02" },
  // Additional mock entries...
];

const flaggedEntries = [
  {
    id: 3,
    user: "User C",
    species: "Species A",
    date: "2024-11-03",
    note: "Potential duplicate",
  },
  // Additional flagged entries...
];

const duplicates = [
  { id: 4, user: "User D", species: "Species A", date: "2024-11-04" },
  // Additional duplicate entries...
];

// Populate the main table
function populateTable(entries) {
  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = "";
  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${entry.id}</td>
            <td contenteditable="true">${entry.user}</td>
            <td contenteditable="true">${entry.species}</td>
            <td contenteditable="true">${entry.date}</td>
            <td><button class="edit-btn">Edit</button></td>
            <td><button class="delete-btn">Delete</button></td>
        `;
    row
      .querySelector(".delete-btn")
      .addEventListener("click", () => confirmDelete(entry.id));
    tableBody.appendChild(row);
  });
}

// Confirm delete popup
function confirmDelete(id) {
  if (confirm("Are you sure you want to delete this entry?")) {
    deleteEntry(id);
  }
}

// Delete entry from table
function deleteEntry(id) {
  const index = entries.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    entries.splice(index, 1);
    populateTable(entries);
  }
}

// Toggle display of flagged entries
document.getElementById("view-flagged").addEventListener("click", () => {
  const flaggedContainer = document.getElementById("flagged-container");
  flaggedContainer.style.display =
    flaggedContainer.style.display === "none" ? "block" : "none";
});

// Search function
document.getElementById("search-bar").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const filteredEntries = entries.filter(
    (entry) =>
      entry.user.toLowerCase().includes(query) ||
      entry.species.toLowerCase().includes(query) ||
      entry.date.includes(query)
  );
  populateTable(filteredEntries);
});

// Initialize tables
populateTable(entries);
populateFlaggedTable(flaggedEntries);
populateDuplicatesTable(duplicates);
