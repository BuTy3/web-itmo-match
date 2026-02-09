import { jest } from '@jest/globals';
import {
  addItemToDraft,
  finalizeDraft,
  getOrCreateDraft,
  updateConstructorMeta,
} from '../../src/services/collection.service.js';
import { prisma } from '../../src/db.js';

describe('collection.service draft lifecycle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns same draft for the same user and new draft for another', () => {
    const draftA1 = getOrCreateDraft(101);
    const draftA2 = getOrCreateDraft(101);
    const draftB = getOrCreateDraft(102);

    expect(draftA1).toBe(draftA2);
    expect(draftA1.id).not.toBe(draftB.id);
  });

  it('validates metadata before saving constructor info', () => {
    expect(() =>
      updateConstructorMeta(201, {
        urlImage: null,
        imagePath: null,
        description: '   ',
      }),
    ).toThrow('Collection description is required');

    expect(() =>
      updateConstructorMeta(202, {
        urlImage: 'not-a-url',
        imagePath: null,
        description: 'desc',
      }),
    ).toThrow('url_image is not a valid URL');
  });

  it('adds items with auto-increment and rejects duplicates', () => {
    const userId = 301;
    // Ensure draft exists
    updateConstructorMeta(userId, {
      urlImage: null,
      imagePath: null,
      description: 'Draft description',
    });

    const first = addItemToDraft(userId, {
      itemIdFromClient: undefined,
      urlImage: null,
      imagePath: null,
      description: 'First item',
    });

    const second = addItemToDraft(userId, {
      itemIdFromClient: 3,
      urlImage: null,
      imagePath: null,
      description: 'Second item',
    });

    expect(first.itemId).toBe(1);
    expect(second.itemId).toBe(3);

    expect(() =>
      addItemToDraft(userId, {
        itemIdFromClient: 3,
        urlImage: null,
        imagePath: null,
        description: 'Dup id',
      }),
    ).toThrow('item_id 3 is already used');
  });

  it('finalizes draft, persists collection and items, then clears draft', async () => {
    const userId = 401;
    updateConstructorMeta(userId, {
      urlImage: null,
      imagePath: null,
      description: 'Ready to save',
    });
    addItemToDraft(userId, {
      itemIdFromClient: undefined,
      urlImage: 'https://img',
      imagePath: null,
      description: 'Persisted item',
    });

    const collectionCreateSpy = jest
      .spyOn(prisma.collection, 'create')
      .mockResolvedValue({ id: BigInt(10) });
    const itemCreateManySpy = jest.spyOn(prisma.item, 'createMany').mockResolvedValue({});

    const result = await finalizeDraft(userId);

    expect(result).toEqual({ id: 10 });
    expect(collectionCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          owner_id: BigInt(userId),
          description: 'Ready to save',
        }),
      }),
    );
    expect(itemCreateManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            collection_id: BigInt(10),
            description: 'Persisted item',
          }),
        ]),
      }),
    );
  });
});
