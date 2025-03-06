// import * as Tesseract from 'tesseract.js';
// import * as cocoSsd from '@tensorflow-models/coco-ssd';
// import { ReceiptData } from '@/types';

// // Load COCO-SSD model in advance
// let detectionModel: cocoSsd.ObjectDetection | null = null;

// /**
//  * Load the object detection model
//  */
// export async function loadModel() {
//   if (!detectionModel) {
//     detectionModel = await cocoSsd.load({
//       base: 'mobilenet_v2' // Using MobileNet v2 for better accuracy/speed balance
//     });
//   }
//   return detectionModel;
// }

// /**
//  * Preprocess image before detection or OCR
//  */
// async function preprocessImage(imageUrl: string): Promise<HTMLCanvasElement> {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous';
//     img.onload = () => {
//       // Create canvas with normalized dimensions
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
      
//       // Determine optimal sizing (max dimension 1200px to keep reasonable performance)
//       const maxDimension = 1200;
//       let width = img.width;
//       let height = img.height;
      
//       if (width > height && width > maxDimension) {
//         height = Math.floor(height * (maxDimension / width));
//         width = maxDimension;
//       } else if (height > maxDimension) {
//         width = Math.floor(width * (maxDimension / height));
//         height = maxDimension;
//       }
      
//       canvas.width = width;
//       canvas.height = height;
      
//       // Draw and apply slight contrast enhancement
//       ctx?.drawImage(img, 0, 0, width, height);
      
//       // Apply contrast enhancement for better text readability
//       if (ctx) {
//         const imageData = ctx.getImageData(0, 0, width, height);
//         const data = imageData.data;
        
//         for (let i = 0; i < data.length; i += 4) {
//           // Simple contrast adjustment
//           data[i] = data[i] < 120 ? data[i] * 0.9 : Math.min(255, data[i] * 1.1);
//           data[i+1] = data[i+1] < 120 ? data[i+1] * 0.9 : Math.min(255, data[i+1] * 1.1);
//           data[i+2] = data[i+2] < 120 ? data[i+2] * 0.9 : Math.min(255, data[i+2] * 1.1);
//         }
        
//         ctx.putImageData(imageData, 0, 0);
//       }
      
//       resolve(canvas);
//     };
//     img.src = imageUrl;
//   });
// }

// /**
//  * Enhanced receipt detection with multiple strategies
//  */
// export async function detectReceipts(imageUrl: string): Promise<boolean> {
//   try {
//     // Load model
//     const model = await loadModel();
    
//     // Preprocess image
//     const processedImage = await preprocessImage(imageUrl);
    
//     // Detect objects in the image
//     const predictions = await model.detect(processedImage);
    
//     // First strategy: Check for specific objects
//     const objectDetection = predictions.some(prediction => 
//       ['book', 'paper', 'document', 'cell phone'].includes(prediction.class) && 
//       prediction.score > 0.5
//     );
    
//     if (objectDetection) return true;
    
//     // Second strategy: Check for rectangular shapes and text density
//     const textAnalysis = await performTextDensityAnalysis(processedImage);
    
//     return objectDetection || textAnalysis;
//   } catch (error) {
//     console.error('Error detecting receipts:', error);
//     return true; // Default to treating as a receipt on error
//   }
// }

// /**
//  * Analyze text density in the image to determine if it's likely a receipt
//  */
// async function performTextDensityAnalysis(canvas: HTMLCanvasElement): Promise<boolean> {
//   try {
//     // Quick text detection using Tesseract.js
//     const result = await Tesseract.recognize(
//       canvas,
//       'eng',
//       {
//         logger: m => console.log(m)
//       }
//     );
    
//     // Count lines of text and calculate density
//     const textLines = result.data.text.split('\n').filter(line => line.trim().length > 0);
//     const textDensity = textLines.length / (canvas.height / 50); // Approx. line height
    
//     // Check for receipt characteristics
//     const hasNumbers = /\d+\.\d{2}/.test(result.data.text); // Price-like numbers
//     const hasDate = /\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/.test(result.data.text); // Date-like text
    
//     return (textDensity > 0.5 && (hasNumbers || hasDate));
//   } catch (error) {
//     console.error('Error in text density analysis:', error);
//     return false;
//   }
// }

// /**
//  * Enhanced receipt scanning with detailed information extraction
//  */
// export async function scanReceipt(file: File): Promise<ReceiptData> {
//   try {
//     // Create image URL
//     const imageUrl = URL.createObjectURL(file);
    
//     // Preprocess image
//     const processedImage = await preprocessImage(imageUrl);
    
