'use client';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ReceiptData } from '@/types';

// Load COCO-SSD model in advance
let detectionModel: cocoSsd.ObjectDetection | null = null;

// Initialize TensorFlow.js
tf.setBackend('webgl').then(() => {
  console.log('TensorFlow.js backend:', tf.getBackend());
}).catch(error => {
  console.error('Failed to set WebGL backend:', error);
  // ลองใช้ CPU backend หากไม่สามารถใช้ WebGL ได้
  tf.setBackend('cpu');
});

export async function loadModel() {
  if (!detectionModel) {
    try {
      // ตรวจสอบว่า backend ได้รับการตั้งค่าแล้ว
      if (!tf.getBackend()) {
        console.warn('No backend found, setting to CPU');
        await tf.setBackend('cpu');
      }
      
      console.log('Current TensorFlow.js backend:', tf.getBackend());
      
      detectionModel = await cocoSsd.load({
        base: 'mobilenet_v2' // Using MobileNet v2 for better accuracy/speed balance
      });
      
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }
  return detectionModel;
}

/**
 * Preprocess image before detection or OCR
 */
async function preprocessImage(imageUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Create canvas with normalized dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Determine optimal sizing (max dimension 1200px to keep reasonable performance)
      const maxDimension = 1200;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxDimension) {
        height = Math.floor(height * (maxDimension / width));
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.floor(width * (maxDimension / height));
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw image with enhanced contrast for better text readability
      ctx.drawImage(img, 0, 0, width, height);
      
      // Apply basic image enhancement for better OCR results
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Simple contrast adjustment for better text recognition
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        const newVal = avg < 120 ? avg * 0.8 : Math.min(255, avg * 1.2);
        data[i] = data[i+1] = data[i+2] = newVal;
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * Enhanced receipt detection with multiple strategies
 */
export async function detectReceipts(imageUrl: string): Promise<boolean> {
  try {
    // Load model
    const model = await loadModel();
    
    // Preprocess image
    const processedImage = await preprocessImage(imageUrl);
    
    // Strategy 1: Object detection with COCO-SSD
    const predictions = await model.detect(processedImage);
    
    const objectDetection = predictions.some(prediction => 
      ['book', 'paper', 'document', 'cell phone', 'laptop', 'keyboard'].includes(prediction.class) && 
      prediction.score > 0.4
    );
    
    if (objectDetection) return true;
    
    // Strategy 2: Text density analysis
    const textAnalysis = await performTextDensityAnalysis(processedImage);
    
    // Strategy 3: Pattern recognition for receipt-like structures
    const structureAnalysis = analyzeReceiptStructure(processedImage);
    
    return objectDetection || textAnalysis || structureAnalysis;
  } catch (error) {
    console.error('Error detecting receipts:', error);
    return true; // Default to treating as a receipt on error
  }
}

/**
 * Analyze text density to determine if image likely contains a receipt
 */
async function performTextDensityAnalysis(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    // Dynamically import Tesseract.js only in browser environment
    const Tesseract = await import('tesseract.js');
    
    // Quick text detection using Tesseract.js with fast mode
    const result = await Tesseract.recognize(
      canvas,
      'tha+eng',
      {
        logger: m => console.log(m)
      }
    );
    
    const text = result.data.text;
    
    // Analyze text patterns typical for receipts
    const hasNumbers = (text.match(/\d/g) || []).length > 10; // Contains multiple numbers
    const hasAmountPatterns = /\d+\.\d{2}/.test(text); // Contains price-like patterns
    const lineCount = text.split('\n').filter(line => line.trim().length > 0).length;
    
    // High text density and specific patterns are characteristic of receipts
    return (lineCount > 5 && (hasNumbers || hasAmountPatterns));
  } catch (error) {
    console.error('Error in text density analysis:', error);
    return false;
  }
}

/**
 * Analyze image structure for receipt-like patterns
 */
function analyzeReceiptStructure(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  // Simplified receipt structure analysis
  // Get edge information to detect vertical lines common in receipts
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Simple vertical line detection
  let verticalLineCount = 0;
  const sampleWidth = Math.min(canvas.width, 200); // Sample a portion for efficiency
  // Brightness difference threshold (used in the pixel comparison below)
  const darkThreshold = 100;
  
  for (let x = 0; x < sampleWidth; x++) {
    let consecutiveDarkPixels = 0;
    for (let y = 0; y < canvas.height - 1; y++) {
      const idx = (y * canvas.width + x) * 4;
      const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      
      if (brightness < darkThreshold) { // Dark pixel
        consecutiveDarkPixels++;
        if (consecutiveDarkPixels > canvas.height * 0.3) { // Vertical line spans 30% of height
          verticalLineCount++;
          break;
        }
      } else {
        consecutiveDarkPixels = 0;
      }
    }
  }
  
  return verticalLineCount > 2; // Multiple vertical lines suggest a receipt
}

/**
 * Enhanced receipt scanning with detailed information extraction
 */
export async function scanReceipt(file: File): Promise<ReceiptData> {
  try {
    // Dynamically import Tesseract.js only in browser environment
    const Tesseract = await import('tesseract.js');
    
    // Create image URL
    const imageUrl = URL.createObjectURL(file);
    
    // Preprocess image
    const processedImage = await preprocessImage(imageUrl);
    
    // Perform OCR with both Thai and English language support
    const result = await Tesseract.recognize(
      processedImage,
      'tha+eng', // Thai and English language support
      {
        logger: m => console.log(m),
      }
    );
    
    const text = result.data.text;
    
    // Extract detailed information
    const amount = extractAmount(text);
    const date = extractDate(text);
    const merchant = extractMerchant(text);
    const items = extractItems(text);
    const tax_id = extractTaxId(text);
    
    // Clean up object URL
    URL.revokeObjectURL(imageUrl);
    
    return {
      amount: amount || 0,
      date: date || undefined,
      merchant: merchant || 'Unknown',
      items: items,
      tax_id: tax_id, // แก้ taxId เป็น tax_id
      details: text.substring(0, 300), // Keep more of the receipt text
      confidence: result.data.confidence / 100,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error scanning receipt:', error);
    return {
      amount: 0,
      merchant: 'Error',
      items: [],
      details: 'Error processing receipt',
      confidence: 0
    };
  }
}

/**
 * Extract amount from text with enhanced patterns for Thai receipts
 */
function extractAmount(text: string): number | null {
  const cleanedText = text.replace(/\b8(\d+\.\d{2})\b/g, (match, amount) => {
    // Check if this is likely a baht symbol misinterpreted as 8
    // Only modify if the resulting number makes more sense as a price
    if (parseFloat("8" + amount) > 1000) {  // Arbitrarily high threshold
      return amount;  // Return just the amount without the 8
    }
    return match;  // Keep original if we're not sure
  });
  
  // Array of patterns to try in order of specificity
  const patterns = [
    // Specific keywords followed by amount
    /(?:total|รวมทั้งสิ้น|รวมเงิน|ยอดรวม|ทั้งสิ้น|รวม|จำนวนเงินรวม|จำนวนเงิน|amount|sum|จ่าย|ชำระ|net|subtotal).*?([0-9,]+\.[0-9]{2})/i,
    
    // Amount followed by currency indicators
    /([0-9,]+\.[0-9]{2}).*?(?:total|รวม|บาท|thb|baht)/i,
    
    // Look for "cash" amounts
    /(?:cash|เงินสด).*?([0-9,]+\.[0-9]{2})/i,
    
    // Look for standalone price format with 2 decimal places (fallback)
    /([0-9,]+\.[0-9]{2})/
  ];

  // Try each pattern
  for (const pattern of patterns) {
    const match = cleanedText.match(pattern);
    if (match && match[1]) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  
  // If specific patterns failed, try finding the largest amount in the text
  const allAmounts = [
    ...cleanedText.matchAll(/([0-9,]+\.[0-9]{2})/g),
    ...cleanedText.matchAll(/฿\s*([0-9,]+(?:\.[0-9]{2})?)/g), // Look specifically for ฿ symbol
    ...cleanedText.matchAll(/บาท\s*([0-9,]+(?:\.[0-9]{2})?)/g), // "baht" in Thai
  ]
    .map(match => {
      const amountStr = match[1].replace(/,/g, '');
      return parseFloat(amountStr);
    })
    .filter(amount => !isNaN(amount) && amount > 0);
  
  // Extra check for numbers that start with 8 and are suspiciously large
  const potentialMisreads = [...cleanedText.matchAll(/\b8([0-9]{2,3}(?:\.[0-9]{2})?)\b/g)]
    .map(match => parseFloat(match[1]))
    .filter(amount => !isNaN(amount) && amount > 0);
  
  allAmounts.push(...potentialMisreads);
  
  if (allAmounts.length > 0) {
    // For receipts, we usually want either the largest amount (total)
    // or the most frequent amount (potentially recurring items)
    const amountCount = allAmounts.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    // Sort by frequency first, then by amount size
    const sortedAmounts = Object.entries(amountCount)
      .sort((a, b) => {
        // First by frequency (descending)
        if (b[1] !== a[1]) return b[1] - a[1];
        // Then by amount (descending)
        return parseFloat(b[0]) - parseFloat(a[0]);
      });
    
    return parseFloat(sortedAmounts[0][0]);
  }
  
  return null;
}

/**
 * Extract date from text with enhanced patterns for Thai receipts
 */
function extractDate(text: string): string | null {
  // Common date patterns in Thai receipts
  const patterns = [
    // DD/MM/YYYY or DD-MM-YYYY with keywords
    /(?:date|วันที่|transaction date).*?(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
    
    // YYYY-MM-DD format (ISO)
    /(\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})/,
    
    // DD/MM/YY format
    /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2}(?!\d))/,
    
    // Any date-like pattern as fallback
    /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Try to normalize the date format to YYYY-MM-DD
      try {
        const parts = match[1].split(/[\/.-]/);
        
        // Handle different date formats
        if (parts.length !== 3) continue;
        
        let year = parts[2];
        let month = parts[1];
        let day = parts[0];
        
        // If year appears to be first (YYYY-MM-DD)
        if (parts[0].length === 4) {
          year = parts[0];
          month = parts[1];
          day = parts[2];
        }
        
        // Convert 2-digit year to 4-digit
        if (year.length === 2) {
          // Convert 2-digit year to 4-digit (assume 21st century for 00-49, 20th century for 50-99)
          const yearNum = parseInt(year);
          year = yearNum < 50 ? `20${year}` : `19${year}`;
        }
        
        // Convert Thai Buddhist Era to CE if necessary (BE is 543 years ahead of CE)
        if (text.toLowerCase().includes('พ.ศ.') || text.toLowerCase().includes('be')) {
          if (parseInt(year) > 2500) { // Simple check for BE date
            year = (parseInt(year) - 543).toString();
          }
        }
        
        // Ensure month and day have two digits
        month = month.padStart(2, '0');
        day = day.padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // If conversion fails, return the original matched date
        return match[1];
      }
    }
  }
  
  return null;
}

