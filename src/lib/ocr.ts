/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ReceiptData } from '@/types';

// * ปรับเพิ่มขนาด Max Dimension
const MAX_DIMENSION = 1280;

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null;

// เริ่มต้น TensorFlow.js
tf.setBackend('webgl')
  .then(() => {
    console.log('TensorFlow.js backend:', tf.getBackend());
  })
  .catch((error) => {
    console.error('Failed to set WebGL backend:', error);
    // fallback ไป CPU
    tf.setBackend('cpu');
  });

export async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        // ลองใช้ backend webgl2 (ถ้ารองรับ)
        await tf.setBackend('webgl').catch(async () => {
          await tf.setBackend('cpu');
        });
        await tf.ready();

        // * ใช้ base = 'lite_mobilenet_v2' จะเล็กและเบา (fast load)
        const model = await cocoSsd.load({
          base: 'lite_mobilenet_v2',
        });

        console.log('Model loaded successfully');
        return model;
      } catch (error) {
        console.error('Error loading model:', error);
        // fallback CPU
        await tf.setBackend('cpu');
        return cocoSsd.load({ base: 'lite_mobilenet_v2' });
      }
    })();
  }
  return modelPromise;
}

/**
 * ฟังก์ชันปรับปรุงภาพ (preprocess) ก่อนนำไปตรวจจับหรือ OCR
 */
async function preprocessImage(imageUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      let width = img.width;
      let height = img.height;

      // * ปรับขนาดภาพโดยใช้ MAX_DIMENSION
      if (width > height && width > MAX_DIMENSION) {
        height = Math.floor(height * (MAX_DIMENSION / width));
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width = Math.floor(width * (MAX_DIMENSION / height));
        height = MAX_DIMENSION;
      }

      canvas.width = width;
      canvas.height = height;

      // * ปรับฟิลเตอร์ (Canvas 2D) เพื่อปรับ contrast/brightness ช่วย OCR
      ctx.filter = 'brightness(1.1) contrast(1.3) grayscale(0.1)';
      ctx.drawImage(img, 0, 0, width, height);

      /*
      // * ถ้าต้องการปรับแต่ง pixel-level เอง ให้คอมเมนต์ filter ข้างบน แล้วใช้วิธี ImageData
      //   ตย.เช่น การปรับ threshold หรือ sharpening
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // ตัวอย่างปรับ contrast แบบ Manual
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        const newVal = avg < 120 ? avg * 0.85 : Math.min(255, avg * 1.15);
        data[i] = data[i+1] = data[i+2] = newVal;
      }
      ctx.putImageData(imageData, 0, 0);
      */

      resolve(canvas);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * ฟังก์ชันตรวจจับว่าเป็นใบเสร็จหรือไม่
 */
export async function detectReceipts(imageUrl: string): Promise<boolean> {
  try {
    // ถ้าชื่อไฟล์ระบุคำว่า receipt / slip
    if (
      imageUrl.toLowerCase().includes('receipt') ||
      imageUrl.toLowerCase().includes('slip')
    ) {
      return true;
    }

    // โหลดโมเดล coco-ssd
    const model = await loadModel();

    // Preprocess ภาพ
    const processedImage = await preprocessImage(imageUrl);

    // Strategy 1: Object detection ด้วย COCO-SSD
    const predictions = await model.detect(processedImage);

    // * ผ่อนปรน threshold ลงเล็กน้อย (เช่น 0.25) ถ้าภาพเบลอ ๆ
    const objectDetection = predictions.some(
      (prediction) =>
        ['book', 'paper', 'document', 'cell phone', 'laptop', 'keyboard'].includes(
          prediction.class
        ) && prediction.score > 0.25
    );
    if (objectDetection) return true;

    // Strategy 2: วิเคราะห์ความหนาแน่นของข้อความ (Text density)
    const textAnalysis = await performTextDensityAnalysis(processedImage);

    // Strategy 3: วิเคราะห์โครงสร้าง (Pattern) แบบใบเสร็จ
    const structureAnalysis = analyzeReceiptStructure(processedImage);

    return objectDetection || textAnalysis || structureAnalysis;
  } catch (error) {
    console.error('Error detecting receipts:', error);
    // ถ้า error ให้ถือว่าเป็นใบเสร็จไปเลย
    return true;
  }
}

/**
 * วิเคราะห์ความหนาแน่นของข้อความ (OCR) เพื่อตรวจสอบว่าเป็นใบเสร็จหรือไม่
 */
async function performTextDensityAnalysis(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    // import tesseract.js เฉพาะบนบราวเซอร์
    const Tesseract = await import('tesseract.js');

    // * เพิ่ม config เช่น OEM, PSM
    const result = await Tesseract.recognize(
      canvas,
      'tha+eng',
      {
        logger: (m: any) => console.log(m),
        variables: {
          tessedit_pageseg_mode: '6',
          tessedit_ocr_engine_mode: '1',
        },
      } as any
    );
    const text = result.data.text || '';

    // นับตัวเลขและรูปแบบจำนวนเงิน
    const hasNumbers = (text.match(/\d/g) || []).length > 10;
    const hasAmountPatterns = /\d+\.\d{2}/.test(text);
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    const lineCount = lines.length;

    // ถ้ามีบรรทัดเยอะ มีตัวเลขเยอะ หรือพบรูปแบบราคา => มีแนวโน้มเป็นใบเสร็จ
    return lineCount > 5 && (hasNumbers || hasAmountPatterns);
  } catch (error) {
    console.error('Error in text density analysis:', error);
    return false;
  }
}

