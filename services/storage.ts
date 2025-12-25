
import { ClothingItem, Conversation, ScheduledOutfit } from '../types';

const DB_NAME = 'ClosetDB';
const DB_VERSION = 2; // Incremented version
const ITEMS_STORE = 'clothing_items';
const CHATS_STORE = 'conversations';
const SCHEDULE_STORE = 'scheduled_outfits';

class StorageService {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ITEMS_STORE)) {
          db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(CHATS_STORE)) {
          db.createObjectStore(CHATS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(SCHEDULE_STORE)) {
          db.createObjectStore(SCHEDULE_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveItem(item: ClothingItem): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(ITEMS_STORE, 'readwrite');
    tx.objectStore(ITEMS_STORE).put(item);
  }

  async getItems(): Promise<ClothingItem[]> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const request = db.transaction(ITEMS_STORE, 'readonly').objectStore(ITEMS_STORE).getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteItem(id: string): Promise<void> {
    const db = await this.getDB();
    db.transaction(ITEMS_STORE, 'readwrite').objectStore(ITEMS_STORE).delete(id);
  }

  async saveConversation(conv: Conversation): Promise<void> {
    const db = await this.getDB();
    db.transaction(CHATS_STORE, 'readwrite').objectStore(CHATS_STORE).put(conv);
  }

  async getConversations(): Promise<Conversation[]> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const request = db.transaction(CHATS_STORE, 'readonly').objectStore(CHATS_STORE).getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveScheduledOutfit(item: ScheduledOutfit): Promise<void> {
    const db = await this.getDB();
    db.transaction(SCHEDULE_STORE, 'readwrite').objectStore(SCHEDULE_STORE).put(item);
  }

  async getScheduledOutfits(): Promise<ScheduledOutfit[]> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const request = db.transaction(SCHEDULE_STORE, 'readonly').objectStore(SCHEDULE_STORE).getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteScheduledOutfit(id: string): Promise<void> {
    const db = await this.getDB();
    db.transaction(SCHEDULE_STORE, 'readwrite').objectStore(SCHEDULE_STORE).delete(id);
  }
}

export const storage = new StorageService();
