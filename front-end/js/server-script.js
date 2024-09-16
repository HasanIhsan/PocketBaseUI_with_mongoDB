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
    }else {
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
        let rowHTML = `<tr><th><input type="checkbox" class="record-checkbox"></th>`;
        keys.forEach(key => {
            const value = doc[key];
            
            //* Check if the key is related to image data (assuming it's stored as a sub-document)
            //? Currently if i was creating database to store images i would use, imagename, contentType, data to save the image
            //? but not everyone does it this way...
            //TODO: Later in the future change this so it isn't looking for specific value types like filename, contentType, data 
            //TODO: Rather it looks to see if image data is there and uses that! (for now this works)
            if (
                typeof value === "object" &&
                value !== null &&
                value.filename &&
                value.contentType &&
                value.data
            ) {
                // If base64 image data is found, generate an <img> tag
                const imageSrc = `data:${value.contentType};base64,${value.data}`;
                rowHTML += `<td><img src="${imageSrc}" alt="${value.filename}" width="50" height="50"></td>`;
            } else {
                // Otherwise, show the value or 'N/A' if it's null/undefined
                rowHTML += `<td>${value || "N/A"}</td>`;
            }

        });
        rowHTML += `<td><img src="./Assets/images/arrow-icon.png" alt="Action Menu"></td></tr>`;
        tableBody.innerHTML += rowHTML;
    });
}

//* Call the function when the page loads
window.onload = fetchAndDisplayCollections;
 