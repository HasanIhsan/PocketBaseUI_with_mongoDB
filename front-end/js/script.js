const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
    item.addEventListener('click', function () {
        menuItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});


//* Get all checkboxes and the delete bar elements
const checkboxes = document.querySelectorAll('.record-checkbox');
const deleteBar = document.getElementById('delete-bar');
const selectedCountSpan = document.getElementById('selected-count');
const deleteButton = document.getElementById('delete-button');

//? Function to update the delete bar based on selected checkboxes
function updateDeleteBar() {
    const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
    const numSelected = selectedCheckboxes.length;

    if (numSelected > 0) {
        //? Show the delete bar and update the count
        deleteBar.style.display = 'block';
        selectedCountSpan.textContent = `Selected (${numSelected}) record(s)`;
    } else {
        //? Hide the delete bar if no checkboxes are selected
        deleteBar.style.display = 'none';
    }
}

//* Add event listeners to all checkboxes
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateDeleteBar);
});

//! Optional: Delete button functionality
//TODO: Implment proper delete funcaationlity (with backend when can)
deleteButton.addEventListener('click', function() {
    const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
    
    // For demonstration purposes: just alert the number of selected records
    alert(`Deleting ${selectedCheckboxes.length} selected record(s)`);

    // Uncheck all checkboxes after deletion and update the bar
    selectedCheckboxes.forEach(checkbox => checkbox.checked = false);
    updateDeleteBar(); // Hide the bar after deletion
});