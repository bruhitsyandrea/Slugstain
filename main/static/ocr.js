function preprocessImage(file, callback) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const maxWidth = 1000;
            const maxHeight = 1000;

            let width = img.width;
            let height = img.height;

            // Adjust image dimensions while maintaining aspect ratio
            if (width > maxWidth || height > maxHeight) {
                const scaleFactor = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * scaleFactor);
                height = Math.round(height * scaleFactor);
            }

            // Set the canvas to the new size
            canvas.width = width;
            canvas.height = height;

            // Draw the resized image on the canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert image to grayscale
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Grayscale conversion
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);

            // Pass the preprocessed image back to the callback
            callback(canvas.toDataURL());
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function extractItemsFromReceipt(text) {
    // Improved regex to capture items and prices more reliably
    const itemPattern = /([a-zA-Z\s]+)\s+(\d+\.\d{2})/g;
    const matches = [];
    let match;

    // Use regex to find item and price pairs
    while ((match = itemPattern.exec(text)) !== null) {
        matches.push({ item: match[1].trim(), price: match[2] });
    }

    return matches;
}

function doOCR() {
    const fileInput = document.getElementById('imageInput').files[0];
    const result = document.getElementById('result');
    const loadingMessage = document.getElementById('loading');

    // Clear previous results and show the loading message
    result.textContent = '';
    loadingMessage.textContent = '0% completed...'; // Initialize loading message
    loadingMessage.style.display = 'block';

    // Check if a file is selected
    if (!fileInput) {
        result.textContent = 'Please select an image first!';
        loadingMessage.style.display = 'none';
        return;
    }

    preprocessImage(fileInput, function(preprocessedImage) {
        // Use Tesseract.js to recognize text from the preprocessed image
        Tesseract.recognize(preprocessedImage, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100); // Calculate percentage
                    loadingMessage.textContent = `${progress}% completed...`; // Update loading message
                }
                console.log(m);
            }
        }).then(({ data: { text } }) => {
            console.log('OCR Result:', text);
            result.textContent = text;  // Display the OCR result on the webpage

            const items = extractItemsFromReceipt(text);  // Extract structured items

            // Check if any items were found and display them
            if (items.length > 0) {
                result.innerHTML = `<p>OCR Extracted Items:</p><ul>`;
                items.forEach(item => {
                    result.innerHTML += `<li>${item.item} - $${item.price}</li>`;
                });
                result.innerHTML += `</ul>`;
            } else {
                result.innerHTML = `<p>No items found.</p>`;
            }
        }).catch(err => {
            // Handle any errors during the OCR process
            console.error("OCR Error:", err);
            result.textContent = 'Error during OCR process.';
        }).finally(() => {
            // Hide the loading message after OCR is complete
            loadingMessage.style.display = 'none';
        });
    });
}

// Trigger the OCR process when the user clicks the "Start Scanning" button
document.getElementById('start-btn').onclick = doOCR;