/**
 * วิเคราะห์โครงสร้างภาพ ดูว่ามีแนวตั้ง (vertical lines) คล้ายใบเสร็จหรือไม่
 */
function analyzeReceiptStructure(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let verticalLineCount = 0;
  const sampleWidth = Math.min(canvas.width, 200);
  const darkThreshold = 100;

  for (let x = 0; x < sampleWidth; x++) {
    let consecutiveDarkPixels = 0;
    for (let y = 0; y < canvas.height - 1; y++) {
      const idx = (y * canvas.width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      if (brightness < darkThreshold) {
        consecutiveDarkPixels++;
        if (consecutiveDarkPixels > canvas.height * 0.3) {
          verticalLineCount++;
          break;
        }
      } else {
        consecutiveDarkPixels = 0;
      }
    }
  }
  return verticalLineCount > 2;
}

// เก็บโมดูล Tesseract ไว้ในตัวแปรเพื่อลดการโหลดซ้ำ
let tesseractModule: any = null;
async function getTesseract() {
  if (!tesseractModule) {
    tesseractModule = await import('tesseract.js');
  }
  return tesseractModule;
}

/**
 * ฟังก์ชัน OCR เพื่อดึงข้อมูลใบเสร็จ (ReceiptData) แบบละเอียด
 */
export async function scanReceipt(file: File): Promise<ReceiptData> {
  try {
    const imageUrl = URL.createObjectURL(file);
    const processedImage = await preprocessImage(imageUrl);

    const Tesseract = await getTesseract();

    // * เพิ่ม config (OEM/PSM) เพิ่มเติมให้ OCR ดีขึ้น
    const result = await Tesseract.recognize(processedImage, 'tha+eng', {
      logger: (m: any) => console.log(m),
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@4.0.3/dist/worker.min.js',
      tessedit_pageseg_mode: '3',
      tessedit_ocr_engine_mode: '1',
    }).catch((err:any) => {
      console.error("OCR error:", err);
      throw new Error("OCR failed");
    });
    

    const text = result.data.text;

    // ดึงข้อมูลต่าง ๆ
    const amount = extractAmount(text);
    const date = extractDate(text);
    const merchant = extractMerchant(text);
    const items = extractItems(text);
    const tax_id = extractTaxId(text);

    URL.revokeObjectURL(imageUrl);

    return {
      amount: amount || 0,
      date: date || undefined,
      merchant: merchant || 'Unknown',
      items,
      tax_id,
      details: text.substring(0, 300),
      confidence: result?.data?.confidence ? result.data.confidence / 100 : 0,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error scanning receipt:', error);
    return {
      amount: 0,
      merchant: 'Error',
      items: [],
      details: 'Error processing receipt',
      confidence: 0,
    };
  }
}

/**
 * ฟังก์ชันดึงจำนวนเงินจากข้อความ
 */
function extractAmount(text: string): number | null {
  // * ตัวอย่างโลจิกคงเดิม
  const cleanedText = text.replace(/\b8(\d+\.\d{2})\b/g, (match, amount) => {
    if (parseFloat('8' + amount) > 1000) {
      return amount;
    }
    return match;
  });

  const patterns = [
    /(?:total|รวมทั้งสิ้น|รวมเงิน|ยอดรวม|ทั้งสิ้น|รวม|จำนวนเงินรวม|จำนวนเงิน|amount|sum|จ่าย|ชำระ|net|subtotal).*?([0-9,]+\.[0-9]{2})/i,
    /([0-9,]+\.[0-9]{2}).*?(?:total|รวม|บาท|thb|baht)/i,
    /(?:cash|เงินสด).*?([0-9,]+\.[0-9]{2})/i,
    /([0-9,]+\.[0-9]{2})/,
  ];

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

  const allAmounts = [
    ...cleanedText.matchAll(/([0-9,]+\.[0-9]{2})/g),
    ...cleanedText.matchAll(/฿\s*([0-9,]+(?:\.[0-9]{2})?)/g),
    ...cleanedText.matchAll(/บาท\s*([0-9,]+(?:\.[0-9]{2})?)/g),
  ]
    .map((match) => {
      const amountStr = match[1].replace(/,/g, '');
      return parseFloat(amountStr);
    })
    .filter((amount) => !isNaN(amount) && amount > 0);

  const potentialMisreads = [
    ...cleanedText.matchAll(/\b8([0-9]{2,3}(?:\.[0-9]{2})?)\b/g),
  ]
    .map((match) => parseFloat(match[1]))
    .filter((amount) => !isNaN(amount) && amount > 0);

  allAmounts.push(...potentialMisreads);

  if (allAmounts.length > 0) {
    const amountCount = allAmounts.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const sortedAmounts = Object.entries(amountCount).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return parseFloat(b[0]) - parseFloat(a[0]);
    });

    return parseFloat(sortedAmounts[0][0]);
  }

  return null;
}

