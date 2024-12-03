import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev")); 
app.use(cookieParser());

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/ping", (req, res) => {
  res.send("pong");
});

// Auth routes
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true },
  });

  res.json(newUser);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = { userId: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  res.json(userData);
});

app.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true },
  });
  res.json(user);
});

// Product routes
app.get("/products", async (req, res) => {
  const { search, category } = req.query;
  const products = await prisma.product.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        } : {},
        category ? { category } : {}
      ]
    }
  });
  res.json(products);
});

app.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.post("/products", async (req, res) => {
  const { name, description, price, category } = req.body;

  if (!name || !description || !price || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating new product:", error);
    res.status(500).json({ error: "An error occurred while creating the product" });
  }
});

// Review routes
app.post("/reviews", requireAuth, async (req, res) => {
  const { productId, rating, comment } = req.body;
  
  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        userId: req.userId,
        productId: parseInt(productId)
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Cart routes
app.get("/cart", requireAuth, async (req, res) => {
  const cartItems = await prisma.cart.findMany({
    where: { userId: req.userId },
    include: { product: true }
  });
  res.json(cartItems);
});

app.post("/cart", requireAuth, async (req, res) => {
  const { productId, quantity } = req.body;
  const cartItem = await prisma.cart.create({
    data: {
      quantity,
      userId: req.userId,
      productId: parseInt(productId)
    },
    include: { product: true }
  });
  res.status(201).json(cartItem);
});

app.put("/cart/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { quantity } = req.body;
  const updatedItem = await prisma.cart.update({
    where: { id },
    data: { quantity },
    include: { product: true }
  });
  res.json(updatedItem);
});

app.delete("/cart/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.cart.delete({ where: { id } });
  res.json({ message: "Cart item deleted" });
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});
