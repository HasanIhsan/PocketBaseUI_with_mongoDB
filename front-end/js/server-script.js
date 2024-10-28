let selectedCollection = "";
let apiUrl = "http://localhost:3000";

//! Function to set the selected collection
function setSelectedCollection(collectionName) {
    selectedCollection = collectionName;
    console.log("Selected Collection: ", selectedCollection); //* For debugging


    fetchAndDisplaySelectedCollectionData(selectedCollection);
}

//! Function to fetch and display collections
function fetchAndDisplayCollections() {
    //* Fetch collections from the backend
    fetch(`${apiUrl}/get-all-collections`)  
        //* Parse the JSON response
        .then(response => response.json()) 
        .then(collections => {
            const menuContainer = document.getElementById('collections-menu');
            
            //* Clear the existing menu items
            menuContainer.innerHTML = '';  

            //* Iterate over each collection and create menu items dynamically
            collections.forEach(collection => {
                //* Create the div element for each collection
                const collectionDiv = document.createElement('div');
                collectionDiv.className = 'menu-item';
                collectionDiv.id = collection.name; //? Set the collection name as the ID
            
                //* Create the image element
                const imgElement = document.createElement('img');
                imgElement.src = './Assets/images/folder-icon.png'; //? Set your icon path
                imgElement.alt = `${collection.name} Icon`; //? Set alt text dynamically

                //* Create the text node for collection name
                const textNode = document.createTextNode(collection.name); 

                //* Append image and text to the div
                collectionDiv.appendChild(imgElement);
                collectionDiv.appendChild(textNode);

                //* Append the collection div to the menu container
                menuContainer.appendChild(collectionDiv);

                //* Add event listener to the dynamically created menu-item
                collectionDiv.addEventListener('click', function () {
                    //* Set the selected collection
                    setSelectedCollection(collection.name);

                    //* setting the header lable to coorespond with the selected collection
                    const collectionNameHeader = document.getElementById('collection-header-name');
                    collectionNameHeader.innerText = `Collections / ${collection.name}`;
                });
            });
        })
        .catch(error => {
            console.error('Error fetching collections:', error);
    });
}

//! Function to fetch and display the selected collection data
function fetchAndDisplaySelectedCollectionData(collectionName) {
    //* Check if a collectionName is provided
    if (!collectionName) {
        console.error('No collection selected');
        return;
    }

    //* Show the loading div
    document.getElementById('loadingDiv').style.display = 'block';

    //* Fetch data from the backend for the selected collection
    fetch(`${apiUrl}/get-collection-data?collectionName=${collectionName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch collection data');
            }
            return response.json();
        })
        .then(data => {
            //* Log the fetched data (you will implement display later)
            console.log(`Data for collection: ${collectionName}`, data);
            document.getElementById('loadingDiv').style.display = 'none';

            // Now dynamically update the table based on the fetched data
            displayCollectionData(data.data, collectionName);
        })
        .catch(error => {
            document.getElementById('loadingDiv').style.display = 'none';
            console.error('Error fetching collection data:', error);
    });
}

//! Function to display the selected collection data dynamically
function displayCollectionData(documents, collectionName) {
    const table = document.querySelector('.content-table table');
    const tableHead = table.querySelector('thead tr');
    const tableBody = table.querySelector('tbody');
    const collectionDataCount = document.getElementById('total-found');

    //* Clear any existing table headers and rows
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    //* If no documents are available, show a message
    if (documents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="100%">No data available for this collection</td></tr>`;
        collectionDataCount.innerHTML = `Total found: 0`;
        return;
    } else {
        collectionDataCount.innerHTML = `Total found: ${documents.length}`;
    }

    //* Dynamically generate table headers based on the keys of the first document
    const firstDoc = documents[0];
    const keys = Object.keys(firstDoc);

    //* Add the checkbox and dynamic headers to the <thead>
    let headerRowHTML = `<th><input type="checkbox" class="record-checkbox"></th>`;
    keys.forEach(key => {
        headerRowHTML += `<th>${key}</th>`;
    });
    headerRowHTML += `<th><img class="dot-icon" src="./Assets/images/dot-logo.png" alt="Action Menu"></th>`;
    tableHead.innerHTML = headerRowHTML;

    //* Dynamically generate table rows for each document
    documents.forEach(doc => {
        let rowHTML = `<tr class="data-row" data-id="${doc._id}"><th><input type="checkbox" class="record-checkbox"></th>`;
        
        keys.forEach(key => {
            const value = doc[key];
            
            //* Check if the key is related to image data (assuming it's stored as a sub-document)
            if (
                typeof value === "object" &&
                value !== null &&
                value.filename &&
                value.contentType &&
                value.data
            ) {
                //* If base64 image data is found, generate an <img> tag
                const imageSrc = `data:${value.contentType};base64,${value.data}`;
                rowHTML += `<td><img src="${imageSrc}" alt="${value.filename}" width="50" height="50"></td>`;
            } else {
                //* Otherwise, show the value or 'N/A' if it's null/undefined
                rowHTML += `<td>${value || "N/A"}</td>`;
            }
        });

        rowHTML += `<td><img src="./Assets/images/arrow-icon.png" alt="Action Menu"></td></tr>`;
        tableBody.innerHTML += rowHTML;
    });

    //* Add click event listeners to all rows to log the _id
    const rows = tableBody.querySelectorAll('.data-row');
    rows.forEach(row => {
        row.addEventListener('click', function(event) {
            // Check if the click target is a checkbox
            if (event.target.classList.contains('record-checkbox')) {
                // Let the checkbox handle its own event (e.g., updating the delete bar)
                return;
            }
            
            // If click is not on a checkbox, open the info panel
            const id = this.getAttribute('data-id');
            updateCollectionData(collectionName, id);
        });
    });
}