/**
 * ฟังก์ชันดึงวันที่จากข้อความ
 */
function extractDate(text: string): string | null {
  const patterns = [
    /(?:date|วันที่|transaction date).*?(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,
    /(\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})/,
    /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2}(?!\d))/,
    /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      try {
        const parts = match[1].split(/[\/.-]/);
        if (parts.length !== 3) continue;

        let year = parts[2];
        let month = parts[1];
        let day = parts[0];

        // ถ้าเป็น YYYY-MM-DD
        if (parts[0].length === 4) {
          year = parts[0];
          month = parts[1];
          day = parts[2];
        }

        // ถ้าเป็น 2 หลัก
        if (year.length === 2) {
          const yearNum = parseInt(year);
          year = yearNum < 50 ? `20${year}` : `19${year}`;
        }

        // ถ้าเป็น พ.ศ. หรือ BE แล้ว year > 2500
        if (text.toLowerCase().includes('พ.ศ.') || text.toLowerCase().includes('be')) {
          if (parseInt(year) > 2500) {
            year = (parseInt(year) - 543).toString();
          }
        }

        month = month.padStart(2, '0');
        day = day.padStart(2, '0');

        return `${year}-${month}-${day}`;
      } catch {
        return match[1];
      }
    }
  }
  return null;
}

/**
 * ฟังก์ชันดึงชื่อร้านจากข้อความ
 */
function extractMerchant(text: string): string | null {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // ถ้ามีตัวเลขเยอะเกินไป ไม่น่าใช่ชื่อร้าน
    if (line.length < 3 || (line.match(/\d/g)?.length || 0) > line.length * 0.3) continue;
    // ถ้ามีรูปแบบวันที่หรือเวลาในบรรทัดนั้น ให้ข้าม
    if (line.match(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/) || line.match(/\d{1,2}:\d{2}/)) {
      continue;
    }
    return line;
  }

  const companyPatterns = [
    /(?:ชื่อร้าน|ร้าน|บริษัท|หจก\.|บจ\.|ห้างหุ้นส่วนจำกัด|company|merchant|store).*?([^\d\n]{3,})/i,
    /^([A-Za-zก-๙]{3,}(?:\s[A-Za-zก-๙]+){0,3})$/m,
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
 * ฟังก์ชันดึงเลขผู้เสียภาษีจากข้อความ
 */
function extractTaxId(text: string): string | undefined {
  const patterns = [
    /(?:tax id|เลขประจำตัวผู้เสียภาษี|เลขที่ผู้เสียภาษี|เลขทะเบียน).*?(\d[\d-]{12,16}\d)/i,
    /(?:\b\d{1}-\d{4}-\d{5}-\d{2}-\d{1}\b)/,
    /(?:\b\d{13}\b)(?!-)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && (match[1] || match[0])) {
      const taxId = match[1] || match[0];
      return taxId.replace(/-/g, '');
    }
  }
  return undefined;
}

