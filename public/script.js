const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('dropArea');
const fileList = document.getElementById('fileList');

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}


function displayFiles(files) {
    fileList.innerHTML = ''; // Clear the file list before displaying new files

    files.forEach(fileData => {
        const link = document.createElement('a');
        link.href = `/download/${fileData._id}`;
        link.textContent = fileData.filename;
        link.download = fileData.filename;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        deleteButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this file?')) {
                deleteFile(fileData._id);
            }

            function deleteFile(id) {
                fetch(`/files/${id}`, {
                    method: 'DELETE',
                })
                .then(response => {
                    if (response.ok) {
                        console.log('File deleted successfully');
                        // Remove the deleted file from the UI
                        const deletedFileElement = document.getElementById(id);
                        if (deletedFileElement) {
                            deletedFileElement.remove();
                        }
                    } else {
                        console.error('Failed to delete file');
                    }
                })
                .catch(error => {
                    console.error('Error deleting file:', error);
                });
            }
            
        });

        const listItem = document.createElement('li');
        listItem.appendChild(link);
        listItem.appendChild(deleteButton);

        fileList.appendChild(listItem);
    });
}


function fetchFiles() {
    fetch('/files')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayFiles(data.files);
    })
    .catch(error => {
        console.error('Error fetching files:', error);
    });
}

fetchFiles(); 

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function highlight() {
    dropArea.classList.add('active');
}

function unhighlight() {
    dropArea.classList.remove('active');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    handleFiles(files);
}

function handleFiles(files) {
    for (const file of files) {
        uploadFile(file);
    }
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('File uploaded successfully:', data);
        displayFile(data);
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
}

function displayFile(fileData) {
    const link = document.createElement('a');
    link.href = `/download/${fileData._id}`;
    link.textContent = fileData.filename;
    link.download = fileData.filename;

    const listItem = document.createElement('li');
    listItem.appendChild(link);

    fileList.appendChild(listItem);
}

dropArea.addEventListener('dragenter', highlight, false);
dropArea.addEventListener('dragover', highlight, false);
dropArea.addEventListener('dragleave', unhighlight, false);
dropArea.addEventListener('drop', handleDrop, false);

fileInput.addEventListener('change', function() {
    handleFiles(fileInput.files);
});

// Fetch files and display them
fetch('/')
    .then(response => response.json())
    .then(data => {
        displayFile(data.files);
    })
    .catch(error => {
        console.error('Error fetching files:', error);
    });
   
   
    
    