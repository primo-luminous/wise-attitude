import { SignJWT } from "jose";
import crypto from "crypto";

// สร้าง secret key
function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

// สร้าง JWT token สำหรับ testing
async function generateTestToken() {
  // สร้าง secret key ใหม่
  const secret = generateSecretKey();
  
  // สร้าง token สำหรับ user ID 1 (admin)
  const token = await new SignJWT({ 
    sub: "1", // user ID
    email: "admin@wiseattitude.com",
    role: "admin"
  })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("24h")
  .sign(new TextEncoder().encode(secret));

  console.log("=== JWT Token Generated ===");
  console.log("Secret Key (ใส่ใน .env.local):");
  console.log(`AUTH_SECRET=${secret}`);
  console.log("\nTest Token (ใส่ใน cookie):");
  console.log(`session=${token}`);
  console.log("\n=== End ===");
}

generateTestToken().catch(console.error);
