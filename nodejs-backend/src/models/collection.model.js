// collection.model.js
// This model is used only for in-memory DRAFT collections (constructor step).
// Finalized collections are stored in PostgreSQL and accessed via Prisma.

export class Collection {
  constructor({
    id,
    ownerId,
    title = null,
    description = null,
    urlImage = null,
    imagePath = null,
    createdAt = new Date(),
    updatedAt = new Date(),
    items = new Map(),
    lastItemId = 0,
  }) {
    // Required identifiers
    this.id = id;
    this.ownerId = ownerId;

    // Collection metadata
    this.title = title;
    this.description = description;
    this.urlImage = urlImage; // external image URL (if any)
    this.imagePath = imagePath; // local server image path (if any)

    // Timestamps
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    // Items in this collection (in constructor we use a Map of Item)
    this.items = items; // Map<itemId, Item>
    this.lastItemId = lastItemId; // auto-increment counter for items
  }
}
