document
  .getElementById("upload-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Collect form data
    const entry_id = document.getElementById("entry-id").value;
    const reasoning = document.getElementById("reasoning").value;

    const formData = new FormData();
    formData.append("entry_id", entry_id);
    formData.append("reasoning", reasoning);
  });
