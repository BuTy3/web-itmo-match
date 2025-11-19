// item's model
export class Item {
  constructor({ id, collectionId, urlImage, imagePath, description }) {
    this.id = id;
    this.collectionId = collectionId;
    this.urlImage = urlImage;
    this.imagePath = imagePath;
    this.description = description;
  }
}