//     // Perform OCR with both Thai and English language support
//     const result = await Tesseract.recognize(
//       processedImage,
//       'tha+eng', // Thai and English
//       {
//         logger: m => console.log(m),
//         tessedit_pageseg_mode: '6', // Assume a single uniform block of text
//       }
//     );
    
//     const text = result.data.text;
    
//     // Extract detailed information
//     const amount = extractAmount(text);
//     const date = extractDate(text);
//     const merchant = extractMerchant(text);
//     const items = extractItems(text);
//     const taxId = extractTaxId(text);
    
//     // Clean up the object URL
//     URL.revokeObjectURL(imageUrl);
    
//     return {
//       amount: amount || 0,
//       date: date || undefined,
//       merchant: merchant || 'Unknown',
//       items: items,
//       taxId: taxId,
//       details: text.substring(0, 500), // Keep more text for debugging
//       confidence: result.data.confidence / 100
//     };
//   } catch (error) {
//     console.error('Error scanning receipt:', error);
//     return {
//       amount: 0,
//       merchant: 'Error',
//       items: [],
//       details: 'Error processing receipt',
//       confidence: 0
//     };
//   }
// }

// /**
//  * Extract price amount from text with enhanced patterns
//  */
// function extractAmount(text: string): number | null {
//   // First try to find amounts near keywords
//   const keywordPatterns = [
//     /(?:total|รวม|ทั้งสิ้น|amount|sum|จ่าย|net|subtotal|ยอดรวม).*?([0-9,]+\.[0-9]{2})/i,
//     /([0-9,]+\.[0-9]{2}).*?(?:total|รวม|ทั้งสิ้น|amount|sum|บาท|thb|baht)/i
//   ];
  
//   for (const pattern of keywordPatterns) {
//     const match = text.match(pattern);
//     if (match && match[1]) {
//       const amountStr = match[1].replace(/,/g, '');
//       const amount = parseFloat(amountStr);
//       if (!isNaN(amount) && amount > 0) {
//         return amount;
//       }
//     }
//   }
  
//   // If we couldn't find an amount with keywords, look for the largest amount
//   const allAmounts = [...text.matchAll(/([0-9,]+\.[0-9]{2})/g)]
//     .map(match => parseFloat(match[1].replace(/,/g, '')))
//     .filter(amount => !isNaN(amount) && amount > 0);
  
//   if (allAmounts.length > 0) {
//     // Sort in descending order and take the largest amount
//     return Math.max(...allAmounts);
//   }
  
//   return null;
// }

// /**
//  * Extract date from text with enhanced patterns
//  */
// function extractDate(text: string): string | null {
//   // Common date patterns in Thailand and other formats
//   const datePatterns = [
//     // DD/MM/YYYY or DD-MM-YYYY
//     /(?:date|วันที่).*?(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
//     // Common date formats without labels
//     /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/,
//     // DD/MM/YY format
//     /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2}(?!\d))/,
//     // YYYY-MM-DD format (ISO)
//     /(\d{4}-\d{2}-\d{2})/,
//     // Thai Buddhist era dates (พ.ศ.)
//     /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}).*?(?:พ\.ศ\.|BE)/i,
//   ];
  
//   for (const pattern of datePatterns) {
//     const match = text.match(pattern);
//     if (match && match[1]) {
//       // Try to validate and format the date
//       try {
//         const parts = match[1].split(/[\/.-]/);
//         if (parts.length === 3) {
//           // If year is 2 digits
//           if (parts[2].length === 2) {
//             const year = parseInt(parts[2]);
//             parts[2] = (year < 50 ? '20' : '19') + parts[2];
//           }
          
//           // Convert Thai Buddhist era (BE) to CE if necessary
//           if (text.includes('พ.ศ.') || text.includes('BE')) {
//             if (parseInt(parts[2]) > 2500) {
//               parts[2] = (parseInt(parts[2]) - 543).toString();
//             }
//           }
          
//           return parts.join('/');
//         }
//         return match[1];
//       } catch (e) {
//         return match[1];
//       }
//     }
//   }
  
//   return null;
// }

// /**
//  * Extract merchant name from receipt text
//  */
// function extractMerchant(text: string): string | null {
//   // Look for company name patterns
//   const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
//   // Try to find header lines that often contain the merchant name
//   const headerCandidates = lines.slice(0, Math.min(5, lines.length));
  
//   // Look for company name indicators
//   for (const line of headerCandidates) {
//     // Skip very short lines
//     if (line.length < 3) continue;
    
//     // Skip lines that are likely to be addresses or contain too many numbers
//     if (line.match(/\d{5}/) || (line.match(/\d/g)?.length || 0) > line.length / 3) continue;
    
