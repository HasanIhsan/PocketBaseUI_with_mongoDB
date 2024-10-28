const menuContainer = document.getElementById('collections-menu');

//! Function to add 'active' class and remove from others
function handleMenuItemClick(event) {
    const menuItems = menuContainer.querySelectorAll('.menu-item');

    //* Remove 'active' class from all items
    menuItems.forEach(item => item.classList.remove('active'));

    //* Add 'active' class to clicked item
    event.currentTarget.classList.add('active');
}

//! Add event listeners for the dynamically created menu items
menuContainer.addEventListener('click', (event) => {
    if (event.target.closest('.menu-item')) {
        handleMenuItemClick(event);
    }
});

//* Get all checkboxes and the delete bar elements
const checkboxes = document.querySelectorAll('.record-checkbox');
const deleteBar = document.getElementById('delete-bar');
const selectedCountSpan = document.getElementById('selected-count');
const deleteButton = document.getElementById('delete-button');

//! Function to update the delete bar based on selected checkboxes
function updateDeleteBar() {
    const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
    const numSelected = selectedCheckboxes.length;
    //console.log("method called!");

    const selectedIds = getSelectedIds(); // Get the IDs of selected rows

    if (numSelected > 0) {
        
        console.log(selectedIds);
        
        //console.log("selected checkbox!");
        //? Show the delete bar and update the count
        deleteBar.style.display = 'block'; 
        selectedCountSpan.textContent = `Selected (${numSelected}) record(s)`;
    } else {
        //? Hide the delete bar if no checkboxes are selected
        deleteBar.style.display = 'none';
    }
}

//! Function to get the IDs of selected rows
function getSelectedIds() {
    const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
    const ids = Array.from(selectedCheckboxes).map(checkbox => {
        // Get the parent row's data-id attribute
        return checkbox.closest('tr').getAttribute('data-id');
    });

    return { ids: ids }; // Structure the data as required
}


//! Add event listeners to all checkboxes
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateDeleteBar);
});

 