// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-backend-webgl';
// import * as cocoSsd from '@tensorflow-models/coco-ssd';
// import { ReceiptData } from '@/types';

// // Optimized dimension for better OCR quality
// const MAX_DIMENSION = 1280;

// let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null;

// // Initialize TensorFlow.js
// tf.setBackend('webgl')
//   .then(() => {
//     console.log('TensorFlow.js backend:', tf.getBackend());
//   })
//   .catch((error) => {
//     console.error('Failed to set WebGL backend:', error);
//     // Fallback to CPU
//     tf.setBackend('cpu');
//   });

// export async function loadModel() {
//   if (!modelPromise) {
//     modelPromise = (async () => {
//       try {
//         // Try to use WebGL2 backend if supported
//         await tf.setBackend('webgl').catch(async () => {
//           await tf.setBackend('wasm');
//         });
//         await tf.ready();

//         // Use lite_mobilenet_v2 for faster loading
//         const model = await cocoSsd.load({
//           base: 'lite_mobilenet_v2',
//         });

//         console.log('Model loaded successfully');
//         return model;
//       } catch (error) {
//         console.error('Error loading model:', error);
//         // Fallback to CPU
//         await tf.setBackend('wasm');
//         return cocoSsd.load({ base: 'lite_mobilenet_v2' });
//       }
//     })();
//   }
//   return modelPromise;
// }

// /**
//  * Preprocess image before detection or OCR
//  */
// async function preprocessImage(imageUrl: string): Promise<HTMLCanvasElement> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous';
//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       if (!ctx) {
//         reject(new Error('Could not get canvas context'));
//         return;
//       }

//       let width = img.width;
//       let height = img.height;

//       // Resize image using MAX_DIMENSION
//       if (width > height && width > MAX_DIMENSION) {
//         height = Math.floor(height * (MAX_DIMENSION / width));
//         width = MAX_DIMENSION;
//       } else if (height > MAX_DIMENSION) {
//         width = Math.floor(width * (MAX_DIMENSION / height));
//         height = MAX_DIMENSION;
//       }

//       canvas.width = width;
//       canvas.height = height;

//       // Improved filter settings for Thai OCR
//       ctx.filter = 'brightness(1.15) contrast(1.4) saturate(1.1)';
//       ctx.drawImage(img, 0, 0, width, height);
      
//       // Apply adaptive thresholding for better Thai character separation
//       const imageData = ctx.getImageData(0, 0, width, height);
//       const data = imageData.data;
      
//       // Enhance edges for Thai character recognition
//       for (let y = 1; y < height - 1; y++) {
//         for (let x = 1; x < width - 1; x++) {
//           const idx = (y * width + x) * 4;
          
//           // Simple edge enhancement
//           const r = data[idx];
//           const g = data[idx + 1];
//           const b = data[idx + 2];
//           const gray = (r + g + b) / 3;
          
//           // Enhance contrast locally
//           if (gray < 120) {
//             data[idx] = Math.max(0, r - 15);
//             data[idx + 1] = Math.max(0, g - 15);
//             data[idx + 2] = Math.max(0, b - 15);
//           } else {
//             data[idx] = Math.min(255, r + 15);
//             data[idx + 1] = Math.min(255, g + 15);
//             data[idx + 2] = Math.min(255, b + 15);
//           }
//         }
//       }
      
//       ctx.putImageData(imageData, 0, 0);
//       resolve(canvas);
//     };

//     img.onerror = () => reject(new Error('Failed to load image'));
//     img.src = imageUrl;
//   });
// }

// /**
//  * Check if image is a receipt
//  */
// export async function detectReceipts(imageUrl: string): Promise<boolean> {
//   try {
//     // Check if filename contains receipt/slip keywords
//     if (
//       imageUrl.toLowerCase().includes('receipt') ||
//       imageUrl.toLowerCase().includes('slip')
//     ) {
//       return true;
//     }

//     // Load COCO-SSD model
//     const model = await loadModel();

