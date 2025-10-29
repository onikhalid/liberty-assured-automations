// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextResponse } from "next/server";

// export const runtime = "nodejs";

// const getPuppeteer = async () => {
//   // Always use puppeteer-core with @sparticuz/chromium for consistency
//   const puppeteer = await import("puppeteer-core");
//   const chromium = await import("@sparticuz/chromium");
  
//   if (process.env.NODE_ENV === "development") {
//     // For local development, try to use system Chrome if available
//     const isWindows = process.platform === 'win32';
//     const isMac = process.platform === 'darwin';
//     const isLinux = process.platform === 'linux';
    
//     let localChromePath = '';
//     if (isWindows) {
//       localChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
//     } else if (isMac) {
//       localChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
//     } else if (isLinux) {
//       localChromePath = '/usr/bin/google-chrome';
//     }
    
//     try {
//       // Try to use local Chrome first
//       return {
//         launch: async (options: any) =>
//           puppeteer.default.launch({
//             ...options,
//             executablePath: localChromePath,
//             // local dev can run non-headless for easier debugging
//             headless: false,
//             args: options?.args ?? [
//               '--no-sandbox',
//               '--disable-setuid-sandbox',
//               '--disable-dev-shm-usage',
//             ],
//           }),
//       };
//     } catch {
//       console.log('Local Chrome not found, using @sparticuz/chromium');
//       // Fallback to chromium
//       return {
//         launch: async (options: any) =>
//           puppeteer.default.launch({
//             ...options,
//             executablePath: await chromium.default.executablePath(),
//             // use the recommended args set from @sparticuz/chromium
//             args: options?.args ?? chromium.default.args,
//             // use the recommended headless mode value
//             headless: chromium.default.headless ?? 'shell',
//             defaultViewport: chromium.default.defaultViewport,
//           }),
//       };
//     }
//   } else {
//     // For production (Vercel), use @sparticuz/chromium with more conservative settings
//     // Set chromium flags for better compatibility
//   await chromium.default.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
    
//     return {
//       launch: async (options: any) =>
//         puppeteer.default.launch({
//           ...options,
//           executablePath: await chromium.default.executablePath(),
//           // Use chromium args; don't force single-process which can crash
//           args: options?.args ?? chromium.default.args,
//           defaultViewport: chromium.default.defaultViewport,
//           headless: chromium.default.headless ?? 'shell',
//           ignoreHTTPSErrors: true,
//         }),
//     };
//   }
// };

// export async function POST(req: Request) {
//   try {
//     console.log('Starting PDF generation...');
//     console.log('Environment:', process.env.VERCEL_ENV || 'local');
//     console.log('Node version:', process.version);
    
//     const data = await req.json();

//     const htmlContent = `
//     <html>
//       <head>
//         <meta charset="UTF-8" />
//         <style>
//           body {
//             font-family: "Segoe UI", Arial, sans-serif;
//             color: #222;
//             padding: 40px;
//             background: #fafafa;
//           }
//           h1 {
//             text-align: center;
//             color: #111;
//             margin-bottom: 6px;
//           }
//           h2 {
//             margin-top: 32px;
//             color: #333;
//             border-bottom: 2px solid #ddd;
//             padding-bottom: 6px;
//             font-size: 18px;
//           }
//           .section {
//             margin-bottom: 20px;
//             background: #fff;
//             padding: 20px;
//             border-radius: 10px;
//             box-shadow: 0 0 5px rgba(0,0,0,0.05);
//           }
//           .row {
//             display: flex;
//             justify-content: space-between;
//             margin: 6px 0;
//           }
//           .label {
//             font-weight: 600;
//             width: 45%;
//           }
//           .value {
//             width: 50%;
//             color: #333;
//           }
//           img {
//             max-width: 160px;
//             border-radius: 6px;
//             border: 1px solid #ddd;
//           }
//           .img-grid {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 10px;
//             margin-top: 10px;
//           }
//           .media-link {
//             display: inline-block;
//             background: #0070f3;
//             color: white;
//             padding: 6px 10px;
//             text-decoration: none;
//             border-radius: 4px;
//             font-size: 12px;
//             margin-top: 4px;
//           }
//           .media-link:hover {
//             background: #0059c1;
//           }
//         </style>
//       </head>
//       <body>
//         <h1>BORROWER INFO</h1>

//         <!-- Borrower Info -->
//         <div class="section">
//           <h2>Borrower Information</h2>
//           <div class="row"><div class="label">Region:</div><div class="value">${
//             data.region || ""
//           }</div></div>
//           <div class="row"><div class="label">Branch:</div><div class="value">${
//             data.branch || ""
//           }</div></div>
//           <div class="row"><div class="label">Loan Type:</div><div class="value">${
//             data.loanType || ""
//           }</div></div>
//           <div class="row"><div class="label">Obligor Name:</div><div class="value">${
//             data.obligorName || ""
//           }</div></div>
//           <div class="row"><div class="label">Phone Number:</div><div class="value">${
//             data.obligorPhoneNumber || ""
//           }</div></div>
//           <div class="row"><div class="label">Home Address:</div><div class="value">${
//             data.obligorHomeAddress || ""
//           }</div></div>
//           <div class="row"><div class="label">Nearest Bus Stop:</div><div class="value">${
//             data.nearestBusStop || ""
//           }</div></div>
//           <div class="row"><div class="label">Landmark:</div><div class="value">${
//             data.landmark || ""
//           }</div></div>
//           <div class="row"><div class="label">BVN/NIN Details:</div><div class="value">${
//             data.bvnDetails || ""
//           }</div></div>
//         </div>

