/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";

interface BorrowerKYCData {
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

export async function POST(request: NextRequest) {
  try {
    const data: BorrowerKYCData = await request.json();
    const puppeteer = await getPuppeteer();
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KYC Form</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .header .meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
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
        }

        .content {
            padding: 40px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::before {
            content: '';
            width: 8px;
            height: 8px;
            background: #667eea;
            border-radius: 50%;
        }

        .profile-card {
            display: flex;
            align-items: flex-start;
            gap: 30px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
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
            border-radius: 15px;
            object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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
            font-size: 28px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 5px;
        }

        .profile-role {
            font-size: 16px;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .info-item {
            background: #f7fafc;
            padding: 15px 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }

        .info-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            font-weight: 600;
        }

        .info-value {
            font-size: 16px;
            color: #2d3748;
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
        }

        .image-card {
            background: #f7fafc;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .image-card a {
            display: block;
            text-decoration: none;
        }

        .image-card img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .image-card img:hover {
            transform: scale(1.05);
        }

        .image-label {
            padding: 12px;
            font-size: 13px;
            font-weight: 600;
            color: #2d3748;
            text-align: center;
            background: white;
        }

        .loan-summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .loan-stat {
            text-align: center;
        }

        .loan-stat-label {
            font-size: 12px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .loan-stat-value {
            font-size: 24px;
            font-weight: 700;
        }

        .video-thumbnail {
            position: relative;
            width: 100%;
            height: 400px;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KYC FORM</h1>
            <div class="meta">
                <div class="meta-item">
                    <span class="meta-label">Region</span>
                    <span class="meta-value">${data.region || ''}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Branch</span>
                    <span class="meta-value">${data.branch || ''}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Loan Type</span>
                    <span class="meta-value">${data.loan_type || ''}</span>
                </div>
            </div>
        </div>

        <div class="content">
            <!-- Loan Summary -->
            <div class="loan-summary">
                <div class="loan-stat">
                    <div class="loan-stat-label">Loan Amount</div>
                    <div class="loan-stat-value">${data.loan_amount || ''}</div>
                </div>
                <div class="loan-stat">
                    <div class="loan-stat-label">Tenor</div>
                    <div class="loan-stat-value">${data.tenor || ''}</div>
                </div>
                <div class="loan-stat">
                    <div class="loan-stat-label">Daily Repayment</div>
                    <div class="loan-stat-value">${data.daily_repayment || ''}</div>
                </div>
                <div class="loan-stat">
                    <div class="loan-stat-label">KYC Status</div>
                    <div class="loan-stat-value">${data.kyc_status || ''}</div>
                </div>
            </div>

            <!-- Borrower Section -->
            <div class="section">
                <h2 class="section-title">Obligor/Borrower Information</h2>
                
                <div class="profile-card">
                    <a href="${data.borrower_image_url || '#'}" target="_blank" class="profile-image-link">
                        <img src="${data.borrower_image_url || ''}" alt="Borrower" class="profile-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23667eea%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22white%22 font-family=%22Arial%22 font-size=%2280%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EB%3C/text%3E%3C/svg%3E'">
                    </a>
                    <div class="profile-details">
                        <div class="profile-name">${data.obligor_name || ''}</div>
                        <div class="profile-role">Primary Borrower/Obligor</div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Phone Number</div>
                                <div class="info-value">${data.obligor_phone_number || ''}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">BVN/NIN Details</div>
                                <div class="info-value">${data.bvn_nin_details || ''}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Business Type</div>
                                <div class="info-value">${data.business_type || ''}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">In-Store Stock</div>
                                <div class="info-value">${data.in_store_stock || ''}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Business Ownership Validation</div>
                                <div class="info-value">${data.business_ownership_validation || ''}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Home Address</div>
                        <div class="info-value">${data.obligor_home_address || ''}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Nearest Bus Stop (Home)</div>
                        <div class="info-value">${data.home_nearest_bus_stop || ''}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Landmark (Home)</div>
                        <div class="info-value">${data.home_landmark || ''}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Shop Address</div>
                        <div class="info-value">${data.shop_address || ''}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Nearest Bus Stop (Shop)</div>
                        <div class="info-value">${data.shop_nearest_bus_stop || ''}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Landmark (Shop)</div>
                        <div class="info-value">${data.shop_landmark || ''}</div>
                    </div>
                </div>

                <h3 style="font-size: 18px; font-weight: 600; color: #2d3748; margin-top: 30px; margin-bottom: 15px;">Verification Documents</h3>
                <div class="images-grid">
                    <div class="image-card">
                        <a href="${data.utility_bill_url || '#'}" target="_blank">
                            <img src="${data.utility_bill_url || ''}" alt="Utility Bill" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%23718096%22 font-family=%22Arial%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EUtility Bill%3C/text%3E%3C/svg%3E'">
                        </a>
                        <div class="image-label">Utility Bill</div>
                    </div>
                    <div class="image-card">
                        <a href="${data.owner_with_lo_url || '#'}" target="_blank">
                            <img src="${data.owner_with_lo_url || ''}" alt="Owner with LO" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%23718096%22 font-family=%22Arial%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EOwner %26 LO%3C/text%3E%3C/svg%3E'">
                        </a>
                        <div class="image-label">Business Owner with Loan Officer</div>
                    </div>
                    <div class="image-card">
                        <a href="${data.shop_frontage_url || '#'}" target="_blank">
                            <img src="${data.shop_frontage_url || ''}" alt="Shop Frontage" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%23718096%22 font-family=%22Arial%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EShop Front%3C/text%3E%3C/svg%3E'">
                        </a>
                        <div class="image-label">Shop Frontage</div>
                    </div>
                </div>
            </div>

            <!-- Guarantor Section -->
            <div class="section">
                <h2 class="section-title">Guarantor Information</h2>
                
                <div class="profile-card">
                    <a href="${data.guarantor_image_url || '#'}" target="_blank" class="profile-image-link">
                        <img src="${data.guarantor_image_url || ''}" alt="Guarantor" class="profile-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23764ba2%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22white%22 font-family=%22Arial%22 font-size=%2280%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EG%3C/text%3E%3C/svg%3E'">
                    </a>
                    <div class="profile-details">
                        <div class="profile-name">${data.guarantor_name || ''}</div>
                        <div class="profile-role">Guarantor</div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Phone Number</div>
                                <div class="info-value">${data.guarantor_phone_number || ''}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Occupation</div>
                                <div class="info-value">${data.guarantor_occupation || ''}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Home Address</div>
                        <div class="info-value">${data.guarantor_home_address || ''}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Nearest Bus Stop</div>
                        <div class="info-value">${data.guarantor_nearest_bus_stop || ''}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Landmark</div>
                        <div class="info-value">${data.guarantor_landmark || ''}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Work Address</div>
                        <div class="info-value">${data.guarantor_work_address || ''}</div>
                    </div>
                </div>
            </div>

            <!-- Legal Documents -->
            <div class="section">
                <h2 class="section-title">Legal Documents</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Authority to Seize</div>
                        <div class="info-value"><a href="${data.authority_to_seize_url || '#'}" target="_blank">View Document →</a></div>
                    </div>
                </div>
            </div>

            <!-- Shop Video -->
            <div class="section">
                <h2 class="section-title">Shop Verification Video</h2>
                <a href="${data.shop_video_url || '#'}" target="_blank" class="video-thumbnail">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23000' width='800' height='450'/%3E%3Ctext fill='%23fff' font-family='Arial' font-size='24' x='50%25' y='45%25' text-anchor='middle'%3EObligor Shop Video%3C/text%3E%3Ctext fill='%23888' font-family='Arial' font-size='16' x='50%25' y='55%25' text-anchor='middle'%3EClick to view%3C/text%3E%3C/svg%3E" alt="Video Thumbnail">
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;

    await page.setContent(htmlContent);

    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "0.8cm", right: "0.8cm", bottom: "0.8cm", left: "0.8cm" },
    });

    await browser.close();

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${data.obligor_name ? data.obligor_name.replace(/[^a-zA-Z0-9]/g, '_') : 'borrower'}-info.pdf`,
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: error.message },
      { status: 500 }
    );
  }
}
