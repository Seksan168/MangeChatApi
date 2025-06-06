import jwt from "jsonwebtoken";

const SECRET = Bun.env.JWT_SECRET ?? "secret";

export function generateToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
