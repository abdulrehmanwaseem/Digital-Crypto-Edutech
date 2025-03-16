import PaymentDetails from "../../components/PaymentDetails";
import { UploadProof } from "../../components/UploadProof";

export default function PaymentPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Complete Your Payment
        </h1>

        {/* Payment Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8">
          <h2 className="font-semibold mb-2">Payment Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Choose your preferred payment method from the options below</li>
            <li>Make the payment using the provided details</li>
            <li>Upload the payment proof (screenshot/receipt)</li>
            <li>Wait for admin verification (usually within 24 hours)</li>
          </ol>
        </div>

        {/* Payment Details Component */}
        <PaymentDetails />

        {/* Upload Payment Proof Section */}
        <div className="mt-8">
          <UploadProof />
        </div>
      </div>
    </div>
  );
}