//         <!-- Business Info -->
//         <div class="section">
//           <h2>Business Information</h2>
//           <div class="row"><div class="label">Business Type:</div><div class="value">${
//             data.obligorBusiness || ""
//           }</div></div>
//           <div class="row"><div class="label">Shop Address:</div><div class="value">${
//             data.obligorShopAddress || ""
//           }</div></div>
//           <div class="row"><div class="label">In-Store Stock Value:</div><div class="value">${
//             data.inStoreStock || ""
//           }</div></div>
//           <div class="row"><div class="label">KYC Validation:</div><div class="value">${
//             data.kycValidation || ""
//           }</div></div>
//           <div class="row"><div class="label">Business Ownership Validation:</div><div class="value">${
//             data.businessOwnershipValidation || ""
//           }</div></div>
//           <div class="row"><div class="label">Loan Amount:</div><div class="value">${
//             data.loanAmount || ""
//           }</div></div>
//           <div class="row"><div class="label">Tenor:</div><div class="value">${
//             data.tenor || ""
//           }</div></div>
//           <div class="row"><div class="label">Daily Repayment:</div><div class="value">${
//             data.dailyRepayment || ""
//           }</div></div>

//           <div class="img-grid">
//             ${
//               data.borrowerImageUrl
//                 ? `<div><img src="${data.borrowerImageUrl}" alt="Borrower" /><div>Borrower</div></div>`
//                 : ""
//             }
//             ${
//               data.utilityBillUrl
//                 ? `<div><a class="media-link" href="${data.utilityBillUrl}">View Utility Bill</a></div>`
//                 : ""
//             }
//             ${
//               data.authorityToSeizeUrl
//                 ? `<div><a class="media-link" href="${data.authorityToSeizeUrl}">Authority to Seize</a></div>`
//                 : ""
//             }
//             ${
//               data.shopVideoUrl
//                 ? `<div><a class="media-link" href="${data.shopVideoUrl}">Shop Video</a></div>`
//                 : ""
//             }
//           </div>
//         </div>

//         <!-- Guarantor Info -->
//         <div class="section">
//           <h2>Guarantor Information</h2>
//           <div class="row"><div class="label">Guarantor Name:</div><div class="value">${
//             data.guarantorName || ""
//           }</div></div>
//           <div class="row"><div class="label">Phone Number:</div><div class="value">${
//             data.guarantorPhoneNumber || ""
//           }</div></div>
//           <div class="row"><div class="label">Occupation:</div><div class="value">${
//             data.guarantorOccupation || ""
//           }</div></div>
//           <div class="row"><div class="label">Work Address:</div><div class="value">${
//             data.guarantorWorkAddress || ""
//           }</div></div>
//           <div class="row"><div class="label">Home Address:</div><div class="value">${
//             data.guarantorHomeAddress || ""
//           }</div></div>
//           <div class="row"><div class="label">Nearest Bus Stop:</div><div class="value">${
//             data.guarantorBusStop || ""
//           }</div></div>
//           <div class="row"><div class="label">Landmark:</div><div class="value">${
//             data.guarantorLandmark || ""
//           }</div></div>

//           <div class="img-grid">
//             ${
//               data.guarantorImageUrl
//                 ? `<div><img src="${data.guarantorImageUrl}" alt="Guarantor" /><div>Guarantor</div></div>`
//                 : ""
//             }
//           </div>
//         </div>
//       </body>
//     </html>
//     `;

//     let browser;
    
//     try {
//       console.log('Starting browser launch...');
//       console.log('Environment:', process.env.NODE_ENV);
//       console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
      
//       const puppeteer = await getPuppeteer();
      
//       browser = await puppeteer.launch({
//         // rely on getPuppeteer env-specific defaults
//       });
      
//       console.log('Browser launched successfully');
//     } catch (browserError) {
//       console.error('Browser launch failed:', browserError);
//       if (browserError instanceof Error) {
//         console.error('Browser error stack:', browserError.stack);
//       }
//       const errorMessage = browserError instanceof Error ? browserError.message : String(browserError);
//       throw new Error(`Failed to launch browser: ${errorMessage}`);
//     }

//   const page = await browser.newPage();
    
//     // Set viewport for consistent rendering
//     await page.setViewport({ width: 1024, height: 768 });
    
//     await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 15000 });

//     const pdfBuffer = await page.pdf({
//       format: "a4",
//       printBackground: true,
//       margin: { top: "30px", bottom: "30px" },
//       timeout: 15000,
//     });

    
//     // ensure all pages are closed before closing browser to avoid hangs
//     try {
//       for (const p of await browser.pages()) {
//         if (!p.isClosed()) await p.close({ runBeforeUnload: true });
//       }
//     } catch {}
//     await browser.close();
    
//   return new Response(Buffer.from(pdfBuffer), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": "inline; filename=customer-info.pdf",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "POST, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type",
//       },
//     });
//   } catch (error: any) {
//     console.error("PDF generation failed:", error);
//     return NextResponse.json(
//       { error: "Failed to generate PDF", details: error.message },
//       { status: 500 }
//     );
//   }
// }

// // Handle CORS preflight requests
// export async function OPTIONS() {
//   return new Response(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type',
//     },
//   });
// }
