"use client";
import Link from "next/link";
import { useAuth } from "@/context/auth";
import { useState } from "react";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import useRouter

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleSignOut = async () => {
    await signOut(); // Call the signOut function
    setIsMenuOpen(false); // Close the mobile menu
    setIsUserMenuOpen(false); // Close the user menu
    router.push("/"); // Redirect to the homepage
  };

  return (
    <header className="bg-zinc-100 text-black py-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/">
          <Image src="/logoFlood.png" alt="Logo" width={180} height={180} />
        </Link>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/predictor" className="hover:text-orange-400 transition-colors">
            Predictor
          </Link>
          <Link href="/history" className="hover:text-orange-400 transition-colors">
            History
          </Link>
          <Link href="/about" className="hover:text-orange-400 transition-colors">
            About
          </Link>
          
          {loading ? (
            <div className="w-6 h-6 border-2 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
          ) : user ? (
            <div className="relative">
              <button 
                onClick={toggleUserMenu} 
                className="flex items-center space-x-2 bg-orange-500 text-zinc-100 py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <FaUser />
                <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-100 rounded-lg shadow-lg py-2 z-20">
                  <button 
                    onClick={handleSignOut} // Use handleSignOut here
                    className="block w-full text-left px-4 py-2 hover:bg-zinc-200 hover:text-red-500 transition-colors text-red-400"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="bg-orange-600 hover:bg-orange-700  text-zinc-100 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-100 mt-4">
          <nav className="flex flex-col p-4">
            <Link 
              href="/predictor" 
              className="py-2 hover:text-orange-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Predictor
            </Link>
            <Link 
              href="/history" 
              className="py-2 hover:text-orange-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              History
            </Link>
            <Link 
              href="/about" 
              className="py-2 hover:text-orange-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="py-2 hover:text-orange-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  href="/reports" 
                  className="py-2 hover:text-orange-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Reports
                </Link>
                <button 
                  onClick={handleSignOut} // Use handleSignOut here
                  className="text-left py-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 mt-4">
                <Link 
                  href="/login" 
                  className="text-orange-400 hover:text-orange-300 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}