/**
 * ฟังก์ชันดึงรายการสินค้า (items) และราคา
 */
function extractItems(text: string): Array<{ name: string; price: number }> {
  const items: Array<{ name: string; price: number }> = [];
  const lines = text.split('\n');

  const preprocessedLines = lines.map((line) =>
    line
      .replace(/\b8(\d+(?:\.\d{2})?)\b/g, '฿$1')
      .replace(/(\d+)000\.00/g, '$1.00')
      .replace(/(\d+)\.000/g, '$1.00')
  );

  const itemPatterns = [
    /^(.{2,30})\s+(?:฿|B)\s*(\d+(?:\.\d{1,2})?)$/,
    /^(.{2,30})\s+(\d+(?:\.\d{1,2})?)\s*(?:บาท|THB|BAHT)/i,
    /^(.{2,30})\s+(\d+)(?:\s+x\s+[\d,.]+)?\s+([\d,.]+)$/,
    /^(.{2,30})\s+([\d,.]+)$/,
    /^(.{2,30})\s+\d+\s*(?:x|ชิ้น|ea\.?)\s*(?:@\s*[\d,.]+)?\s+([\d,.]+)$/i,
  ];

  for (let i = 0; i < preprocessedLines.length; i++) {
    const line = preprocessedLines[i].trim();
    if (!line) continue;
    if (
      line.match(
        /(?:subtotal|total|รวม|tax|vat|ภาษี|ทั้งสิ้น|change|เงินทอน|cash|เงินสด)/i
      )
    ) {
      continue;
    }

    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1].trim();
        const priceStr = match[match.length - 1].replace(/,/g, '');
        let price = parseFloat(priceStr);

        // ถ้าเจอราคาสูงผิดปกติ เช่น 123000 แล้วสงสัยว่า OCR ผิด
        if (price > 100000) {
          const correctedPrice = price / 1000;
          if (correctedPrice < 1000) {
            console.log(`Correcting unreasonable price: ${price} -> ${correctedPrice}`);
            price = correctedPrice;
          }
        }

        if (name.length >= 2 && !isNaN(price) && price > 0 && price < 100000) {
          items.push({ name, price });
          break;
        }
      }
    }

    // กรณีเจอ 8 ที่ควรเป็น ฿
    if (!line.match(/฿|บาท|thb|baht/i) && line.match(/\b8\d+(?:\.\d{2})?\b/)) {
      const fixedLine = line.replace(/\b8(\d+(?:\.\d{2})?)\b/, '฿$1');
      for (const pattern of itemPatterns) {
        const match = fixedLine.match(pattern);
        if (match) {
          const name = match[1].trim();
          const priceStr = match[match.length - 1].replace(/,/g, '');
          const price = parseFloat(priceStr);
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
 * ตรวจสอบ orientation ของภาพ (EXIF) เพื่อดูว่าต้องหมุนหรือไม่
 */
export async function checkImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      if (!e.target?.result) {
        resolve(0);
        return;
      }
      try {
        const view = new DataView(e.target.result as ArrayBuffer);

        if (view.getUint16(0, false) !== 0xffd8) {
          resolve(0);
          return;
        }

        const length = view.byteLength;
        let offset = 2;

        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;

          if (marker === 0xffe1) {
            if (view.getUint32(offset + 2, false) !== 0x45786966) {
              resolve(0);
              return;
            }
            const little = view.getUint16(offset + 8, false) === 0x4949;
            offset += 8;

            const tags = view.getUint16(offset + 2, little);
            offset += 2;

            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + i * 12, little) === 0x0112) {
                const orientation = view.getUint16(offset + i * 12 + 8, little);
                switch (orientation) {
                  case 3:
                    resolve(180);
                    break;
                  case 6:
                    resolve(90);
                    break;
                  case 8:
                    resolve(-90);
                    break;
                  default:
                    resolve(0);
                }
                return;
              }
            }
          } else if ((marker & 0xff00) !== 0xff00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(0);
      } catch (error) {
        console.error('Error checking image orientation:', error);
        resolve(0);
      }
    };

    reader.onerror = () => resolve(0);

    const slice = file.slice(0, 64 * 1024);
    reader.readAsArrayBuffer(slice);
  });
}
