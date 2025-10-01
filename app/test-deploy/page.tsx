export default function TestDeploy() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Deployment Test Page</h1>
      <p className="text-lg">Deployment Time: {new Date().toISOString()}</p>
      <p className="text-sm text-gray-600 mt-4">
        This page was created on October 1, 2025 to verify deployment status.
        If you can see this page, the deployment is complete.
      </p>
      <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded">
        <p className="text-green-800">✓ Deployment successful!</p>
        <p className="text-sm text-green-700 mt-2">
          The percentage input fix should now be working in the assessment.
        </p>
      </div>
    </div>
  );
}