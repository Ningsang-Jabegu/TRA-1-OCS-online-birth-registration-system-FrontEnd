import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Image from "../images/Image"

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center animate-fade-in">
        <Image name="logo" className="mx-auto mb-6 w-24 h-24 object-contain" />
        <h1 className="text-6xl font-extrabold text-blue-600 mb-2 tracking-tight drop-shadow-lg">
          404
        </h1>
        <p className="text-2xl text-gray-700 mb-6 font-medium">
          Oops! Page not found
        </p>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-6">
          <Link
            to="/"
            className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            Return to Home
          </Link>
          <Link
            to="/sitemap"
            className="px-6 py-2 rounded-full border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
          >
            Site Map
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