//     // Preprocess image
//     const processedImage = await preprocessImage(imageUrl);

//     // Strategy 1: Object detection with COCO-SSD
//     const predictions = await model.detect(processedImage);

//     // Lower threshold for blurry images (0.25)
//     const objectDetection = predictions.some(
//       (prediction) =>
//         ['book', 'paper', 'document', 'cell phone', 'laptop', 'keyboard'].includes(
//           prediction.class
//         ) && prediction.score > 0.25
//     );
//     if (objectDetection) return true;

//     // Strategy 2: Text density analysis
//     const textAnalysis = await performTextDensityAnalysis(processedImage);

//     // Strategy 3: Receipt structure analysis
//     const structureAnalysis = analyzeReceiptStructure(processedImage);

//     return objectDetection || textAnalysis || structureAnalysis;
//   } catch (error) {
//     console.error('Error detecting receipts:', error);
//     // Default to true if error occurs
//     return true;
//   }
// }

// /**
//  * Analyze text density using OCR to determine if it's a receipt
//  */
// async function performTextDensityAnalysis(canvas: HTMLCanvasElement): Promise<boolean> {
//   try {
//     // Import tesseract.js in browser only
//     const Tesseract = await import('tesseract.js');

//     // Enhanced OCR configuration for Thai text
//     const result = await Tesseract.recognize(
//       canvas,
//       'tha+eng',
//       {
//         logger: (m: any) => console.log(m),
//         variables: {
//           tessedit_pageseg_mode: '6', // Assume single uniform block of text
//           tessedit_ocr_engine_mode: '1', // Neural net LSTM engine only
//           preserve_interword_spaces: '0', // Important for Thai character spacing
//           textord_force_make_prop_words: '1', // Help combine Thai characters
//           language_model_penalty_non_dict_word: '0.5', // Lower penalty for non-dictionary Thai words
//         },
//       } as any
//     );
    
//     const text = result.data.text || '';

//     // Count numbers and amount patterns
//     const hasNumbers = (text.match(/\d/g) || []).length > 10;
//     const hasAmountPatterns = /\d+\.\d{2}/.test(text);
//     const lines = text.split('\n').filter((line) => line.trim().length > 0);
//     const lineCount = lines.length;

//     // If many lines, many numbers, or price patterns found => likely a receipt
//     return lineCount > 5 && (hasNumbers || hasAmountPatterns);
//   } catch (error) {
//     console.error('Error in text density analysis:', error);
//     return false;
//   }
// }

// /**
//  * Analyze image structure for vertical lines like receipts
//  */
// function analyzeReceiptStructure(canvas: HTMLCanvasElement): boolean {
//   const ctx = canvas.getContext('2d');
//   if (!ctx) return false;

//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   const data = imageData.data;

//   let verticalLineCount = 0;
//   const sampleWidth = Math.min(canvas.width, 200);
//   const darkThreshold = 100;

//   for (let x = 0; x < sampleWidth; x++) {
//     let consecutiveDarkPixels = 0;
//     for (let y = 0; y < canvas.height - 1; y++) {
//       const idx = (y * canvas.width + x) * 4;
//       const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

//       if (brightness < darkThreshold) {
//         consecutiveDarkPixels++;
//         if (consecutiveDarkPixels > canvas.height * 0.3) {
//           verticalLineCount++;
//           break;
//         }
//       } else {
//         consecutiveDarkPixels = 0;
//       }
//     }
//   }
//   return verticalLineCount > 2;
// }

// // Cache Tesseract module to reduce reloading
// let tesseractModule: any = null;
// async function getTesseract() {
//   if (!tesseractModule) {
//     tesseractModule = await import('tesseract.js');
//   }
//   return tesseractModule;
// }

// /**
//  * Fix Thai character spacing issues in OCR results
//  */
// function fixThaiCharacterSpacing(text: string): string {
//   // Remove spaces between Thai characters - the main issue in your example
//   text = text.replace(/([\u0E00-\u0E7F])\s+([\u0E00-\u0E7F])/g, '$1$2');
  
