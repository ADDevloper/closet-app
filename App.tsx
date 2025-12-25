
import React, { useState, useEffect } from 'react';
import { ClothingItem, Conversation, TabType, OutfitSuggestion, ScheduledOutfit } from './types';
import { storage } from './services/storage';
import Layout from './components/Layout';
import ClosetView from './components/ClosetView';
import ChatView from './components/ChatView';
import CalendarView from './components/CalendarView';
import AddItemModal from './components/AddItemModal';
import { generateId } from './utils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledOutfit[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | undefined>(undefined);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      const storedItems = await storage.getItems();
      const storedConvs = await storage.getConversations();
      const storedSchedule = await storage.getScheduledOutfits();
      setItems(storedItems.sort((a, b) => b.createdAt - a.createdAt));
      setConversations(storedConvs.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt));
      setScheduled(storedSchedule);
      
      // Auto-set latest conversation as active if none selected
      if (!activeConversationId && storedConvs.length > 0) {
        setActiveConversationId(storedConvs.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt)[0].id);
      }
    };
    loadData();
  }, []);

  const handleSaveItem = async (item: ClothingItem) => {
    await storage.saveItem(item);
    const updatedItems = await storage.getItems();
    setItems(updatedItems.sort((a, b) => b.createdAt - a.createdAt));
    setShowAddModal(false);
    setEditingItem(undefined);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to remove this item from your closet?')) {
      await storage.deleteItem(id);
      const updatedItems = await storage.getItems();
      setItems(updatedItems.sort((a, b) => b.createdAt - a.createdAt));
    }
  };

  const handleEditItem = (item: ClothingItem) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSaveConversation = async (conv: Conversation) => {
    await storage.saveConversation(conv);
    const updatedConvs = await storage.getConversations();
    setConversations(updatedConvs.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt));
    setActiveConversationId(conv.id);
  };

  const handleScheduleOutfit = async (outfit: OutfitSuggestion, date: string) => {
    const newSchedule: ScheduledOutfit = {
      id: generateId(),
      outfit,
      date,
      createdAt: Date.now()
    };
    await storage.saveScheduledOutfit(newSchedule);
    const updated = await storage.getScheduledOutfits();
    setScheduled(updated);
    alert(`Successfully planned "${outfit.name}" for ${date}!`);
  };

  const handleDeleteSchedule = async (id: string) => {
    await storage.deleteScheduledOutfit(id);
    const updated = await storage.getScheduledOutfits();
    setScheduled(updated);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOutfit = scheduled.find(s => s.date === todayStr);

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onAddClick={() => setShowAddModal(true)}
    >
      {activeTab === 'home' && (
        <ChatView 
          closet={items} 
          conversations={conversations} 
          onSaveConversation={handleSaveConversation}
          onScheduleOutfit={handleScheduleOutfit}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          todayOutfit={todayOutfit}
        />
      )}
      
      {activeTab === 'closet' && (
        <ClosetView 
          items={items} 
          onDeleteItem={handleDeleteItem} 
          onEditItem={handleEditItem}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarView 
          scheduled={scheduled}
          closet={items}
          onDeleteSchedule={handleDeleteSchedule}
        />
      )}

      {showAddModal && (
        <AddItemModal 
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(undefined);
          }}
          onSave={handleSaveItem}
          editItem={editingItem}
        />
      )}
    </Layout>
  );
};

export default App;
