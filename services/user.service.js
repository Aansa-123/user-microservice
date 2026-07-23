import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma.js';
const normalizeEmail = (email) => email?.trim().toLowerCase();

const createUser = async (userData) => {
  const normalizedUserData = {
    ...userData,
    email: normalizeEmail(userData.email),
  };

  if (normalizedUserData.dob) {
    const dobDate = new Date(normalizedUserData.dob);

    if (Number.isNaN(dobDate.getTime())) {
      throw new Error("Invalid date of birth");
    }

    normalizedUserData.dob = dobDate;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedUserData.email,
        mode: 'insensitive',
      },
    },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(normalizedUserData.password, 10);

  const user = await prisma.user.create({
    data: {
      ...normalizedUserData,
      password: hashedPassword,
    },
  });

  const { password, ...userWithoutPassword } = user;


  return userWithoutPassword;
};

const loginUser = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive',
      },
    },
  });

  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);

  if (!match) return null;

  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT secret is not configured');
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
    }
  );

  const { password: pwd, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

const getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      dob: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updateUser = async (userId, userData) => {
  const updateData = { ...userData };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
  });
};

const deleteUserById = async (userId) => {
  return await prisma.user.delete({
    where: {
      id: userId,
    },
  });
};

const deleteAllUsers = async () => {
  return await prisma.user.deleteMany();
};

export {
  createUser,
  loginUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUserById,
  deleteAllUsers,
};