//   // Multiple iterations to catch consecutive Thai chars with spaces
//   for (let i = 0; i < 3; i++) {
//     const prevText = text;
//     text = text.replace(/([\u0E00-\u0E7F])\s+([\u0E00-\u0E7F])/g, '$1$2');
//     if (prevText === text) break; // Stop if no more changes
//   }
  
//   // Fix specific patterns from your example
//   text = text.replace(/จ\s+่\s+า\s+ย\s+บ\s+ิ\s+ล\s+ส\s+ํ\s+า\s+เ\s+ร\s+็\s+จ/g, 'จ่ายบิลสําเร็จ');
//   text = text.replace(/น\s+\.\s+ส\s+\.\s+ว\s+ิ\s+ศ\s+ั\s+ล\s+ย\s+์\s+ศ\s+ย\s+า/g, 'น.ส.วิศัลย์ศยา');
//   text = text.replace(/ธ\s+\.\s+ก\s+ส\s+ิ\s+ก\s+ร\s+ไ\s+ท\s+ย/g, 'ธ.กสิกรไทย');
  
//   // Fix common Thai text patterns
//   text = text.replace(/([ก-๙])\s+ส\s+ํ\s+า\s+เ\s+ร\s+็\s+จ/g, '$1สําเร็จ');
//   text = text.replace(/จ\s+่\s+า\s+ย\s+บ\s+ิ\s+ล/g, 'จ่ายบิล');
  
//   // Fix common bank names
//   text = text.replace(/ก\s+ส\s+ิ\s+ก\s+ร\s+ไ\s+ท\s+ย/g, 'กสิกรไทย');
//   text = text.replace(/K\s*\+/g, 'K+');
  
//   // Fix common punctuation and abbreviations
//   text = text.replace(/(\d)\s+\.\s+(\d)/g, '$1.$2');
//   text = text.replace(/น\s+\.\s+ส\s+\./g, 'น.ส.');
//   text = text.replace(/ธ\s+\./g, 'ธ.');
  
//   // Fix common time formats
//   text = text.replace(/(\d{1,2})\s*:\s*(\d{2})\s*น\s*\./g, '$1:$2 น.');

//   return text;
// }

// /**
//  * OCR function to extract detailed receipt data
//  */
// export async function scanReceipt(file: File): Promise<ReceiptData> {
//   try {
//     const imageUrl = URL.createObjectURL(file);
//     const processedImage = await preprocessImage(imageUrl);

//     const Tesseract = await getTesseract();

//     // Optimized OCR configuration for Thai text
//     const result = await Tesseract.recognize(processedImage, 'tha+eng', {
//       logger: (m: any) => console.log(m),
//       langPath: 'https://tessdata.projectnaptha.com/4.0.0',
//       workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@4.0.3/dist/worker.min.js',
//       tessedit_pageseg_mode: '6',  // Assume single uniform block of text
//       tessedit_ocr_engine_mode: '1', // LSTM only
//       preserve_interword_spaces: '0', // Important for Thai spacing
//       textord_force_make_prop_words: '1', // Help combine Thai characters
//       language_model_penalty_non_dict_word: '0.5', // Lower penalty for non-dict words
//     }).catch((err: any) => {
//       console.error("OCR error:", err);
//       throw new Error("OCR failed");
//     });

//     // Apply Thai character spacing fix
//     let text = fixThaiCharacterSpacing(result.data.text);

//     // Extract data from cleaned text
//     const amount = extractAmount(text);
//     const date = extractDate(text);
//     const merchant = extractMerchant(text);
//     const items = extractItems(text);
//     const tax_id = extractTaxId(text);

//     URL.revokeObjectURL(imageUrl);

//     return {
//       amount: amount || 0,
//       date: date || undefined,
//       merchant: merchant || 'Unknown',
//       items,
//       tax_id,
//       details: text.substring(0, 300),
//       confidence: result?.data?.confidence ? result.data.confidence / 100 : 0,
//       created_at: new Date().toISOString(),
      
