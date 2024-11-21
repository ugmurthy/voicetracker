export const sleep = (time) =>
    // time in millisecs
    new Promise((resolve) => setTimeout(resolve,time));


export async function uploadFile(file, url) {
        try {
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('file', file, file.name);
    
            // Perform the file upload
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
    
            // Check if the response was successful
            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }
    
            // Return the parsed response
            return await response.json();
            } catch (error) {
                console.error('Upload error:', error);
            }
    
        }
    
    