import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8081",
  "http://127.0.0.1:8081"
];

const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "income", color: "#10b981" },
  { name: "Freelance", type: "income", color: "#34d399" },
  { name: "Food", type: "expense", color: "#f59e0b" },
  { name: "Transport", type: "expense", color: "#3b82f6" },
  { name: "Rent", type: "expense", color: "#ef4444" },
  { name: "Entertainment", type: "expense", color: "#a855f7" },
  { name: "Bills", type: "expense", color: "#f97316" },
  { name: "Health", type: "expense", color: "#ec4899" },
  { name: "Other", type: "expense", color: "#6b7280" }
];

const DEFAULT_SETTINGS = {
  currency: "USD",
  theme: "light",
  startingBalance: 10000
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

const getHouseholdOwner = async () =>
  prisma.user.findFirst({
    orderBy: { id: "asc" }
  });

const ensureHouseholdBootstrap = async (ownerId) => {
  const categoriesCount = await prisma.category.count({ where: { userId: ownerId } });
  if (categoriesCount === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: ownerId }))
    });
  }

  const settings = await prisma.settings.findUnique({ where: { userId: ownerId } });
  if (!settings) {
    await prisma.settings.create({
      data: {
        ...DEFAULT_SETTINGS,
        userId: ownerId
      }
    });
  }
};

const getBootstrapData = async () => {
  const owner = await getHouseholdOwner();
  if (!owner) {
    return {
      transactions: [],
      categories: [],
      budgets: [],
      settings: DEFAULT_SETTINGS
    };
  }

  await ensureHouseholdBootstrap(owner.id);

  const [transactions, categories, budgets, settings] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { date: "desc" }
    }),
    prisma.category.findMany({
      where: { userId: owner.id },
      orderBy: { id: "asc" }
    }),
    prisma.budget.findMany({
      orderBy: { id: "asc" }
    }),
    prisma.settings.findUnique({ where: { userId: owner.id } })
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: formatDate(t.date),
      description: t.description
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      color: c.color
    })),
    budgets: budgets.map((b) => ({
      id: b.id,
      category: b.category,
      amount: b.amount,
      month: b.month,
      spent: 0
    })),
    settings: {
      currency: settings?.currency ?? DEFAULT_SETTINGS.currency,
      theme: settings?.theme ?? DEFAULT_SETTINGS.theme,
      startingBalance: settings?.startingBalance ?? DEFAULT_SETTINGS.startingBalance
    }
  };
};

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const totalUsers = await prisma.user.count();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: totalUsers === 0 ? "admin" : "user"
      }
    });

    const owner = await getHouseholdOwner();
    if (owner) {
      await ensureHouseholdBootstrap(owner.id);
    }
    const token = signToken(user);

    return res.status(201).json({ token, user: safeUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/bootstrap", authMiddleware, async (req, res) => {
  try {
    const data = await getBootstrapData();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load app data" });
  }
});

app.post("/api/transactions", authMiddleware, async (req, res) => {
  const { amount, type, category, date, description } = req.body;

  if (!amount || !type || !category || !date || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount: Number(amount),
        type,
        category,
        date: new Date(date),
        description
      }
    });

    return res.status(201).json({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: formatDate(transaction.date),
      description: transaction.description
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create transaction" });
  }
});

app.put("/api/transactions/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { amount, type, category, date, description } = req.body;

  try {
    const existing = await prisma.transaction.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: Number(amount),
        type,
        category,
        date: new Date(date),
        description
      }
    });

    return res.json({
      id: updated.id,
      amount: updated.amount,
      type: updated.type,
      category: updated.category,
      date: formatDate(updated.date),
      description: updated.description
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update transaction" });
  }
});

app.delete("/api/transactions/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const existing = await prisma.transaction.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await prisma.transaction.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete transaction" });
  }
});

app.post("/api/budgets", authMiddleware, async (req, res) => {
  const { category, amount, month } = req.body;

  if (!category || !amount || !month) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const budget = await prisma.budget.create({
      data: {
        userId: req.user.id,
        category,
        amount: Number(amount),
        month
      }
    });

    return res.status(201).json({
      id: budget.id,
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      spent: 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create budget" });
  }
});

app.post("/api/categories", authMiddleware, async (req, res) => {
  const { name, type, color } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  if (!name || !type || !color) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const owner = await getHouseholdOwner();
    if (!owner) {
      return res.status(400).json({ message: "No household owner found" });
    }

    const category = await prisma.category.create({
      data: {
        userId: owner.id,
        name,
        type,
        color
      }
    });

    return res.status(201).json({
      id: category.id,
      name: category.name,
      type: category.type,
      color: category.color
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create category" });
  }
});

app.put("/api/categories/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { name, type, color } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const existing = await prisma.category.findFirst({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        type,
        color
      }
    });

    return res.json({
      id: updated.id,
      name: updated.name,
      type: updated.type,
      color: updated.color
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update category" });
  }
});

app.delete("/api/categories/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const existing = await prisma.category.findFirst({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete category" });
  }
});

app.patch("/api/settings", authMiddleware, async (req, res) => {
  const { currency, theme, startingBalance } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const owner = await getHouseholdOwner();
    if (!owner) {
      return res.status(400).json({ message: "No household owner found" });
    }

    await ensureHouseholdBootstrap(owner.id);

    const updated = await prisma.settings.update({
      where: { userId: owner.id },
      data: {
        ...(currency ? { currency } : {}),
        ...(theme ? { theme } : {}),
        ...(startingBalance !== undefined ? { startingBalance: Number(startingBalance) } : {})
      }
    });

    return res.json({
      currency: updated.currency,
      theme: updated.theme,
      startingBalance: updated.startingBalance
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update settings" });
  }
});

app.post("/api/reset", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const owner = await getHouseholdOwner();
    if (!owner) {
      return res.status(400).json({ message: "No household owner found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany();
      await tx.budget.deleteMany();
      await tx.category.deleteMany({ where: { userId: owner.id } });

      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: owner.id }))
      });

      await tx.settings.upsert({
        where: { userId: owner.id },
        create: {
          userId: owner.id,
          ...DEFAULT_SETTINGS
        },
        update: DEFAULT_SETTINGS
      });
    });

    const data = await getBootstrapData();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to reset data" });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in environment");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