//     };
//   } catch (error) {
//     console.error('Error scanning receipt:', error);
//     return {
//       amount: 0,
//       merchant: 'Error',
//       items: [],
//       details: 'Error processing receipt',
//       confidence: 0,
//     };
//   }
// }

// /**
//  * Extract amount from text
//  */
// function extractAmount(text: string): number | null {
//   // Handle common OCR mistakes where ฿ is misread as 8
//   const cleanedText = text.replace(/\b8(\d+\.\d{2})\b/g, (match, amount) => {
//     if (parseFloat('8' + amount) > 1000) {
//       return amount;
//     }
//     return match;
//   });

//   const patterns = [
//     /(?:total|รวมทั้งสิ้น|รวมเงิน|ยอดรวม|ทั้งสิ้น|รวม|จำนวนเงินรวม|จำนวนเงิน|amount|sum|จ่าย|ชำระ|net|subtotal).*?([0-9,]+\.[0-9]{2})/i,
//     /([0-9,]+\.[0-9]{2}).*?(?:total|รวม|บาท|thb|baht)/i,
//     /(?:cash|เงินสด).*?([0-9,]+\.[0-9]{2})/i,
//     /([0-9,]+\.[0-9]{2})/,
//   ];

//   for (const pattern of patterns) {
//     const match = cleanedText.match(pattern);
//     if (match && match[1]) {
//       const amountStr = match[1].replace(/,/g, '');
//       const amount = parseFloat(amountStr);
//       if (!isNaN(amount) && amount > 0) {
//         return amount;
//       }
//     }
//   }

//   const allAmounts = [
//     ...cleanedText.matchAll(/([0-9,]+\.[0-9]{2})/g),
//     ...cleanedText.matchAll(/฿\s*([0-9,]+(?:\.[0-9]{2})?)/g),
//     ...cleanedText.matchAll(/บาท\s*([0-9,]+(?:\.[0-9]{2})?)/g),
//   ]
//     .map((match) => {
//       const amountStr = match[1].replace(/,/g, '');
//       return parseFloat(amountStr);
//     })
//     .filter((amount) => !isNaN(amount) && amount > 0);

//   const potentialMisreads = [
//     ...cleanedText.matchAll(/\b8([0-9]{2,3}(?:\.[0-9]{2})?)\b/g),
//   ]
//     .map((match) => parseFloat(match[1]))
//     .filter((amount) => !isNaN(amount) && amount > 0);

//   allAmounts.push(...potentialMisreads);

//   if (allAmounts.length > 0) {
//     const amountCount = allAmounts.reduce((acc, curr) => {
//       acc[curr] = (acc[curr] || 0) + 1;
//       return acc;
//     }, {} as Record<number, number>);

//     const sortedAmounts = Object.entries(amountCount).sort((a, b) => {
//       if (b[1] !== a[1]) return b[1] - a[1];
//       return parseFloat(b[0]) - parseFloat(a[0]);
//     });

//     return parseFloat(sortedAmounts[0][0]);
//   }

// return null;
// }

// /**
// * Extract date from text
// */
// function extractDate(text: string): string | null {
// const patterns = [
//   /(?:date|วันที่|transaction date).*?(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
//   /(\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})/,
//   /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2}(?!\d))/,
//   /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/,
// ];

// for (const pattern of patterns) {
//   const match = text.match(pattern);
//   if (match && match[1]) {
//     try {
//       const parts = match[1].split(/[\/.-]/);
//       if (parts.length !== 3) continue;

//       let year = parts[2];
//       let month = parts[1];
//       let day = parts[0];

//       // If format is YYYY-MM-DD
//       if (parts[0].length === 4) {
//         year = parts[0];
//         month = parts[1];
//         day = parts[2];
//       }

//       // If year is 2 digits
//       if (year.length === 2) {
//         const yearNum = parseInt(year);
//         year = yearNum < 50 ? `20${year}` : `19${year}`;
//       }

