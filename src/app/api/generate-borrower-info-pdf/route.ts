/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";

export interface BorrowerKYCData {
  region: string;
  branch: string;
  loan_type: string;
  loan_amount: string;
  tenor: string;
  daily_repayment: string;
  kyc_status: string;
  obligor_name: string;
  obligor_phone_number: string;
  obligor_home_address: string;
  home_nearest_bus_stop: string;
  home_landmark: string;
  shop_address: string;
  shop_nearest_bus_stop: string;
  shop_landmark: string;
  bvn_nin_details: string;
  business_type: string;
  in_store_stock: string;
  business_ownership_validation: string;
  borrower_image_url: string;
  utility_bill_url: string;
  owner_with_lo_url: string;
  shop_frontage_url: string;
  guarantor_name: string;
  guarantor_phone_number: string;
  guarantor_occupation: string;
  guarantor_home_address: string;
  guarantor_nearest_bus_stop: string;
  guarantor_landmark: string;
  guarantor_work_address: string;
  guarantor_image_url: string;
  authority_to_seize_url: string;
  shop_video_url: string;
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
          executablePath: await chromium.default.executablePath(), // Added await back to fix Promise error
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

// Helper function to convert Google Drive URLs to direct download URLs
const convertGoogleDriveUrl = (url: string): string => {
  if (!url || !url.includes("drive.google.com")) {
    return url;
  }

  // Extract file ID from Google Drive URL
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)|[?&]id=([a-zA-Z0-9-_]+)/);
  const fileId = match ? match[1] || match[2] : null;

  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
};

