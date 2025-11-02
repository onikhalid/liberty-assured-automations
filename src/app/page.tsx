'use client';

import { useState } from 'react';
import { BorrowerKYCData } from './api/generate-borrower-info-pdf/route';

export default function Home() {
  const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
  const [isGeneratingDeployed, setIsGeneratingDeployed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleData: BorrowerKYCData = {
    region: "Sample Region",
    branch: "Sample Branch",
    loan_type: "Business Loan",
    obligor_name: "John Doe",
    in_store_stock: "1000",
    obligor_phone_number: "08012345678",
    kyc_status: "YES",
    utility_bill_url: "",
    business_ownership_validation: "Verified",
    shop_frontage_url: "",
    obligor_home_address: "123 Main St",
    home_nearest_bus_stop: "Stop A",
    home_landmark: "Landmark A",
    business_type: "Retail",
    shop_address: "Shop Address",
    shop_nearest_bus_stop: "Stop B",
    shop_landmark: "Landmark B",
    bvn_nin_details: "1234567890",
    loan_amount: "350000",
    tenor: "12 months",
    daily_repayment: "1388",
    guarantor_name: "Jane Doe",
    guarantor_home_address: "456 Home Rd",
    guarantor_nearest_bus_stop: "Stop C",
    guarantor_landmark: "Landmark C",
    guarantor_occupation: "Teacher",
    guarantor_work_address: "School",
    guarantor_phone_number: "08098765432",
    borrower_image_url: "",
    guarantor_image_url: "",
    authority_to_seize_url: "",
    owner_with_lo_url: "",
    shop_video_url: "",
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingLocal(true);
    setError(null);

    try {
      console.log('Sending data to LOCAL:', sampleData);
      
      const response = await fetch('/api/generate-borrower-info-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorData.details || errorData.error}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'customer-info-local.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Local PDF generated successfully!');
    } catch (error) {
      console.error('Error generating local PDF:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGeneratingLocal(false);
    }
  };

  const handleGenerateDeployedPDF = async () => {
    setIsGeneratingDeployed(true);
    setError(null);

    try {
      console.log('Sending data to DEPLOYED:', sampleData);
      
      const response = await fetch('https://liberty-assured-automations.vercel.app/api/generate-borrower-info-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorData.details || errorData.error}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'customer-info-deployed.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Deployed PDF generated successfully!');
    } catch (error) {
      console.error('Error generating deployed PDF:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGeneratingDeployed(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          PDF Generation Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Sample Data</h2>
          <pre className="bg-[rgb(0,6,25)] p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(sampleData, null, 2)}
          </pre>
        </div>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingLocal}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                isGeneratingLocal 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } transition-colors`}
            >
              {isGeneratingLocal ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating Local PDF...
                </span>
              ) : (
                'Test Local API'
              )}
            </button>

            <button
              onClick={handleGenerateDeployedPDF}
              disabled={isGeneratingDeployed}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                isGeneratingDeployed 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
              } transition-colors`}
            >
              {isGeneratingDeployed ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating Deployed PDF...
                </span>
              ) : (
                'Test Deployed API'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">
            <strong>Blue button:</strong> Tests the local API endpoint (localhost:3000)
          </p>
          <p className="mb-2">
            <strong>Green button:</strong> Tests the deployed API endpoint (liberty-assured-automations.vercel.app)
          </p>
          <p className="text-sm mt-4">The PDF will be automatically downloaded if successful.</p>
        </div>
      </div>
    </div>
  );
}