//       // If Buddhist Era (BE) year (>2500)
//       if (parseInt(year) > 2500) {
//         year = (parseInt(year) - 543).toString();
//       }

//       month = month.padStart(2, '0');
//       day = day.padStart(2, '0');

//       return `${year}-${month}-${day}`;
//     } catch {
//       return match[1];
//     }
//   }
// }

// // Look for date in Thai format with Thai month names
// const thaiMonthMap: Record<string, string> = {
//   'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
//   'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
//   'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12',
// };

// const thaiDatePattern = /(\d{1,2})\s*(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s*(\d{2,4})/;
// const thaiMatch = text.match(thaiDatePattern);
// if (thaiMatch) {
//   const day = thaiMatch[1].padStart(2, '0');
//   const month = thaiMonthMap[thaiMatch[2]];
//   let year = thaiMatch[3];
  
//   // Handle 2-digit year
//   if (year.length === 2) {
//     year = (parseInt(year) < 50 ? '20' : '19') + year;
//   }
  
//   // Convert from Buddhist Era if needed
//   if (parseInt(year) > 2500) {
//     year = (parseInt(year) - 543).toString();
//   }
  
//   return `${year}-${month}-${day}`;
// }

// return null;
// }

// /**
// * Extract merchant name from text
// */
// function extractMerchant(text: string): string | null {
// const lines = text
//   .split('\n')
//   .map((line) => line.trim())
//   .filter((line) => line.length > 0);

// // Check first 5 lines for merchant name (excluding numeric-heavy lines)
// for (let i = 0; i < Math.min(5, lines.length); i++) {
//   const line = lines[i];
  
//   // Skip if line is too short or has too many digits
//   if (line.length < 3 || (line.match(/\d/g)?.length || 0) > line.length * 0.3) continue;
  
//   // Skip if line contains date/time patterns
//   if (line.match(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/) || line.match(/\d{1,2}:\d{2}/)) {
//     continue;
//   }
  
//   // Skip common receipt headers that aren't merchant names
//   if (/receipt|invoice|bill|tax invoice|ใบเสร็จ|ใบกำกับภาษี/i.test(line)) {
//     continue;
//   }
  
//   return line;
// }

// // Try specific patterns for merchant names
// const companyPatterns = [
//   /(?:ชื่อร้าน|ร้าน|บริษัท|หจก\.|บจ\.|ห้างหุ้นส่วนจำกัด|company|merchant|store).*?([^\d\n]{3,})/i,
//   /^([A-Za-zก-๙]{3,}(?:\s[A-Za-zก-๙]+){0,3})$/m,
// ];

// for (const pattern of companyPatterns) {
//   const match = text.match(pattern);
//   if (match && match[1] && match[1].length > 3) {
//     return match[1].trim();
//   }
// }

// // For K+ specifically (from your example)
// if (text.includes('K+') || text.includes('กสิกรไทย')) {
//   return 'ธนาคารกสิกรไทย';
// }

// return lines[0] || null; // Default to first line if nothing else works
// }

// /**
// * Extract tax ID from text
// */
// function extractTaxId(text: string): string | undefined {
// const patterns = [
//   /(?:tax id|เลขประจำตัวผู้เสียภาษี|เลขที่ผู้เสียภาษี|เลขทะเบียน).*?(\d[\d-]{12,16}\d)/i,
//   /(?:\b\d{1}-\d{4}-\d{5}-\d{2}-\d{1}\b)/,
//   /(?:\b\d{13}\b)(?!-)/,
// ];

// for (const pattern of patterns) {
//   const match = text.match(pattern);
//   if (match && (match[1] || match[0])) {
//     const taxId = match[1] || match[0];
//     return taxId.replace(/-/g, '');
//   }
// }
// return undefined;
// }

// /**
// * Extract items and their prices from text
// */
// function extractItems(text: string): Array<{ name: string; price: number }> {
// const items: Array<{ name: string; price: number }> = [];
// const lines = text.split('\n');