// Helper function to create placeholder image data URL
const createPlaceholderImage = (text: string, color = "#667eea"): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='${encodeURIComponent(
    color
  )}' width='300' height='300'/%3E%3Ctext fill='white' font-family='Arial' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E${encodeURIComponent(
    text
  )}%3C/text%3E%3C/svg%3E`;
};

// Helper to fetch an image and return a data URL (base64). Falls back to null on error/timeouts.
const fetchImageAsDataUrl = async (
  url: string,
  label: string
): Promise<string | null> => {
  try {
    if (!url) return null;
    const resolvedUrl = convertGoogleDriveUrl(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout per image
    const res = await fetch(resolvedUrl, {
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(
        `Image fetch failed (${label}):`,
        res.status,
        res.statusText
      );
      return null;
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      console.warn(`Not an image (${label}):`, contentType);
      return null;
    }
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.warn(`Error fetching image (${label}):`, (e as Error).message);
    return null;
  }
};

// Helper to fetch Google Fonts CSS for Manrope and inline font files as data URLs
const fetchAndInlineManropeCss = async (): Promise<string> => {
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(cssUrl, {
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn("Failed to fetch Manrope CSS:", res.status, res.statusText);
      return "";
    }
    let css = await res.text();
    // Find all url(...) occurrences and inline
    const urlRegex = /url\(([^)]+)\)/g;
    const urls = Array.from(css.matchAll(urlRegex)).map((m) =>
      m[1].replace(/"|'/g, "")
    );
    const uniqueUrls = Array.from(new Set(urls));
    const replacements: Record<string, string> = {};
    await Promise.all(
      uniqueUrls.map(async (u) => {
        try {
          const c2 = new AbortController();
          const t2 = setTimeout(() => c2.abort(), 8000);
          const r2 = await fetch(u, {
            signal: c2.signal,
            redirect: "follow",
            cache: "no-store",
          });
          clearTimeout(t2);
          if (!r2.ok) return;
          const ct = r2.headers.get("content-type") || "font/woff2";
          const buf = await r2.arrayBuffer();
          const b64 = Buffer.from(buf).toString("base64");
          replacements[u] = `url(data:${ct};base64,${b64})`;
        } catch {
          // ignore font fetch errors per-url
        }
      })
    );
    css = css.replace(urlRegex, (match, p1) => {
      const key = String(p1).replace(/"|'/g, "");
      return replacements[key] || match;
    });
    return css;
  } catch (e) {
    console.warn("Error inlining Manrope CSS:", (e as Error).message);
    return "";
  }
};

export async function POST(request: NextRequest) {
  let browser;

  try {
    console.log("Starting PDF generation...");
    const data: BorrowerKYCData = await request.json();

    // Attempt to inline images as data URLs; fall back to placeholders
    const borrowerImageSrc =
      (await fetchImageAsDataUrl(data.borrower_image_url, "Borrower Photo")) ??
      createPlaceholderImage("Borrower Photo", "#667eea");
    const guarantorImageSrc =
      (await fetchImageAsDataUrl(
        data.guarantor_image_url,
        "Guarantor Photo"
      )) ?? createPlaceholderImage("Guarantor Photo", "#764ba2");
    const utilityBillSrc =
      (await fetchImageAsDataUrl(data.utility_bill_url, "Utility Bill")) ??
      createPlaceholderImage("Utility Bill", "#4a5568");
    const ownerWithLoSrc =
      (await fetchImageAsDataUrl(data.owner_with_lo_url, "Owner with LO")) ??
      createPlaceholderImage("Owner with LO", "#4a5568");
    const shopFrontageSrc =
      (await fetchImageAsDataUrl(data.shop_frontage_url, "Shop Frontage")) ??
      createPlaceholderImage("Shop Frontage", "#4a5568");

    const processedData = {
      ...data,
      // inline image sources
      borrower_image_src: borrowerImageSrc,
      guarantor_image_src: guarantorImageSrc,
      utility_bill_src: utilityBillSrc,
      owner_with_lo_src: ownerWithLoSrc,
      shop_frontage_src: shopFrontageSrc,
      // preserve original links (converted for Drive where possible)
      borrower_image_link: convertGoogleDriveUrl(data.borrower_image_url),
      guarantor_image_link: convertGoogleDriveUrl(data.guarantor_image_url),
      utility_bill_link: convertGoogleDriveUrl(data.utility_bill_url),
      owner_with_lo_link: convertGoogleDriveUrl(data.owner_with_lo_url),
      shop_frontage_link: convertGoogleDriveUrl(data.shop_frontage_url),
      authority_to_seize_url: convertGoogleDriveUrl(
        data.authority_to_seize_url
      ),
      shop_video_url: convertGoogleDriveUrl(data.shop_video_url),
    } as BorrowerKYCData;

    console.log("URLs converted, launching browser...");
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

    // Set shorter, more realistic timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    const origin = new URL(request.url).origin;
    const patternDataUrl = await fetchImageAsDataUrl(
      `${origin}/images/pattern.svg`,
      "Pattern"
    );
    const companyLogoSvg = await fetchImageAsDataUrl(
      `${origin}/images/seeds-logo.svg`,
      "Company Logo"
    );
    const manropeCss = await fetchAndInlineManropeCss();

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KYC Form</title>
    <style>
        ${manropeCss}
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page { size: A4; margin: 0; }

        /* Print-safe rules to avoid element breaking across pages */
        @media print {
            .section, .profile-card, .image-card, .loan-summary, .info-grid, .info-item { break-inside: avoid; page-break-inside: avoid; }
        }

        body {
            font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: rgb(0, 6, 25);
            color: #e5e7eb;
            min-height: 100vh;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 90px 28px 110px 28px; /* reserve for header/footer */
        }

        .container { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; }

        /* Fixed pattern header/footer on all pages */
        .page-header, .page-footer { position: fixed; left:0; right:0; height: 80px; z-index: 0; }
        .page-header { top: 0; }
        .page-footer { bottom: 0; }
        .page-header .pattern, .page-footer .pattern {
            width: 100%; height: 100%;
            background-image: url('${patternDataUrl ?? ""}');
            background-size: cover; background-position: center; opacity: 0.25;
        }

        .header {
            background: rgba(255, 255, 255, 0.03);
            color: #f9fafb;
            padding: 40px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .header h1 {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 0.2px;
            margin-bottom: 10px;
        }

        .header .meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        /* Force header meta to 3 equal columns */
        .header .header-meta {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
            align-items: start;
            justify-items: center;
        }

        .header .meta-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .header .meta-label {
            font-size: 12px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header .meta-value {
            font-size: 18px;
            font-weight: 600;
            margin-top: 5px;
            color: #cbd5e1;
        }

        .content { padding: 24px; }

        .section {
            margin-bottom: 40px;
            margin-top: 85px;
        }

        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: rgb(76, 136, 234);
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid rgba(76,136,234,0.4);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        .section-title-text {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title-text::before {
            content: '';
            width: 8px;
            height: 8px;
            background: rgb(76,136,234);
            border-radius: 50%;
        }

        .section-logo {
            height: 32px;
            width: auto;
            opacity: 0.8;
            object-fit: contain;
        }
        
        .cover-logo {
            height: 50px;
            width: auto;
            max-width: 100%;
            object-fit: contain;
        }

        .profile-card {
            display: flex;
            align-items: flex-start;
            gap: 30px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            padding: 24px;
            border-radius: 14px;
            margin-bottom: 24px;
            backdrop-filter: blur(8px);
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .profile-image-link {
            display: block;
            width: 200px;
            height: 200px;
            flex-shrink: 0;
        }

        .profile-image {
            width: 100%;
            height: 100%;
            border-radius: 12px;
            object-fit: cover;
            border: 2px solid rgba(255,255,255,0.15);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
            cursor: pointer;
            transition: transform 0.2s;
        }

        .profile-image:hover {
            transform: scale(1.05);
        }

        .profile-details {
            flex: 1;
        }

        .profile-name {
            font-size: 26px;
            font-weight: 700;
            color: #f8fafc;
            margin-bottom: 5px;
        }

        .profile-role {
            font-size: 14px;
            color: #9aa7be;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        /* Modifier: exactly two columns for tighter side-by-side layout */
        .info-grid.two-columns {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .info-item {
            background: rgba(255,255,255,0.05);
            padding: 14px 16px;
            border-radius: 10px;
            border-left: 4px solid rgba(76,136,234,0.6);
            border-top: 1px solid rgba(255,255,255,0.06);
            border-right: 1px solid rgba(255,255,255,0.06);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .info-label {
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            font-weight: 600;
        }

        .info-value {
            font-size: 16px;
            color: #e5e7eb;
            font-weight: 500;
        }

        .info-value a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }

        .info-value a:hover {
            text-decoration: underline;
        }

        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .image-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .image-card a {
            display: block;
            text-decoration: none;
        }

        .image-card img {
            width: 100%;
            height: 240px;
            object-fit: cover;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .image-card img:hover {
            transform: scale(1.05);
        }

        .image-label {
            padding: 12px;
            font-size: 12px;
            font-weight: 600;
            color: #cbd5e1;
            text-align: center;
            background: rgba(0,0,0,0.2);
        }

        .loan-summary {
            background: rgba(255,255,255,0.05);
            color: #f1f5f9;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.08);
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            break-inside: avoid;
            page-break-inside: avoid;
            height: auto;
        }

        .loan-stat {
            text-align: center;
        }

        .loan-stat-label {
            font-size: 11px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
            color: #94a3b8;
        }

        .loan-stat-value {
            font-size: 22px;
            font-weight: 700;
            color: #e5e7eb;
        }

        .video-thumbnail {
            position: relative;
            width: 100%;
            height: 260px;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .video-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .video-thumbnail::after {
            content: '▶';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 80px;
            color: white;
            text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            opacity: 0.9;
        }

        .video-thumbnail:hover::after {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
            transition: all 0.2s;
        }

        .badge {
            display: inline-block;
            background: rgb(8, 25, 52);
            color: rgb(76, 136, 234);
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.3px;
            border: 1px solid rgba(76,136,234,0.35);
        }

        .page { page-break-after: always; }
        .page:last-child { page-break-after: auto; }

        /* Center the cover page content within the safe area between header/footer */
        .page.cover {
            display: grid;
            place-items: center;
            min-height: calc(100vh - 0px);
            text-align: center;
        }

        @media (max-width: 768px) {
            .profile-card {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .profile-image-link {
                width: 200px;
                height: 200px;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }

            .header .meta {
                flex-direction: column;
                gap: 15px;
            }
            .header .header-meta {
                grid-template-columns: 1fr;
            }
            .info-grid.two-columns {
                grid-template-columns: 1fr;
            }
            .header-meta {
                display: flex;
                gap: 15px;
                align-items: center;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="page-header"><div class="pattern"></div></div>
    <div class="page-footer"><div class="pattern"></div></div>
    <div class="container">
        <!-- Page 1: Cover -->
        <div class="content page cover">
            <div style="text-align:center; padding: 24px 8px;">
                <div style="display:flex; justify-content:center; margin-bottom:32px;"><img src="${companyLogoSvg}" alt="Company Logo" class="cover-logo"></div>
                <div style="font-size:38px; font-weight:800; color:#f2f5f9; margin-bottom:8px;">KYC Submission</div>
                <div style="font-size:24px; font-weight:700; color:#c9d3e6; margin-bottom:20px;">${
                  processedData.obligor_name || ""
                }</div>
                <div style="display:flex; gap:12px; justify-content:center;">
                    <span class="badge">${processedData.loan_type || ""}</span>
                    <span class="badge">${processedData.branch || ""}</span>
                    <span class="badge">${processedData.region || ""}</span>
                </div>
            </div>
            <div class="loan-summary" style="display:flex; gap:12px; align-items:center; justify-content:center;">
                <div class="loan-stat"><div class="loan-stat-label">Loan Amount</div><div class="loan-stat-value">${
                  processedData.loan_amount || ""
                }</div></div>
                <div class="loan-stat"><div class="loan-stat-label">Loan Tenor</div><div class="loan-stat-value">${
                  processedData.tenor || ""
                }</div></div>
                <div class="loan-stat"><div class="loan-stat-label">Daily Repayment</div><div class="loan-stat-value">${
                  processedData.daily_repayment || ""
                }</div></div>
                <div class="loan-stat"><div class="loan-stat-label">KYC Validation</div><div class="loan-stat-value"><span class="badge">${
                  processedData.kyc_status || ""
                }</span></div></div>
            </div>
        </div>

        <!-- Page 2: Borrower -->
        <div class="content page">
            <div class="section">
                <h2 class="section-title">
                    <span class="section-title-text">Borrower Profile</span>
                    ${
                      companyLogoSvg
                        ? `<img src="${companyLogoSvg}" alt="Company Logo" class="section-logo">`
                        : ""
                    }
                </h2>
                <div class="profile-card">
                    <div class="profile-image-link">
                        <img src="${
                          (processedData as any).borrower_image_src || ""
                        }" alt="Borrower" class="profile-image">
                    </div>
                    <div class="profile-details">
                        <div class="profile-name">${
                          processedData.obligor_name || ""
                        }</div>
                        <div class="profile-role">Primary Borrower/Obligor</div>
                        ${
                          data.borrower_image_url
                            ? `<div style="margin-bottom: 12px;"><a href="${
                                (processedData as any).borrower_image_link
                              }" target="_blank" style="color: #4c88ea; text-decoration: none; font-size: 13px;">📸 View Original Photo →</a></div>`
                            : ""
                        }
                        <div class="info-grid two-columns">
                            <div class="info-item"><div class="info-label">Phone Number</div><div class="info-value">${
                              processedData.obligor_phone_number || ""
                            }</div></div>
                            <div class="info-item"><div class="info-label">BVN/NIN Details</div><div class="info-value">${
                              processedData.bvn_nin_details || ""
                            }</div></div>
                            <div class="info-item"><div class="info-label">Business Type</div><div class="info-value">${
                              processedData.business_type || ""
                            }</div></div>
                            <div class="info-item"><div class="info-label">In-Store Stock</div><div class="info-value">${
                              processedData.in_store_stock || ""
                            }</div></div>
                            <div class="info-item"><div class="info-label">Business Ownership Validation</div><div class="info-value">${
                              processedData.business_ownership_validation || ""
                            }</div></div>
                        </div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item"><div class="info-label">Home Address</div><div class="info-value">${
                      processedData.obligor_home_address || ""
                    }</div></div>
                    <div class="info-item"><div class="info-label">Nearest Bus Stop (Home)</div><div class="info-value">${
                      processedData.home_nearest_bus_stop || ""
                    }</div></div>
                    <div class="info-item"><div class="info-label">Landmark (Home)</div><div class="info-value">${
                      processedData.home_landmark || ""
                    }</div></div>
                    <div class="info-item"><div class="info-label">Shop Address</div><div class="info-value">${
                      processedData.shop_address || ""
                    }</div></div>
                    <div class="info-item"><div class="info-label">Nearest Bus Stop (Shop)</div><div class="info-value">${
                      processedData.shop_nearest_bus_stop || ""
                    }</div></div>
                    <div class="info-item"><div class="info-label">Landmark (Shop)</div><div class="info-value">${
                      processedData.shop_landmark || ""
                    }</div></div>
                </div>

            </div>
        </div>

        <!-- Page 3: Verification Documents -->
        <div class="content page">
            <div class="section">
                <h2 class="section-title">
                    <span class="section-title-text">Verification Documents</span>
                    ${
                      companyLogoSvg
                        ? `<img src="${companyLogoSvg}" alt="Company Logo" class="section-logo">`
                        : ""
                    }
                </h2>
                <div class="images-grid">
                    <div class="image-card"><img src="${
                      (processedData as any).utility_bill_src || ""
                    }" alt="Utility Bill"><div class="image-label">Utility Bill ${
      data.utility_bill_url
        ? `<br><a href="${
            (processedData as any).utility_bill_link
          }" target="_blank" style="color: #4c88ea; font-size: 12px;">View Original →</a>`
        : ""
    }</div></div>
                    <div class="image-card"><img src="${
                      (processedData as any).owner_with_lo_src || ""
                    }" alt="Owner with LO"><div class="image-label">Business Owner with Loan Officer ${
      data.owner_with_lo_url
        ? `<br><a href="${
            (processedData as any).owner_with_lo_link
          }" target="_blank" style="color: #4c88ea; font-size: 12px;">View Original →</a>`
        : ""
    }</div></div>
                    <div class="image-card"><img src="${
                      (processedData as any).shop_frontage_src || ""
                    }" alt="Shop Frontage"><div class="image-label">Shop Frontage ${
      data.shop_frontage_url
        ? `<br><a href="${
            (processedData as any).shop_frontage_link
          }" target="_blank" style="color: #4c88ea; font-size: 12px;">View Original →</a>`
        : ""
    }</div></div>
                </div>
            </div>
        </div>

        <!-- Page 4: Guarantor -->
        <div class="content page">
            <div class="section">
                <h2 class="section-title">
                    <span class="section-title-text">Guarantor Profile</span>
                    ${
                      companyLogoSvg
                        ? `<img src="${companyLogoSvg}" alt="Company Logo" class="section-logo">`
                        : ""
                    }
                </h2>
                <div class="profile-card">
                    <div class="profile-image-link"><img src="${
                      (processedData as any).guarantor_image_src || ""
                    }" alt="Guarantor" class="profile-image"></div>
                    <div class="profile-details">
                        <div class="profile-name">${
                          processedData.guarantor_name || ""
                        }</div>
                        <div class="profile-role">Guarantor</div>
                        ${
                          data.guarantor_image_url
                            ? `<div style="margin-bottom: 12px;"><a href="${
                                (processedData as any).guarantor_image_link
                              }" target="_blank" style="color: #4c88ea; text-decoration: none; font-size: 13px;">📸 View Original Photo →</a></div>`
                            : ""
                        }
                        <div class="info-grid two-columns">
                            <div class="info-item"><div class="info-label">Phone Number</div><div class="info-value">${
                              processedData.guarantor_phone_number || ""
                            }</div></div>
                            <div class="info-item"><div class="info-label">Occupation</div><div class="info-value">${
                              processedData.guarantor_occupation || ""
                            }</div></div>
                        </div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item"><div class="info-label">Home Address</div><div class="info-value">${
                      processedData.guarantor_home_address || ""
                    }</div></div>
                    <div class="info-item"><div class="info-label">Nearest Bus Stop</div><div class="info-value">${
                      processedData.guarantor_nearest_bus_stop || ""
                    }</div></div>
                    <div class="info-item"><div class="info-label">Landmark</div><div class="info-value">${
                      processedData.guarantor_landmark || ""
                    }</div></div>
                    <div class="info-item"><div class="info-label">Work Address</div><div class="info-value">${
                      processedData.guarantor_work_address || ""
                    }</div></div>
                </div>
            </div>
        </div>

    <!-- Page 5: Legal & Video -->
    <div class="content page">
            <div class="section">
                <h2 class="section-title">
                    <span class="section-title-text">Legal Documents</span>
                    ${
                      companyLogoSvg
                        ? `<img src="${companyLogoSvg}" alt="Company Logo" class="section-logo">`
                        : ""
                    }
                </h2>
                <div class="info-grid two-columns">
                    <div class="info-item"><div class="info-label">Authority to Seize</div><div class="info-value"><a href="${
                      processedData.authority_to_seize_url || "#"
                    }" target="_blank">View Document →</a></div></div>
                </div>
            </div>
            <div class="section">
                <h2 class="section-title">
                    <span class="section-title-text">Shop Verification Video</span>
                    ${
                      companyLogoSvg
                        ? `<img src="${companyLogoSvg}" alt="Company Logo" class="section-logo">`
                        : ""
                    }
                </h2>
                <a href="${
                  processedData.shop_video_url || "#"
                }" target="_blank" class="video-thumbnail">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='260'%3E%3Crect fill='%23000' width='800' height='260'/%3E%3Ctext fill='%23cbd5e1' font-family='Arial' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EObligor Shop Video%3C/text%3E%3C/svg%3E" alt="Video Thumbnail">
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;

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
        "Content-Disposition": `attachment; filename=${
          processedData.obligor_name
            ? processedData.obligor_name.replace(/[^a-zA-Z0-9]/g, "_")
            : "borrower"
        }-info.pdf`,
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);

    // Ensure browser is closed even if there's an error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }

    return NextResponse.json(
      { error: "PDF generation failed", details: error.message },
      { status: 500 }
    );
  }
}
