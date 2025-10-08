/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: "Segoe UI", Arial, sans-serif;
            color: #222;
            padding: 40px;
            background: #fafafa;
          }
          h1 {
            text-align: center;
            color: #111;
            margin-bottom: 6px;
          }
          h2 {
            margin-top: 32px;
            color: #333;
            border-bottom: 2px solid #ddd;
            padding-bottom: 6px;
            font-size: 18px;
          }
          .section {
            margin-bottom: 20px;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 5px rgba(0,0,0,0.05);
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
          }
          .label {
            font-weight: 600;
            width: 45%;
          }
          .value {
            width: 50%;
            color: #333;
          }
          img {
            max-width: 160px;
            border-radius: 6px;
            border: 1px solid #ddd;
          }
          .img-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
          }
          .media-link {
            display: inline-block;
            background: #0070f3;
            color: white;
            padding: 6px 10px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 4px;
          }
          .media-link:hover {
            background: #0059c1;
          }
        </style>
      </head>
      <body>
        <h1>KYC FORM</h1>

        <!-- Borrower Info -->
        <div class="section">
          <h2>Borrower Information</h2>
          <div class="row"><div class="label">Region:</div><div class="value">${
            data.region || ""
          }</div></div>
          <div class="row"><div class="label">Branch:</div><div class="value">${
            data.branch || ""
          }</div></div>
          <div class="row"><div class="label">Loan Type:</div><div class="value">${
            data.loanType || ""
          }</div></div>
          <div class="row"><div class="label">Obligor Name:</div><div class="value">${
            data.obligorName || ""
          }</div></div>
          <div class="row"><div class="label">Phone Number:</div><div class="value">${
            data.obligorPhoneNumber || ""
          }</div></div>
          <div class="row"><div class="label">Home Address:</div><div class="value">${
            data.obligorHomeAddress || ""
          }</div></div>
          <div class="row"><div class="label">Nearest Bus Stop:</div><div class="value">${
            data.nearestBusStop || ""
          }</div></div>
          <div class="row"><div class="label">Landmark:</div><div class="value">${
            data.landmark || ""
          }</div></div>
          <div class="row"><div class="label">BVN/NIN Details:</div><div class="value">${
            data.bvnDetails || ""
          }</div></div>
        </div>

        <!-- Business Info -->
        <div class="section">
          <h2>Business Information</h2>
          <div class="row"><div class="label">Business Type:</div><div class="value">${
            data.obligorBusiness || ""
          }</div></div>
          <div class="row"><div class="label">Shop Address:</div><div class="value">${
            data.obligorShopAddress || ""
          }</div></div>
          <div class="row"><div class="label">In-Store Stock Value:</div><div class="value">${
            data.inStoreStock || ""
          }</div></div>
          <div class="row"><div class="label">KYC Validation:</div><div class="value">${
            data.kycValidation || ""
          }</div></div>
          <div class="row"><div class="label">Business Ownership Validation:</div><div class="value">${
            data.businessOwnershipValidation || ""
          }</div></div>
          <div class="row"><div class="label">Loan Amount:</div><div class="value">${
            data.loanAmount || ""
          }</div></div>
          <div class="row"><div class="label">Tenor:</div><div class="value">${
            data.tenor || ""
          }</div></div>
          <div class="row"><div class="label">Daily Repayment:</div><div class="value">${
            data.dailyRepayment || ""
          }</div></div>

          <div class="img-grid">
            ${
              data.borrowerImageUrl
                ? `<div><img src="${data.borrowerImageUrl}" alt="Borrower" /><div>Borrower</div></div>`
                : ""
            }
            ${
              data.utilityBillUrl
                ? `<div><a class="media-link" href="${data.utilityBillUrl}">View Utility Bill</a></div>`
                : ""
            }
            ${
              data.authorityToSeizeUrl
                ? `<div><a class="media-link" href="${data.authorityToSeizeUrl}">Authority to Seize</a></div>`
                : ""
            }
            ${
              data.shopVideoUrl
                ? `<div><a class="media-link" href="${data.shopVideoUrl}">Shop Video</a></div>`
                : ""
            }
          </div>
        </div>

        <!-- Guarantor Info -->
        <div class="section">
          <h2>Guarantor Information</h2>
          <div class="row"><div class="label">Guarantor Name:</div><div class="value">${
            data.guarantorName || ""
          }</div></div>
          <div class="row"><div class="label">Phone Number:</div><div class="value">${
            data.guarantorPhoneNumber || ""
          }</div></div>
          <div class="row"><div class="label">Occupation:</div><div class="value">${
            data.guarantorOccupation || ""
          }</div></div>
          <div class="row"><div class="label">Work Address:</div><div class="value">${
            data.guarantorWorkAddress || ""
          }</div></div>
          <div class="row"><div class="label">Home Address:</div><div class="value">${
            data.guarantorHomeAddress || ""
          }</div></div>
          <div class="row"><div class="label">Nearest Bus Stop:</div><div class="value">${
            data.guarantorBusStop || ""
          }</div></div>
          <div class="row"><div class="label">Landmark:</div><div class="value">${
            data.guarantorLandmark || ""
          }</div></div>

          <div class="img-grid">
            ${
              data.guarantorImageUrl
                ? `<div><img src="${data.guarantorImageUrl}" alt="Guarantor" /><div>Guarantor</div></div>`
                : ""
            }
          </div>
        </div>
      </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "30px", bottom: "30px" },
    });

    await browser.close();

    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=kyc-form.pdf",
      },
    });
  } catch (error: any) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}