//     // Skip lines that look like dates or times
//     if (line.match(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/) || line.match(/\d{1,2}:\d{2}/)) continue;
    
//     return line;
//   }
  
//   // Try to find a line with "company" or "ชื่อร้าน"
//   const companyPattern = /(?:company|ชื่อร้าน|merchant|ร้าน|บริษัท|หจก\.|บจ\.|ห้างหุ้นส่วน).*?([^\d\n]{3,})/i;
//   const companyMatch = text.match(companyPattern);
//   if (companyMatch && companyMatch[1]) {
//     return companyMatch[1].trim();
//   }
  
//   // Return the first non-empty line that's not a date or time as a fallback
//   for (const line of lines) {
//     if (line.length > 5 && !line.match(/\d{1,2}[\/.-]\d{1,2}/) && !line.match(/\d{1,2}:\d{2}/)) {
//       return line;
//     }
//   }
  
//   return null;
// }

// /**
//  * Extract tax ID from receipt text
//  */
// function extractTaxId(text: string): string | null {
//   // Common tax ID patterns in Thailand (13 digits, often separated by dashes)
//   const taxIdPatterns = [
//     /(?:tax id|เลขประจำตัวผู้เสียภาษี|เลขที่ผู้เสียภาษี).*?(\d[\d-]{12,16}\d)/i,
//     /(?:\b\d{1}-\d{4}-\d{5}-\d{2}-\d{1}\b)/,
//     /(?:\b\d{13}\b)(?!-)/,  // Look for standalone 13-digit numbers
//   ];
  
//   for (const pattern of taxIdPatterns) {
//     const match = text.match(pattern);
//     if (match && match[1]) {
//       return match[1].replace(/-/g, '');
//     }
//   }
  
//   return null;
// }

// /**
//  * Extract items and their prices from receipt text
//  */
// function extractItems(text: string): Array<{name: string, price: number}> {
//   const items: Array<{name: string, price: number}> = [];
//   const lines = text.split('\n');
  
//   // Look for patterns that match item descriptions followed by prices
//   const itemPatterns = [
//     /^(.{3,30})\s+(\d+(?:\.\d{2})?)$/,  // Description followed by price
//     /^(.{3,30})\s+(\d+(?:\.\d{2})?)\s*(?:บาท|thb|baht)?$/i,  // With currency
//     /^(.{3,30})\s+\d+\s+(?:x|×)\s+\d+\s+(\d+(?:\.\d{2})?)$/,  // With quantity
//   ];
  
//   for (const line of lines) {
//     if (line.includes('total') || line.includes('รวม') || line.toLowerCase().includes('subtotal')) continue;
    
//     for (const pattern of itemPatterns) {
//       const match = line.match(pattern);
//       if (match && match[1] && match[2]) {
//         const name = match[1].trim();
//         const price = parseFloat(match[2]);
        
//         // Skip if the name is too short or the price is unreasonable
//         if (name.length < 2 || isNaN(price) || price <= 0 || price > 1000000) continue;
        
//         items.push({
//           name,
//           price
//         });
//         break;
//       }
//     }
//   }
  
//   return items;
// }

// /**
//  * Check if an image is oriented correctly or needs rotation
//  */
// export async function checkImageOrientation(file: File): Promise<number> {
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onload = function(e) {
//       const view = new DataView(e.target?.result as ArrayBuffer);
      
//       // Check for EXIF orientation data
//       if (view.getUint16(0, false) !== 0xFFD8) {
//         resolve(0); // Not a JPEG
//         return;
//       }
      
//       const length = view.byteLength;
//       let offset = 2;
      
//       while (offset < length) {
//         const marker = view.getUint16(offset, false);
//         offset += 2;
        
//         if (marker === 0xFFE1) {
//           if (view.getUint32(offset += 2, false) !== 0x45786966) {
//             resolve(0);
//             return;
//           }
          
//           const little = view.getUint16(offset += 6, false) === 0x4949;
//           offset += view.getUint32(offset + 4, little);
//           const tags = view.getUint16(offset, little);
//           offset += 2;
          
//           for (let i = 0; i < tags; i++) {
//             if (view.getUint16(offset + (i * 12), little) === 0x0112) {
//               const orientation = view.getUint16(offset + (i * 12) + 8, little);
//               resolve([0, 0, 0, 180, 0, 0, 90, 0, -90][orientation] || 0);
//               return;
//             }
//           }
//         } else if ((marker & 0xFF00) !== 0xFF00) {
//           break;
//         } else {
//           offset += view.getUint16(offset, false);
//         }
//       }
      
//       resolve(0);
//     };
    
//     reader.readAsArrayBuffer(file);
//   });
// }