type DBOptions = {
  name: string;
  version?: number;
  stores: {
    name: string;
    options?: IDBObjectStoreParameters;
    indexes?: { name: string; keyPath: string; options?: IDBIndexParameters }[];
  }[];
};

type QueryCondition<T> = {
  index?: string;
  range?: IDBKeyRange;
  direction?: IDBCursorDirection;
  filter?: (item: T) => boolean;
  count?: number;
};

export interface IIndexedDb {
  add<T>(storeName: string, data: T): Promise<IDBValidKey>;
  bulkAdd<T>(storeName: string, items: T[]): Promise<IDBValidKey[]>;
  put<T>(storeName: string, data: T, key?: IDBValidKey): Promise<IDBValidKey>;
  delete(storeName: string, key: IDBValidKey): Promise<void>;
  get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined>;
  query<T>(storeName: string, condition?: QueryCondition<T>): Promise<T[]>;
  getAll<T>(storeName: string): Promise<T[]>;
  clear(storeName: string): Promise<void>;
  close(): void;
}

export class IndexedDB implements IIndexedDb {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  constructor(options: DBOptions) {
    this.dbName = options.name;
    this.dbVersion = options.version || 1;
    this.initDB(options.stores);
  }

  private initDB(stores: DBOptions['stores']): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建或更新对象存储
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, store.options);

            // 创建索引
            if (store.indexes) {
              for (const index of store.indexes) {
                objectStore.createIndex(index.name, index.keyPath, index.options);
              }
            }
          }
        }
      };
    });
  }

  private getObjectStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // 添加数据
  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite');
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to add data: ${request.error}`));
    });
  }

  // 批量添加数据
  async bulkAdd<T>(storeName: string, items: T[]): Promise<IDBValidKey[]> {
    const results: IDBValidKey[] = [];

    for (const item of items) {
      try {
        const result = await this.add(storeName, item);
        results.push(result);
      } catch (error) {
        console.error(`Failed to add item: ${error}`);
      }
    }

    return results;
  }

  // 更新数据
  async put<T>(storeName: string, data: T, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite');
      const request = key ? store.put(data, key) : store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to update data: ${request.error}`));
    });
  }

  // 删除数据
  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete data: ${request.error}`));
    });
  }

  // 获取单个数据
  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get data: ${request.error}`));
    });
  }

  // 查询数据
  async query<T>(storeName: string, condition?: QueryCondition<T>): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const results: T[] = [];

      let request: IDBRequest | IDBCursorWithValue;

      if (condition?.index) {
        const index = store.index(condition.index);
        request = index.openCursor(condition?.range, condition?.direction);
      } else {
        request = store.openCursor(condition?.range, condition?.direction);
      }

      let count = 0;

      (request as IDBRequest<IDBCursorWithValue | null>).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;

        if (cursor) {
          if (!condition?.filter || condition.filter(cursor.value)) {
            results.push(cursor.value);
            count++;

            if (condition?.count && count >= condition.count) {
              return resolve(results);
            }
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      (request as IDBRequest).onerror = () => {
        reject(new Error(`Failed to query data: ${(request as IDBRequest).error}`));
      };
    });
  }

  // 获取所有数据
  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readonly');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get all data: ${request.error}`));
    });
  }

  // 清空对象存储
  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to clear store: ${request.error}`));
    });
  }

  // 关闭数据库连接
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // 删除数据库
  static deleteDatabase(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete database: ${request.error}`));
    });
  }
}