/**
 * Extract merchant name from receipt text
 */
function extractMerchant(text: string): string | null {
  // Split text into lines for analysis
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Check the first few lines for merchant name (often at the top)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip very short lines or lines with too many digits
    if (line.length < 3 || (line.match(/\d/g)?.length || 0) > line.length * 0.3) continue;
    
    // Skip lines that look like dates or times
    if (line.match(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/) || line.match(/\d{1,2}:\d{2}/)) continue;
    
    // This could be a merchant name
    return line;
  }
  
  // Look for company name indicators
  const companyPatterns = [
    /(?:ชื่อร้าน|ร้าน|บริษัท|หจก\.|บจ\.|ห้างหุ้นส่วนจำกัด|company|merchant|store).*?([^\d\n]{3,})/i,
    /^([A-Za-zก-๙]{3,}(?:\s[A-Za-zก-๙]+){0,3})$/m, // Name-like pattern (3+ chars, up to 4 words)
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Extract tax ID from receipt text
 */
function extractTaxId(text: string): string | undefined {
  // Common tax ID patterns in Thailand (13 digits, often separated by dashes)
  const patterns = [
    /(?:tax id|เลขประจำตัวผู้เสียภาษี|เลขที่ผู้เสียภาษี|เลขทะเบียน).*?(\d[\d-]{12,16}\d)/i,
    /(?:\b\d{1}-\d{4}-\d{5}-\d{2}-\d{1}\b)/, // Thai Tax ID format with dashes
    /(?:\b\d{13}\b)(?!-)/  // Standalone 13-digit number
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && (match[1] || match[0])) {
      // Return the matched group or the entire match if no group
      const taxId = match[1] || match[0];
      return taxId.replace(/-/g, ''); // Remove dashes for consistent format
    }
  }
  
  return undefined;
}

