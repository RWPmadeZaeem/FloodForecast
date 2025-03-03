import { supabase } from "../lib/supabase";

export async function addUser(email) {
  const { data, error } = await supabase.from("users").insert([{ email }]);
  if (error) console.error("Error adding user:", error);
  return data;
}

export async function getUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) console.error("Error fetching users:", error);
  return data;
}