// // Preprocess lines to fix common OCR errors in Thai receipts
// const preprocessedLines = lines.map((line) =>
//   line
//     .replace(/\b8(\d+(?:\.\d{2})?)\b/g, '฿$1') // Fix '8' being recognized instead of '฿'
//     .replace(/(\d+)000\.00/g, '$1.00') // Fix extra zeros
//     .replace(/(\d+)\.000/g, '$1.00') // Fix extra zeros
//     .replace(/o/gi, '0') // Fix 'o' mistaken for '0'
// );

// // Different patterns to match items and prices
// const itemPatterns = [
//   /^(.{2,30})\s+(?:฿|B)\s*(\d+(?:\.\d{1,2})?)$/,
//   /^(.{2,30})\s+(\d+(?:\.\d{1,2})?)\s*(?:บาท|THB|BAHT)/i,
//   /^(.{2,30})\s+(\d+)(?:\s+x\s+[\d,.]+)?\s+([\d,.]+)$/,
//   /^(.{2,30})\s+([\d,.]+)$/,
//   /^(.{2,30})\s+\d+\s*(?:x|ชิ้น|ea\.?)\s*(?:@\s*[\d,.]+)?\s+([\d,.]+)$/i,
// ];

// // Check each line for item patterns
// for (let i = 0; i < preprocessedLines.length; i++) {
//   const line = preprocessedLines[i].trim();
//   if (!line) continue;
  
//   // Skip common summary lines
//   if (
//     line.match(
//       /(?:subtotal|total|รวม|tax|vat|ภาษี|ทั้งสิ้น|change|เงินทอน|cash|เงินสด)/i
//     )
//   ) {
//     continue;
//   }

//   // Try each pattern for item extraction
//   for (const pattern of itemPatterns) {
//     const match = line.match(pattern);
//     if (match) {
//       const name = match[1].trim();
//       const priceStr = match[match.length - 1].replace(/,/g, '');
//       let price = parseFloat(priceStr);

//       // Fix unreasonably high prices (likely OCR errors)
//       if (price > 100000) {
//         const correctedPrice = price / 1000;
//         if (correctedPrice < 1000) {
//           console.log(`Correcting unreasonable price: ${price} -> ${correctedPrice}`);
//           price = correctedPrice;
//         }
//       }

//       // Only add if name and price are valid
//       if (name.length >= 2 && !isNaN(price) && price > 0 && price < 100000) {
//         items.push({ name, price });
//         break;
//       }
//     }
//   }

//   // Special case for Baht symbol (฿) misread as '8'
//   if (!line.match(/฿|บาท|thb|baht/i) && line.match(/\b8\d+(?:\.\d{2})?\b/)) {
//     const fixedLine = line.replace(/\b8(\d+(?:\.\d{2})?)\b/, '฿$1');
//     for (const pattern of itemPatterns) {
//       const match = fixedLine.match(pattern);
//       if (match) {
//         const name = match[1].trim();
//         const priceStr = match[match.length - 1].replace(/,/g, '');
//         const price = parseFloat(priceStr);
//         if (name.length >= 2 && !isNaN(price) && price > 0 && price < 100000) {
//           items.push({ name, price });
//           break;
//         }
//       }
//     }
//   }
// }

// return items;
// }

// /**
// * Check image orientation (EXIF) to determine if rotation is needed
// */
// export async function checkImageOrientation(file: File): Promise<number> {
// return new Promise((resolve) => {
//   const reader = new FileReader();

//   reader.onload = function (e) {
//     if (!e.target?.result) {
//       resolve(0);
//       return;
//     }
    
//     try {
//       const view = new DataView(e.target.result as ArrayBuffer);

//       // Check if it's a JPEG file
//       if (view.getUint16(0, false) !== 0xffd8) {
//         resolve(0);
//         return;
//       }

//       const length = view.byteLength;
//       let offset = 2;

//       while (offset < length) {
//         const marker = view.getUint16(offset, false);
//         offset += 2;

