/**
 * Image Preprocessing Service
 * Enhances image quality before OCR to improve text recognition accuracy
 */

/**
 * Preprocess image to improve OCR accuracy
 * @param {File} imageFile - Image file to preprocess
 * @param {object} options - Preprocessing options
 * @returns {Promise<File>} Preprocessed image file
 */
export const preprocessImage = async (imageFile, options = {}) => {
  const {
    grayscale = true,
    contrast = 1.5,
    brightness = 10,
    sharpen = true,
    denoise = false,
    scale = 2.0 // Upscale for better OCR
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    img.onload = () => {
      try {
        // Scale up the image for better OCR
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw original image at scaled size
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get image data
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Apply preprocessing techniques
        console.log('🎨 Preprocessing image:', imageFile.name);
        
        if (grayscale) {
          console.log('  → Converting to grayscale');
          imageData = convertToGrayscale(imageData);
        }
        
        if (contrast !== 1.0) {
          console.log('  → Adjusting contrast:', contrast);
          imageData = adjustContrast(imageData, contrast);
        }
        
        if (brightness !== 0) {
          console.log('  → Adjusting brightness:', brightness);
          imageData = adjustBrightness(imageData, brightness);
        }
        
        if (sharpen) {
          console.log('  → Sharpening image');
          imageData = sharpenImage(imageData);
        }
        
        if (denoise) {
          console.log('  → Denoising image');
          imageData = denoiseImage(imageData);
        }

        // Apply threshold to make text more distinct
        console.log('  → Applying adaptive threshold');
        imageData = adaptiveThreshold(imageData);

        // Put processed image back
        ctx.putImageData(imageData, 0, 0);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File(
              [blob], 
              `preprocessed_${imageFile.name}`, 
              { type: imageFile.type }
            );
            console.log('✅ Image preprocessing complete');
            resolve(processedFile);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, imageFile.type, 0.95);
      } catch (error) {
        console.error('❌ Preprocessing error:', error);
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Convert image to grayscale
 * Grayscale images work better with OCR
 */
const convertToGrayscale = (imageData) => {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Use luminosity method (better than simple average)
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;     // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
    // Alpha channel (i + 3) remains unchanged
  }
  return imageData;
};

/**
 * Adjust image contrast
 * Higher contrast makes text stand out more
 */
const adjustContrast = (imageData, contrast) => {
  const data = imageData.data;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
  }
  return imageData;
};

/**
 * Adjust image brightness
 * Proper brightness helps with dark or overexposed images
 */
const adjustBrightness = (imageData, brightness) => {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + brightness);
    data[i + 1] = clamp(data[i + 1] + brightness);
    data[i + 2] = clamp(data[i + 2] + brightness);
  }
  return imageData;
};

/**
 * Sharpen image using convolution
 * Sharpening enhances edges and text clarity
 */
const sharpenImage = (imageData) => {
  // Sharpening kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  return applyConvolution(imageData, kernel, 1);
};

/**
 * Denoise image using Gaussian blur
 * Reduces noise while preserving edges
 */
const denoiseImage = (imageData) => {
  // Gaussian blur kernel (3x3)
  const kernel = [
    1, 2, 1,
    2, 4, 2,
    1, 2, 1
  ];
  return applyConvolution(imageData, kernel, 16);
};

/**
 * Apply convolution filter to image
 */
const applyConvolution = (imageData, kernel, divisor = 1) => {
  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);
  const src = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstOff = (y * w + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide;
          const scx = x + cx - halfSide;

          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            const srcOff = (scy * w + scx) * 4;
            const wt = kernel[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
          }
        }
      }

      output[dstOff] = clamp(r / divisor);
      output[dstOff + 1] = clamp(g / divisor);
      output[dstOff + 2] = clamp(b / divisor);
      output[dstOff + 3] = src[dstOff + 3]; // Preserve alpha
    }
  }

  imageData.data.set(output);
  return imageData;
};

/**
 * Apply adaptive thresholding to make text more distinct
 * Better than simple binary threshold
 */
const adaptiveThreshold = (imageData) => {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  
  // Calculate local mean for each pixel
  const blockSize = 15;
  const C = 5; // Constant subtracted from mean
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      
      // Calculate mean of surrounding pixels
      let sum = 0;
      let count = 0;
      
      for (let dy = -blockSize; dy <= blockSize; dy++) {
        for (let dx = -blockSize; dx <= blockSize; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
            const nidx = (ny * w + nx) * 4;
            sum += data[nidx]; // Use red channel (they're all same in grayscale)
            count++;
          }
        }
      }
      
      const mean = sum / count;
      const threshold = mean - C;
      
      // Apply threshold
      const value = data[idx] > threshold ? 255 : 0;
      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
    }
  }
  
  return imageData;
};

/**
 * Clamp value between 0 and 255
 */
const clamp = (value) => {
  return Math.max(0, Math.min(255, Math.round(value)));
};

/**
 * Quick preprocessing for fast results (lighter processing)
 */
export const quickPreprocess = async (imageFile) => {
  return preprocessImage(imageFile, {
    grayscale: true,
    contrast: 1.3,
    brightness: 5,
    sharpen: false,
    denoise: false,
    scale: 1.5
  });
};

/**
 * Heavy preprocessing for difficult images
 */
export const heavyPreprocess = async (imageFile) => {
  return preprocessImage(imageFile, {
    grayscale: true,
    contrast: 1.8,
    brightness: 15,
    sharpen: true,
    denoise: true,
    scale: 2.5
  });
};

/**
 * Auto-detect best preprocessing based on image analysis
 */
export const autoPreprocess = async (imageFile) => {
  // Create a small preview to analyze image quality
  const preview = await createPreview(imageFile);
  const quality = analyzeImageQuality(preview);
  
  console.log('📊 Image quality analysis:', quality);
  
  if (quality.isDark) {
    console.log('  → Using heavy preprocessing (dark image detected)');
    return heavyPreprocess(imageFile);
  } else if (quality.isBlurry) {
    console.log('  → Using heavy preprocessing (blurry image detected)');
    return heavyPreprocess(imageFile);
  } else if (quality.isLowContrast) {
    console.log('  → Using standard preprocessing (low contrast detected)');
    return preprocessImage(imageFile);
  } else {
    console.log('  → Using quick preprocessing (good quality detected)');
    return quickPreprocess(imageFile);
  }
};

/**
 * Create small preview for analysis
 */
const createPreview = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      resolve(ctx.getImageData(0, 0, 100, 100));
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Analyze image quality to determine preprocessing strategy
 */
const analyzeImageQuality = (imageData) => {
  const data = imageData.data;
  let totalBrightness = 0;
  let variance = 0;
  const pixelCount = data.length / 4;

  // Calculate average brightness
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    totalBrightness += brightness;
  }
  
  const avgBrightness = totalBrightness / pixelCount;

  // Calculate variance (measure of contrast)
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    variance += Math.pow(brightness - avgBrightness, 2);
  }
  variance = variance / pixelCount;
  const standardDeviation = Math.sqrt(variance);

  return {
    avgBrightness,
    standardDeviation,
    isDark: avgBrightness < 80,
    isBright: avgBrightness > 180,
    isLowContrast: standardDeviation < 30,
    isHighContrast: standardDeviation > 70,
    isBlurry: standardDeviation < 25 // Low variance often means blur
  };
};

/**
 * Preview preprocessing (for UI preview before OCR)
 */
export const previewPreprocessing = async (imageFile) => {
  const processed = await preprocessImage(imageFile);
  return URL.createObjectURL(processed);
};

