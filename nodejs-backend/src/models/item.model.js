// item.model.js
// This model is used only for in-memory DRAFT items inside a draft collection.
// Finalized items are stored in PostgreSQL and accessed via Prisma.

export class Item {
  constructor({
    id,
    collectionId,
    urlImage = null,
    imagePath = null,
    title = null,
    description = null,
  }) {
    // Required identifiers
    this.id = id;
    this.collectionId = collectionId;

    // Item metadata
    this.urlImage = urlImage; // optional external image URL
    this.imagePath = imagePath; // optional local server image path
    this.title = title;
    this.description = description;
  }
}
