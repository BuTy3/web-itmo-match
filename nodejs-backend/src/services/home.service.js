// Home service (Prisma queries + DTO mapping)
import {prisma} from "../db.js";

/**
 * Build collections DTO for Home screen.
 * Spec shape:
 * {
 *   id,
 *   url_image,
 *   type,
 *   description,
 *   items: [{ item_id, url_image, description }, ...]
 * }
 */

function mapCollectionDto(c) {
  return {
    id: Number(c.id),
    url_image: c.image_url ?? null,
    type: c.type, 
    description: c.description ?? null,
    items: (c.item || []).map((it) => ({
      item_id: Number(it.id),
      url_image: it.image_url ?? null,
      description: it.description ?? null,
    })),
  };
}

// [GET] /home
export async function fetchReadyCollections() {
  // return latest collections (can change ordering/limit rules later)
  const rows = await prisma.collection.findMany({
    orderBy: { created_at: "desc" },
    take: 20,
    include: {
      item: {
        orderBy: { created_at: "asc" },
        take: 20,
      },
    },
  });

  return rows.map(mapCollectionDto);
}

// [POST] /home (auth)
export async function fetchUserCollections(userId) {
  const rows = await prisma.collection.findMany({
    where: { owner_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      item: {
        orderBy: { created_at: "asc" },
        take: 50,
      },
    },
  });

  return rows.map(mapCollectionDto);
}

// [POST] /home/search (auth)
export async function findRoomById(roomId) {
  return prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      status: true,
    },
  });
}
