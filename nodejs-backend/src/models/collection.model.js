// models/collection.model.js
// Domain model for a collection used in constructor and finalized storage.

export class Collection {
  constructor({
    id,
    ownerId,
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
