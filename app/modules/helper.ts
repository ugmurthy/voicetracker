async function imageUrlToBase64(imageUrl) {
    try {
        // Fetch image data from URL
        const response = await fetch(imageUrl);
        // Convert image data to base64 format
        const imageBlob = await response.blob();
        const abuff = await imageBlob.arrayBuffer();
        const imageBase64 = Buffer.from(abuff).toString('base64'); // convert to base64
        // Return base64 string
        return imageBase64;

    } catch (error) {
        console.error('Error converting image URL to base64:', error);
        return null;
    }
}
