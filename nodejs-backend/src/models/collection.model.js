// collection's model
export class Collection {
  constructor({ id, ownerId, createdAt, updatedAt }) {
    this.id = id;
    this.ownerId = ownerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}