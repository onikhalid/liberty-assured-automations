/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";

export interface DirectDebitMandateData {
  borrower_name: string;
  business_name: string;
  business_phone: string;
  business_email: string;
  business_bank: string;
  business_account_number: string;
  payment_description: string;
  amount: string;
  recursivity: string;
  scheduled_reduction: string;
  start_date: string;
  end_date: string;
  check_balance: string;
  payer_name: string;
  payer_phone: string;
  payer_bank: string;
  payer_email: string;
  payer_account_number: string;
}

const getPuppeteer = async () => {
  if (process.env.NODE_ENV === "development") {
    const puppeteer = await import("puppeteer");
    return puppeteer.default;
  } else {
    const puppeteer = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium");
    return {
      launch: async (options: any) =>
        puppeteer.default.launch({
          ...options,
          executablePath: await chromium.default.executablePath(),
          args: [
            ...chromium.default.args,
            "--hide-scrollbars",
            "--disable-web-security",
          ],
          headless: true,
        }),
    };
  }
};

// Helper to fetch an image and return a data URL (base64)
const fetchImageAsDataUrl = async (url: string): Promise<string | null> => {
  try {
    if (!url) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Image fetch failed:`, res.status, res.statusText);
      return null;
    }
    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.warn(`Error fetching image:`, (e as Error).message);
    return null;
  }
};

const generateHtmlTemplate = (
  data: DirectDebitMandateData,
  headerImageSrc: string | null,
  footerImageSrc: string | null
): string => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Direct Debit Mandate - Seeds</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
      rel="stylesheet"
    />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
          Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 0;
        padding: 0;
      }

      .header {
        background-image: url("${headerImageSrc || ""}");
        background-size: cover;
        background-position: center;
        padding: 16px;
        text-align: center;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .logo {
        height: 48px;
        margin-bottom: 16px;
      }

      .logo img {
        height: 100%;
        width: auto;
      }

      .header h1 {
        color: white;
        font-size: 19px;
        margin-bottom: 8px;
      }

      .container {
        width: 100%;
        margin: 0;
        background: #e0e7fc;
        box-shadow: none;
        border-radius: 0;
      }

      .content {
        padding: 32px;
      }

      .form-header {
        text-align: left;
        margin-bottom: 8px;
        padding-bottom: 16px;
      }

      .form-header h2 {
        font-size: 0.96rem;
        color: #1a1a1a;
        margin-bottom: 4px;
        font-weight: 600;
      }

      .form-header p {
        font-size: 0.8rem;
        color: #242424;
        font-weight: 500;
        margin: 2px 0;
      }

      .section {
        margin-bottom: 32px;
      }

      .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 16px;
      }

      .form-group {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 16px;
      }

      .form-group.full {
        grid-template-columns: 1fr;
      }

      .field {
        display: flex;
        flex-direction: column;
      }

      .field label {
        font-size: 0.7rem;
        color: #000000;
        margin-bottom: 6px;
        font-weight: 500;
        letter-spacing: 0.4px;
      }

      .field input,
      .field textarea {
        padding: 0.7rem 0.8rem;
        border: 1px solid #000619;
        border-radius: 0.4rem;
        font-family: inherit;
        font-size: 0.72rem;
        color: #000619;
        background-color: transparent;
        transition: border-color 0.2s;
        resize: none;
      }

      .field input:focus,
      .field textarea:focus {
        outline: none;
        border-color: #2c5aa0;
        background-color: #fff;
      }

      .field textarea {
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
        resize: none;
      }

      .field input::placeholder,
      .field textarea::placeholder {
        color: #b0b0b0;
      }

      .consent {
        border-radius: 4px;
        line-height: 1.4;
        font-size: 0.88rem;
        color: #000000;
      }

      .consent strong {
        font-weight: 600;
        font-size: 0.92rem;
        text-decoration: underline;
      }

      .signature-section {
        padding-top: 8px;
        border-top: 1px solid #e0e0e0;
      }

      .signature-group {
        display: grid;
        gap: 0.8rem;
        margin-bottom: 0.8rem;
      }

      .signature-field {
        display: flex;
        flex-direction: column;
      }

      .signature-line {
        border-bottom: 1px solid #1a1a1a;
        height: 3px;
        margin-bottom: 4px;
      }

      .signature-field label {
        font-size: 10px;
        color: #000000;
        font-weight: 600;
        letter-spacing: 0.4px;
        margin-block: 0.4rem;
      }

      .footer {
        background-image: url("${footerImageSrc || ""}");
        background-size: cover;
        background-position: center;
        padding: 2.4rem;
        text-align: center;
        color: white;
        font-size: 9.6px;
        border-radius: 0 0 8px 8px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .footer p {
        margin: 0;
      }

      @media (max-width: 768px) {
        .form-group,
        .form-group.third,
        .signature-group {
          grid-template-columns: 1fr;
          gap: 15px;
        }

        .content {
          padding: 20px;
        }

        .header {
          padding: 20px;
        }

        .logo {
          height: 50px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <img
            src="https://res.cloudinary.com/dk4cqoxcp/image/upload/v1768554878/seeds-logo.png"
            alt="Seeds Logo"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <!-- Form Header -->
        <div class="form-header">
          <h2>${data.borrower_name}</h2>
          <p>Direct Debit Mandate</p>
          <p>Seeds and Pennies</p>
        </div>

        <!-- Beneficiary Information Section -->
        <div class="section">
          <h3 class="section-title">Beneficiary Information</h3>

          <div class="form-group">
            <div class="field">
              <label>Business Name</label>
              <input type="text" value="${data.business_name}" readonly />
            </div>
            <div class="field">
              <label>Phone Number</label>
              <input type="text" value="${data.business_phone}" readonly />
            </div>

            <div class="field">
              <label>Email</label>
              <input type="email" value="${data.business_email}" readonly />
            </div>
            <div class="field">
              <label>Bank</label>
              <input type="text" value="${data.business_bank}" readonly />
            </div>

            
            <div class="field">
              <label>Account Number</label>
              <input
                type="text"
                value="${data.business_account_number}"
                readonly
              />
            </div>
          </div>

          </div>
        </div>

        <!-- Mandate Details Section -->
        <div class="section">
          <h3 class="section-title">Mandate Details</h3>

          <div class="form-group full">
            <div class="field">
              <label>Description of Payment</label>
              <textarea readonly>${data.payment_description}</textarea>
            </div>
          </div>

          <div class="form-group">
            <div class="field">
              <label>Amount</label>
              <input type="text" value="${data.amount}" readonly />
            </div>
            <div class="field">
              <label>Recursivity</label>
              <input type="text" value="${data.recursivity}" readonly />
            </div>
          </div>

          <div class="form-group">
            <div class="field">
              <label>Scheduled Reduction</label>
              <input type="text" value="${data.scheduled_reduction}" readonly />
            </div>
            <div class="field">
              <label>Start Date</label>
              <input type="text" value="${data.start_date}" readonly />
            </div>
          </div>

          <div class="form-group">
            <div class="field">
              <label>End Date</label>
              <input type="text" value="${data.end_date}" readonly />
            </div>
            <div class="field">
              <label>Check Balance</label>
              <input type="text" value="${data.check_balance}" readonly />
            </div>
          </div>
        </div>

        <!-- Payer Information Section -->
        <div class="section">
          <h3 class="section-title">Payer Information</h3>

          <div class="form-group">
            <div class="field">
              <label>Payer Name</label>
              <input type="text" value="${data.payer_name}" readonly />
            </div>
            <div class="field">
              <label>Phone Number</label>
              <input type="text" value="${data.payer_phone}" readonly />
            </div>
          </div>

          <div class="form-group">
            <div class="field">
              <label>Bank</label>
              <input type="text" value="${data.payer_bank}" readonly />
            </div>
            <div class="field">
              <label>Email</label>
              <input type="email" value="${data.payer_email}" readonly />
            </div>
          </div>

          <div class="form-group">
            <div class="field">
              <label>Account Number</label>
              <input type="text" value="${
                data.payer_account_number
              }" readonly />
            </div>
          </div>
        </div>

        <!-- Consent Statement -->
        <div class="consent">
          <p>
            I <strong>${data.borrower_name},</strong> hereby consent to the
            creation of a direct debit mandate on the account provided. I
            understand that this mandate may be activated in the event of
            default, in accordance with the applicable policies.
          </p>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-group">
            <div class="signature-field">
              <label>Signature</label>
              <p id="signatureName">${data.borrower_name}</p>
              <div class="signature-line"></div>
              <div id="dateLabel">Date</div>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer">
      </footer>
    </div>

    <script>
      // Update date to current date
      function updateDate() {
        const options = { year: "numeric", month: "long", day: "numeric" };
        const today = new Date();
        const formattedDate = today.toLocaleDateString("en-US", options);
        const dateLabel = document.getElementById("dateLabel");
        dateLabel.textContent = formattedDate;
        dateLabel.style.fontSize = "0.8rem";
        dateLabel.style.marginTop = "0.1rem";
      }

      // Run on page load
      document.addEventListener("DOMContentLoaded", updateDate);

      // Update date every second to keep it real-time
      setInterval(updateDate, 1000);
    </script>
  </body>
</html>`;
};

export async function POST(request: NextRequest) {
  let browser;

  try {
    console.log("Starting Direct Debit Mandate generation...");
    const data: DirectDebitMandateData = await request.json();

    // Validate required fields
    if (!data.borrower_name || !data.business_name) {
      return NextResponse.json(
        { error: "Missing required fields: borrower_name and business_name" },
        { status: 400 }
      );
    }

    // Fetch background images
    console.log("Fetching background images...");
    const headerImageSrc = await fetchImageAsDataUrl(
      "https://res.cloudinary.com/dk4cqoxcp/image/upload/v1768555572/seeds-header-pattern.png"
    );
    const footerImageSrc = await fetchImageAsDataUrl(
      "https://res.cloudinary.com/dk4cqoxcp/image/upload/v1768557489/seeds-footer-pattern-2.png"
    );

    const htmlContent = generateHtmlTemplate(
      data,
      headerImageSrc,
      footerImageSrc
    );

    console.log("HTML template generated, launching browser...");
    const puppeteer = await getPuppeteer();
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    console.log("Browser launched, creating page...");
    const page = await browser.newPage();

    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    console.log("Setting HTML content...");
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    console.log("Content loaded, generating PDF...");

    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    console.log("PDF generated successfully, closing browser...");
    await browser.close();

    console.log("Returning PDF response...");
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${data.borrower_name.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}-direct-debit-mandate.pdf`,
      },
    });
  } catch (error: any) {
    console.error("Error generating Direct Debit Mandate:", error);

    // Ensure browser is closed even if there's an error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }

    return NextResponse.json(
      { error: "Mandate generation failed", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return HTML preview of the form for GET requests
    const { searchParams } = new URL(request.url);

    // Example data for preview
    const exampleData: DirectDebitMandateData = {
      borrower_name: searchParams.get("borrower_name") || "John Doe",
      business_name:
        searchParams.get("business_name") || "Seeds and Pennies Limited",
      business_phone: searchParams.get("business_phone") || "+234 123 456 7890",
      business_email:
        searchParams.get("business_email") || "business@seeds.com",
      business_bank: searchParams.get("business_bank") || "First Bank",
      business_account_number:
        searchParams.get("business_account_number") || "1234567890",
      payment_description:
        searchParams.get("payment_description") ||
        "Daily loan repayment for business loan",
      amount: searchParams.get("amount") || "₦50,000.00",
      recursivity: searchParams.get("recursivity") || "Daily",
      scheduled_reduction: searchParams.get("scheduled_reduction") || "None",
      start_date: searchParams.get("start_date") || "2025-01-20",
      end_date: searchParams.get("end_date") || "2025-12-20",
      check_balance: searchParams.get("check_balance") || "Yes",
      payer_name: searchParams.get("payer_name") || "John Doe",
      payer_phone: searchParams.get("payer_phone") || "+234 987 654 3210",
      payer_bank: searchParams.get("payer_bank") || "GTBank",
      payer_email: searchParams.get("payer_email") || "john@example.com",
      payer_account_number:
        searchParams.get("payer_account_number") || "0987654321",
    };

    // Fetch background images for preview
    const headerImageSrc = await fetchImageAsDataUrl(
      "https://res.cloudinary.com/dk4cqoxcp/image/upload/v1768555572/seeds-header-pattern.png"
    );
    const footerImageSrc = await fetchImageAsDataUrl(
      "https://res.cloudinary.com/dk4cqoxcp/image/upload/v1768557489/seeds-footer-pattern-2.png"
    );

    const htmlContent = generateHtmlTemplate(
      exampleData,
      headerImageSrc,
      footerImageSrc
    );

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Error in GET preview:", error);
    return NextResponse.json(
      { error: "Preview generation failed", details: error.message },
      { status: 500 }
    );
  }
}
