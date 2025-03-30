
import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isLogin?: boolean;
  userType: "buyer" | "seller";
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  isLogin = false,
  userType,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <h1 className="text-2xl font-bold text-messaging-primary">
              Handmade & Vintage Marketplace
            </h1>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          <div className="flex justify-center mb-6">
            <Link
              to={`/${userType}-login`}
              className={`px-4 py-2 mx-1 rounded-md ${
                isLogin
                  ? "bg-messaging-primary text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Login
            </Link>
            <Link
              to={`/${userType}-register`}
              className={`px-4 py-2 mx-1 rounded-md ${
                !isLogin
                  ? "bg-messaging-primary text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Register
            </Link>
          </div>

          {children}

          <div className="mt-6 text-center">
            {userType === "buyer" ? (
              <Link
                to="/seller-login"
                className="text-messaging-primary hover:underline"
              >
                Login as a Seller
              </Link>
            ) : (
              <Link
                to="/buyer-login"
                className="text-messaging-primary hover:underline"
              >
                Login as a Buyer
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
