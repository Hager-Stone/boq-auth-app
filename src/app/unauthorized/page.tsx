export default function UnauthorizedPage() {
    return (
      <div className="h-screen flex items-center justify-center bg-red-100">
        <div className="text-center p-8 bg-white rounded shadow">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">Your access has been rejected by the admin.</p>
        </div>
      </div>
    );
  }
  