//         // Look for the EXIF marker
//         if (marker === 0xffe1) {
//           // Check for EXIF header
//           if (view.getUint32(offset + 2, false) !== 0x45786966) {
//             resolve(0);
//             return;
//           }
          
//           // Determine byte alignment
//           const little = view.getUint16(offset + 8, false) === 0x4949;
//           offset += 8;

//           // Read number of tags
//           const tags = view.getUint16(offset + 2, little);
//           offset += 2;

//           // Look for orientation tag
//           for (let i = 0; i < tags; i++) {
//             if (view.getUint16(offset + i * 12, little) === 0x0112) {
//               const orientation = view.getUint16(offset + i * 12 + 8, little);
//               switch (orientation) {
//                 case 3: // 180 degrees
//                   resolve(180);
//                   break;
//                 case 6: // 90 degrees CW
//                   resolve(90);
//                   break;
//                 case 8: // 270 degrees CW (90 degrees CCW)
//                   resolve(-90);
//                   break;
//                 default: // Normal orientation
//                   resolve(0);
//               }
//               return;
//             }
//           }
//         } else if ((marker & 0xff00) !== 0xff00) {
//           break;
//         } else {
//           offset += view.getUint16(offset, false);
//         }
//       }
//       resolve(0); // Default: no rotation needed
//     } catch (error) {
//       console.error('Error checking image orientation:', error);
//       resolve(0);
//     }
//   };

//   reader.onerror = () => resolve(0);

//   // Only read the first 64KB which is enough for EXIF data
//   const slice = file.slice(0, 64 * 1024);
//   reader.readAsArrayBuffer(slice);
// });
// }

// /**
// * Rotate image if needed based on orientation
// */
// export async function rotateImageIfNeeded(file: File): Promise<File> {
// const orientation = await checkImageOrientation(file);

// if (orientation === 0) {
//   return file; // No rotation needed
// }

// return new Promise((resolve, reject) => {
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     if (!e.target?.result) {
//       reject(new Error('Failed to load image'));
//       return;
//     }
    
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       if (!ctx) {
//         reject(new Error('Could not get canvas context'));
//         return;
//       }
      
//       // Set proper canvas dimensions based on rotation
//       if (orientation === 90 || orientation === -90) {
//         canvas.width = img.height;
//         canvas.height = img.width;
//       } else {
//         canvas.width = img.width;
//         canvas.height = img.height;
//       }
      
//       // Apply rotation transformation
//       ctx.translate(canvas.width / 2, canvas.height / 2);
//       ctx.rotate((orientation * Math.PI) / 180);
//       ctx.drawImage(
//         img,
//         -img.width / 2,
//         -img.height / 2,
//         img.width,
//         img.height
//       );
      
//       // Convert canvas to file
//       canvas.toBlob((blob) => {
//         if (!blob) {
//           reject(new Error('Failed to create blob'));
//           return;
//         }
        
//         const rotatedFile = new File([blob], file.name, {
//           type: file.type,
//           lastModified: file.lastModified,
//         });
        
//         resolve(rotatedFile);
//       }, file.type);
//     };
    
//     img.onerror = () => reject(new Error('Failed to load image'));
//     img.src = e.target.result as string;
//   };
  
//   reader.onerror = () => reject(new Error('Failed to read file'));
//   reader.readAsDataURL(file);
// });
// }

// /**
// * Main receipt processing function - combines all steps
// */
// export async function processReceipt(file: File): Promise<ReceiptData> {
// try {
//   // First rotate image if needed based on EXIF data
//   const rotatedFile = await rotateImageIfNeeded(file);
  
//   // Then scan the properly oriented receipt
//   return await scanReceipt(rotatedFile);
// } catch (error) {
//   console.error('Error processing receipt:', error);
//   return {
//     amount: 0,
//     merchant: 'Error processing',
//     items: [],
//     details: 'Error processing receipt',
//     confidence: 0,
//     created_at: new Date().toISOString(),
//   };
// }
// }