/**
 * Extract items and prices from receipt text
 */
function extractItems(text: string): Array<{name: string, price: number}> {
  const items: Array<{name: string, price: number}> = [];
  const lines = text.split('\n');
  
  // Add special preprocessing for baht symbol and price
  const preprocessedLines = lines.map(line => {
    // Fix common OCR errors with the baht symbol (reading ฿ as 8)
    return line.replace(/\b8(\d+(?:\.\d{2})?)\b/g, '฿$1')
               // Fix price format errors (e.g., extra zeros)
               .replace(/(\d+)000\.00/g, '$1.00')
               .replace(/(\d+)\.000/g, '$1.00');
  });
  
  // Common patterns for item lines in receipts
  const itemPatterns = [
    // Item followed by baht symbol then price (e.g. "สินค้า ฿100.00")
    /^(.{2,30})\s+(?:฿|B)\s*(\d+(?:\.\d{1,2})?)$/,
    
    // Item followed by price then "บาท" (e.g. "สินค้า 100.00 บาท")
    /^(.{2,30})\s+(\d+(?:\.\d{1,2})?)\s*(?:บาท|THB|BAHT)/i,
    
    // Item description followed by quantity and price
    /^(.{2,30})\s+(\d+)(?:\s+x\s+[\d,.]+)?\s+([\d,.]+)$/,
    
    // Item description followed directly by price
    /^(.{2,30})\s+([\d,.]+)$/,
    
    // Item with price and quantity in various formats
    /^(.{2,30})\s+\d+\s*(?:x|ชิ้น|ea\.?)\s*(?:@\s*[\d,.]+)?\s+([\d,.]+)$/i
  ];
  
  // Process each line to find items
  for (let i = 0; i < preprocessedLines.length; i++) {
    const line = preprocessedLines[i].trim();
    
    // Skip empty lines or lines with common header/footer terms
    if (!line || 
        line.match(/(?:subtotal|total|รวม|tax|vat|ภาษี|ทั้งสิ้น|change|เงินทอน|cash|เงินสด)/i)) {
      continue;
    }
    
    // Process the line to find items
    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1].trim();
        
        // Get the last capturing group as the price
        const priceStr = match[match.length - 1].replace(/,/g, '');
        let price = parseFloat(priceStr);
        
        // Additional sanity check for unreasonably large prices
        if (price > 100000) {
          // Try dividing by 1000 to see if that makes more sense
          const correctedPrice = price / 1000;
          if (correctedPrice < 1000) {
            console.log(`Correcting unreasonable price: ${price} -> ${correctedPrice}`);
            price = correctedPrice;
          }
        }
        
        // Validate the match
        if (name.length >= 2 && !isNaN(price) && price > 0 && price < 100000) {
          items.push({ name, price });
          break;
        }
      }
    }
    
    // Special handling for lines that might start with "8" that should be "฿"
    if (!line.match(/฿|บาท|thb|baht/i) && line.match(/\b8\d+(?:\.\d{2})?\b/)) {
      // Try again with the "8" replaced with "฿"
      const fixedLine = line.replace(/\b8(\d+(?:\.\d{2})?)\b/, '฿$1');
      for (const pattern of itemPatterns) {
        const match = fixedLine.match(pattern);
        if (match) {
          const name = match[1].trim();
          // Get the price from the replaced pattern
          const priceStr = match[match.length - 1].replace(/,/g, '');
          const price = parseFloat(priceStr);
          
          // Validate the match
          if (name.length >= 2 && !isNaN(price) && price > 0 && price < 100000) {
            items.push({ name, price });
            break;
          }
        }
      }
    }
  }
  
  return items;
}

