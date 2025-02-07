import type { NextApiRequest, NextApiResponse } from "next";

// Mock user database
const USERS = [
  {
    id: 1,
    email: "admin@admin",
    password: "admin", // In a real app, this should be hashed
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("req.body");

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;
    console.log(email, password);

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user and validate credentials
    const user = USERS.find((u) => u.email === email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Set session cookie
    // res.setHeader("Set-Cookie", `session=${user.id}; Path=/; HttpOnly`);

    // Return success response
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
