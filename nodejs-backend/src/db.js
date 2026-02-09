// src/db.js
// Single PrismaClient instance shared across the whole backend.

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