/**
 * Check image orientation and determine if rotation is needed
 */
export async function checkImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      if (!e.target?.result) {
        resolve(0);
        return;
      }
      
      try {
        const view = new DataView(e.target.result as ArrayBuffer);
        
        // Check if this is a JPEG (starts with marker 0xFFD8)
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(0); // Not a JPEG
          return;
        }
        
        const length = view.byteLength;
        let offset = 2;
        
        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          
          // EXIF marker is 0xFFE1
          if (marker === 0xFFE1) {
            if (view.getUint32(offset + 2, false) !== 0x45786966) { // "Exif"
              resolve(0);
              return;
            }
            
            // Get EXIF data
            const little = view.getUint16(offset + 8, false) === 0x4949; // II for Intel, MM for Motorola
            offset += 8;
            
            const tags = view.getUint16(offset + 2, little);
            offset += 2;
            
            // Find orientation tag (0x0112)
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                const orientation = view.getUint16(offset + (i * 12) + 8, little);
                
                // Convert orientation to degrees
                switch (orientation) {
                  case 3: // 180 degrees
                    resolve(180);
                    break;
                  case 6: // 90 degrees CW
                    resolve(90);
                    break;
                  case 8: // 270 degrees CW (90 degrees CCW)
                    resolve(-90);
                    break;
                  default: // Normal orientation
                    resolve(0);
                }
                return;
              }
            }
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(0); // Default: no rotation
      } catch (error) {
        console.error('Error checking image orientation:', error);
        resolve(0); // Default: no rotation
      }
    };
    
    reader.onerror = () => resolve(0);
    
    // Read the EXIF data only
    const slice = file.slice(0, 64 * 1024); // First 64KB should contain EXIF
    reader.readAsArrayBuffer(slice);
  });
}