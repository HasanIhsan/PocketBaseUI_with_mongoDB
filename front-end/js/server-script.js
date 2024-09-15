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

    //* Fetch data from the backend for the selected collection
    fetch(`${apiUrl}get-collection-data?collectionName=${collectionName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch collection data');
            }
            return response.json();
        })
        .then(data => {
            //* Log the fetched data (you will implement display later)
            console.log(`Data for collection: ${collectionName}`, data);
        })
        .catch(error => {
            console.error('Error fetching collection data:', error);
    });
}
 

//* Call the function when the page loads
window.onload = fetchAndDisplayCollections;
