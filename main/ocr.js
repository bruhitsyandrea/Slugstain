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

            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height = Math.round((height *= maxWidth / width));
                    width = maxWidth;
                } else {
                    width = Math.round((width *= maxHeight / height));
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to grayscale
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const binaryValue = avg > 128 ? 255 : 0; // Thresholding for binarization
                data[i] = binaryValue;
                data[i + 1] = binaryValue;
                data[i + 2] = binaryValue;
            }
            ctx.putImageData(imageData, 0, 0);

            callback(canvas.toDataURL());
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function extractItemsFromReceipt(text) {
    const itemPattern = /([a-zA-Z0-9\s]+)\s+(\d+\.\d{2})/g;  // Adjusted pattern for item names and prices
    const weighedItemPattern = /([a-zA-Z0-9\s]+)\s+(\d+\.\d{2})\/lb\s+(\d+\.\d{2})/g; // Pattern for weighed items
    const matches = [];

    let match;
    // Extract regular items
    while ((match = itemPattern.exec(text)) !== null) {
        matches.push({ item: match[1].trim(), price: match[2] });
    }
    // Extract weighed items
    while ((match = weighedItemPattern.exec(text)) !== null) {
        matches.push({ item: match[1].trim(), price: match[3] });
    }

    return matches;
}

function doOCR() {
    const fileInput = document.getElementById('imageInput').files[0];
    const result = document.getElementById('result');
    const loadingMessage = document.getElementById('loading');

    result.textContent = '';
    loadingMessage.style.display = 'block';

    if (!fileInput) {
        result.textContent = 'Please select an image first!';
        loadingMessage.style.display = 'none';
        return;
    }

    preprocessImage(fileInput, function(preprocessedImage) {
        console.log('Preprocessed Image:', preprocessedImage);

        Tesseract.recognize(preprocessedImage, 'eng', {
            logger: m => {
                console.log(m);
                if (m.status === 'recognizing text') {
                    loadingMessage.textContent = `Progress: ${(m.progress * 100).toFixed(2)}%`;
                }
            }
        }).then(({ data: { text } }) => {
            const items = extractItemsFromReceipt(text);
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
            console.error("OCR Error:", err);
            result.textContent = 'Error during OCR process.';
        }).finally(() => {
            loadingMessage.style.display = 'none';
        });
    });
}

document.getElementById('start-btn').onclick = doOCR;
