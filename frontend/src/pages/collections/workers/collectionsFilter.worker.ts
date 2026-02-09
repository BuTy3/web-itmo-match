type Filters = {
  name: string;
};

type CollectionProjection = {
  id: number;
  title: string;
};

type WorkerRequest = {
  requestId: number;
  collections: CollectionProjection[];
  filters: Filters;
};

type WorkerResponse = {
  requestId: number;
  nameOptions: string[];
  filteredIds: number[];
};

const buildOptions = (values: string[]) => {
  const unique = new Set(values.filter(Boolean));
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { requestId, collections, filters } = event.data;

  const nameOptions = buildOptions(collections.map((collection) => collection.title));
  const filteredIds = collections
    .filter((collection) => {
      if (filters.name && collection.title !== filters.name) return false;
      return true;
    })
    .map((collection) => collection.id);

  const response: WorkerResponse = {
    requestId,
    nameOptions,
    filteredIds,
  };

  self.postMessage(response);
};
