const JWT = require("jsonwebtoken");

const CreateToken = (payload) => {
  return JWT.sign(
    {
      id: payload.id,       
      email: payload.email,
      role: payload.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

module.exports = { CreateToken, auth, isAdmin };
