let selectedCollection = "";

//! Function to set the selected collection
function setSelectedCollection(collectionName) {
    selectedCollection = collectionName;
    console.log("Selected Collection: ", selectedCollection); //* For debugging
}

//! Function to fetch and display collections
function fetchAndDisplayCollections() {
    //* Fetch collections from the backend
    fetch('http://localhost:3000/get-all-collections')  
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


 

//* Call the function when the page loads
window.onload = fetchAndDisplayCollections;