//! Function to hide the info panel when clicking outside of it
document.addEventListener('click', function(event) {
    const infoPanel = document.getElementById('info-panel');
    
    //* Check if the click happened outside the info panel
    if (!infoPanel.contains(event.target) && !event.target.closest('tr')) {
        infoPanel.classList.add('hidden');
        infoPanel.style.display = 'none'; //? Explicitly hide the panel
        console.log("hidden");
    }
});

//! Function to Update the Selected Data
function updateCollectionData(collectionName, dataId) {
    console.log(`Clicked row with _id: ${dataId}`);
  

    //* Fectch the document data  
    fetch(`${apiUrl}/get-cdocument-data-by-id?collectionName=${collectionName}&id=${dataId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch document data.');
        }
        return response.json();
    })
    .then(data => { 

        //* Optionally, you can handle displaying this data in the UI
        displayDocumentData(data.data, collectionName, dataId);  //? You can create this function to dynamically update your UI
    })
    .catch(error => {
        console.error('Error fetching document data:', error);
    });
}

//! Function to dynamically create a form based on document data
function displayDocumentData(documentData, collectionName, dataId) {
    const infoPanel = document.getElementById('info-panel');

    //* Clear previous content
    infoPanel.innerHTML = '';

    //* Create a form element
    const form = document.createElement('form');
    form.setAttribute('id', 'dynamic-form');

    //* Iterate over the keys in the data object
    Object.keys(documentData).forEach(key => {
        const value = documentData[key];

        //* Create a form group for each key-value pair
        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group');

        //* Create a label for the form field
        const label = document.createElement('label');
        label.innerText = key;
        formGroup.appendChild(label);

        //* Handle _id field (non-editable)
        if (key === '_id') {
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('value', value);
            input.setAttribute('readonly', true);  //? Make it non-editable
            formGroup.appendChild(input);
           
            //TODO: update the image detection so later it can detect a image without having to look for hardcoded labels (like contentType, or data)
        } else if (typeof value === 'object' && value !== null && value.data && value.contentType) {
            //* If the field is an image, show the image preview
            const img = document.createElement('img');
            img.src = `data:${value.contentType};base64,${value.data}`;
            img.alt = value.filename || 'image';
            img.style.width = '100px';  //? You can adjust the size as needed
            formGroup.appendChild(img);

            //* Create a file input for uploading a new image
            const fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', 'image/*');  //? Only allow image uploads
            fileInput.style.marginLeft = '10px';  //? Add some spacing between the image and file input

            //* Handle file selection
            fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        //* Show a preview of the selected image
                        img.src = reader.result;
                        img.alt = file.name;
                    };
                    reader.readAsDataURL(file);  //? Read the file as base64
                }
            });

            formGroup.appendChild(fileInput);  //? Add the file input to the form group
        } else {
            //* Otherwise, create an input field for editable data
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('name', key);
            input.setAttribute('value', value || '');  //? Show 'N/A' if the value is null/undefined
            formGroup.appendChild(input);
        }

        //* Append the form group to the form
        form.appendChild(formGroup);
    });

    //* Add submit button (if needed)
    /// note: did need this to update infomation
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';
    submitButton.setAttribute('type', 'submit');
    form.appendChild(submitButton);

    //* adding a Submit button event listner
    submitButton.addEventListener('click', function() {
        updateSelectedData(dataId, collectionName )
    })
    //* Add cancel button (optional, to close the form)
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.setAttribute('type', 'button');

    //TODO: FIX THE CANCEL BUTTON IT DOESN'T WORK
    cancelButton.onclick = function () {
        infoPanel.classList.add('hidden');  //? Hide the form
    };
    form.appendChild(cancelButton);

    //* Append the form to the infoPanel
    infoPanel.appendChild(form);

    //* Show the panel
    infoPanel.style.display = 'block';
    infoPanel.classList.remove('hidden');
}

//! Function to update a selected data
//TODO: Fix a Bug where it says its failed to fetch (but updates all data correctly with no errors)
//TODO: NOTE I tried to get images to update.. (that didn't work... so figure out a way so images can also update)
//*     again all i can think of is to first check if there is an image if there is then update that existing image...
function updateSelectedData(dataId, collectionName) {
    //* Get the form element
    const form = document.getElementById('dynamic-form');

    //* Use FormData to collect form inputs and handle file uploads
    const formData = new FormData(form);

    //* Make the PUT request to update the data
    fetch(`${apiUrl}/update-selected-data?collectionName=${collectionName}&id=${dataId}`, {
        method: 'PUT',
        body: formData,  //? FormData is used to support file uploads
    })
    .then(response => {
        //* Check if the response content type is JSON before parsing
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            //* If the response is not JSON, return an empty object or custom message
            return {};
        }
    })
    .then(data => {
        if (data.error) {
            console.error('Error updating document:', data.error);
            alert('Failed to update document: ' + data.error);
        } else {
            alert('Document updated successfully!');
            //? Optionally, you can close the form or refresh the page to show updated data
        }
    })
    .catch(error => {
        console.error('Error during fetch:', error);
        alert('An error occurred: ' + error);
    });
}

//* Call the function when the page loads
window.onload = fetchAndDisplayCollections;
 