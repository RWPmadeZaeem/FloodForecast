"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaPhone, FaLock } from "react-icons/fa";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error"); // "error" or "success"
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            phone: phone // Store phone in user metadata for easy access
          }
        }
      });

      if (error) throw error;

      // 2. Store additional user info in your custom users table
      const { error: dbError } = await supabase
        .from("users")
        .insert([{ // Use the auth user ID as the primary key
          email, 
          phone 
        }]);

      if (dbError) throw dbError;

      // 3. Success message
      setMessageType("success");
      setMessage("Signup successful! Redirecting to home page...");
      
      // 4. Redirect to home page after short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
      
    } catch (error) {
      console.error("Signup error:", error);
      setMessageType("error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-250px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-zinc-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Join FloodForecast to receive prediction reports
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 py-3 px-3 border border-zinc-300 placeholder-zinc-500 text-zinc-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Email address"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="sr-only">Phone number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 py-3 px-3 border border-zinc-300 placeholder-zinc-500 text-zinc-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Phone number (e.g. +923001234567)"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 py-3 px-3 border border-zinc-300 placeholder-zinc-500 text-zinc-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Password (min 6 characters)"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              messageType === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400"
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <p className="text-zinc-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}