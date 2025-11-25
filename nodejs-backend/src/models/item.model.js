// models/item.model.js
// Domain model for a collection item.

export class Item {
  constructor({
    id,
    collectionId,
    urlImage = null,
    imagePath = null,
    description = null,
  }) {
    // Required identifiers
    this.id = id;
    this.collectionId = collectionId;

    // Item metadata
    this.urlImage = urlImage; // optional external image URL
    this.imagePath = imagePath; // optional local server image path
    this.description = description;
  }
}
