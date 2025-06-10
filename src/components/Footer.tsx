
import { Link } from "react-router-dom";
import Image from "../images/Image";
import {websiteFirstLaunchedYear} from "../db/LocalDataBase";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const displayYear = currentYear > websiteFirstLaunchedYear ? `${websiteFirstLaunchedYear} - ${currentYear}` : websiteFirstLaunchedYear;

  return (
    <footer className="bg-white border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Image name="logo" className="h-8 w-auto mr-2" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-nepal-blue">
                Online Birth Registration Certificate System
              </span>
              <span className="text-xs text-nepal-red">
                Government of Nepal
              </span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900">
              Register
            </Link>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6 text-center text-sm text-gray-500">
          <p>©  {displayYear} Online Birth Registration and Certificate Generator System. All rights reserved.</p>
          <p className="mt-1">Developed as part of Project Work (CSC412) course project</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
