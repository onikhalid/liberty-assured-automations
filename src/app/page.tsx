'use client';

import { useState } from 'react';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleData = {
    region: "Sample Region",
    branch: "Sample Branch",
    loanType: "Business Loan",
    obligorName: "John Doe",
    inStoreStock: "1000",
    obligorPhoneNumber: "08012345678",
    kycValidation: "Valid",
    utilityBillUrl: "",
    businessOwnershipValidation: "Verified",
    businessOwnerPicUrl: "",
    frontagePicUrl: "",
    obligorHomeAddress: "123 Main St",
    nearestBusStopHome: "Stop A",
    landmarkHome: "Landmark A",
    obligorBusiness: "Retail",
    obligorShopAddress: "Shop Address",
    nearestBusStopShop: "Stop B",
    landmarkShop: "Landmark B",
    bvnNinDetails: "1234567890",
    loanAmount: "50000",
    tenor: "12",
    dailyRepayment: "1388",
    guarantorName: "Jane Doe",
    guarantorHomeAddress: "456 Home Rd",
    guarantorNearestBusStop: "Stop C",
    guarantorLandmark: "Landmark C",
    guarantorOccupation: "Teacher",
    guarantorWorkAddress: "School",
    guarantorPhoneNumber: "08098765432",
    borrowerImageUrl: "",
    guarantorImageUrl: "",
    authorityToSeizeUrl: "",
    shopVideoUrl: "",
    // Fixing field mappings
    nearestBusStop: "Stop A",
    landmark: "Landmark A",
    bvnDetails: "1234567890",
    guarantorBusStop: "Stop C",
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('Sending data:', sampleData);
      
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
      link.download = 'customer-info.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
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
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(sampleData, null, 2)}
          </pre>
        </div>

        <div className="text-center">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            } transition-colors`}
          >
            {isGenerating ? (
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
                Generating PDF...
              </span>
            ) : (
              'Generate Test PDF'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p>Click the button above to test PDF generation with sample data.</p>
          <p className="text-sm mt-2">The PDF will be automatically downloaded if successful.</p>
        </div>
      </div>
    </div>
  );
}
