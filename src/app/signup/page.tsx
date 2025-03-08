"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Sign up the user with Supabase Auth
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    // Store phone number in Supabase database
    const { data, error: dbError } = await supabase.from("users").insert([
      { email, phone },
    ]);

    if (dbError) {
      setMessage(dbError.message);
    } else {
      setMessage("Signup successful! Check your email.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h2 className="text-2xl font-bold">Sign Up</h2>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="tel"
          placeholder="Phone Number (e.g. +923001234567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}


