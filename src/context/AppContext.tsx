import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Post, MarketItem, MasterService, MapMarker, 
  HouseChat, NeighborhoodInfo, CategoryType 
} from '../types';
import { 
  currentUser as initialUser, 
  currentNeighborhood as initialNeighborhood, 
  availableNeighborhoods,
  initialPosts, 
  initialMarketItems, 
  initialMasters, 
  initialMapMarkers, 
  initialHouseChats 
} from '../mockData';
import { fetchCloudData, syncPostsToCloud } from '../services/cloudSync';

export type TabType = 'feed' | 'market' | 'masters' | 'map' | 'chats' | 'profile';
export type RadiusScope = 'house' | 'complex' | 'district' | 'city';

interface AppContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  currentNeighborhood: NeighborhoodInfo;
  setCurrentNeighborhood: (n: NeighborhoodInfo) => void;
  availableNeighborhoods: NeighborhoodInfo[];
  
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  feedCategory: CategoryType;
  setFeedCategory: (cat: CategoryType) => void;
  
  radiusScope: RadiusScope;
  setRadiusScope: (scope: RadiusScope) => void;

  posts: Post[];
  addPost: (newPost: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => Promise<void>;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  votePoll: (postId: string, optionId: string) => void;

  marketItems: MarketItem[];
  addMarketItem: (item: Omit<MarketItem, 'id' | 'date' | 'views'>) => void;
  marketFilter: string;
  setMarketFilter: (filter: string) => void;

  masters: MasterService[];
  masterCategoryFilter: string;
  setMasterCategoryFilter: (cat: string) => void;

  chats: HouseChat[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  sendMessageToChat: (chatId: string, text: string) => void;

  mapMarkers: MapMarker[];
  completeVerification: (address?: string, building?: string, entrance?: number, apartment?: number) => void;

  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;
  isCreateMarketModalOpen: boolean;
  setIsCreateMarketModalOpen: (open: boolean) => void;
  isRegisteringView: boolean;
  setIsRegisteringView: (registering: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('sosedi_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [currentNeighborhood, setCurrentNeighborhood] = useState<NeighborhoodInfo>(initialNeighborhood);
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [feedCategory, setFeedCategory] = useState<CategoryType>('all');
  const [radiusScope, setRadiusScope] = useState<RadiusScope>('complex');

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('sosedi_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialPosts;
  });

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    try {
      const saved = localStorage.getItem('sosedi_market');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialMarketItems;
  });

  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [masters] = useState<MasterService[]>(initialMasters);
  const [masterCategoryFilter, setMasterCategoryFilter] = useState<string>('all');

  const [chats, setChats] = useState<HouseChat[]>(() => {
    const saved = localStorage.getItem('sosedi_chats');
    return saved ? JSON.parse(saved) : initialHouseChats;
  });
  const [activeChatId, setActiveChatId] = useState<string>('chat_house');
  const [mapMarkers] = useState<MapMarker[]>(initialMapMarkers);

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState<boolean>(false);
  const [isCreateMarketModalOpen, setIsCreateMarketModalOpen] = useState<boolean>(false);
  const [isRegisteringView, setIsRegisteringView] = useState<boolean>(false);

  // Sync user profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sosedi_user', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for user profile', e);
    }
  }, [user]);

  // Cloud Data Sync Integration with Double-Lock Persistence
  useEffect(() => {
    const syncFromCloud = async () => {
      const cloud = await fetchCloudData();
      if (!cloud) return;

      // Always read latest local storage posts
      let currentLocalPosts: Post[] = [];
      try {
        const saved = localStorage.getItem('sosedi_posts');
        if (saved) currentLocalPosts = JSON.parse(saved);
      } catch (e) {}

      if (cloud.posts && Array.isArray(cloud.posts)) {
        setPosts(prev => {
          const map = new Map<string, Post>();
          // 1. Add currentLocalPosts (preserves new user posts!)
          currentLocalPosts.forEach(p => map.set(p.id, p));
          // 2. Add prev state
          prev.forEach(p => map.set(p.id, p));
          // 3. Add cloud posts
          cloud.posts.forEach(p => {
            if (!map.has(p.id)) map.set(p.id, p);
          });

          const all = Array.from(map.values());
          all.sort((a, b) => {
            if (a.id.startsWith('p_') && b.id.startsWith('p_')) {
              return b.id.localeCompare(a.id);
            }
            if (a.id.startsWith('p_')) return -1;
            if (b.id.startsWith('p_')) return 1;
            return 0;
          });
          return all;
        });
      }

      if (cloud.marketItems && Array.isArray(cloud.marketItems)) {
        setMarketItems(prev => {
          const map = new Map<string, MarketItem>();
          prev.forEach(m => map.set(m.id, m));
          cloud.marketItems.forEach(m => {
            if (!map.has(m.id)) map.set(m.id, m);
          });
          return Array.from(map.values());
        });
      }
    };

    syncFromCloud();
    const interval = setInterval(syncFromCloud, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sosedi_posts', JSON.stringify(posts));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for posts', e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('sosedi_market', JSON.stringify(marketItems));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for market', e);
    }
  }, [marketItems]);

  useEffect(() => {
    try {
      localStorage.setItem('sosedi_chats', JSON.stringify(chats));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for chats', e);
    }
  }, [chats]);

  const addPost = async (newPostData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>): Promise<void> => {
    const newPost: Post = {
      ...newPostData,
      id: `p_${Date.now()}`,
      timestamp: 'Только что',
      likes: 0,
      userLiked: false,
      comments: [],
    };
    const updated = [newPost, ...posts];
    setPosts(updated);

    // Instant synchronous LocalStorage save
    try {
      localStorage.setItem('sosedi_posts', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error in addPost', e);
    }

    // Cloud push
    await syncPostsToCloud(updated, marketItems);
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const userLiked = !p.userLiked;
          return {
            ...p,
            userLiked,
            likes: userLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      });
      syncPostsToCloud(updated, marketItems);
      return updated;
    });
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            authorName: user.name,
            authorAvatar: user.avatar,
            authorAddress: `${user.building}, Подъезд ${user.entrance}`,
            verified: user.verified,
            content,
            timestamp: 'Только что',
            likes: 0,
          };
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      });
      syncPostsToCloud(updated, marketItems);
      return updated;
    });
  };

  const votePoll = (postId: string, optionId: string) => {
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId && p.poll && !p.poll.userVotedOptionId) {
          const updatedOptions = p.poll.options.map(opt => 
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...p,
            poll: {
              ...p.poll,
              options: updatedOptions,
              totalVotes: p.poll.totalVotes + 1,
              userVotedOptionId: optionId,
            },
          };
        }
        return p;
      });
      syncPostsToCloud(updated, marketItems);
      return updated;
    });
  };

  const addMarketItem = (itemData: Omit<MarketItem, 'id' | 'date' | 'views'>) => {
    const newItem: MarketItem = {
      ...itemData,
      id: `m_${Date.now()}`,
      date: 'Только что',
      views: 1,
    };
    const updated = [newItem, ...marketItems];
    setMarketItems(updated);
    syncPostsToCloud(posts, updated);
  };

  const sendMessageToChat = (chatId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg = {
      id: `cm_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderAddress: `кв. ${user.apartment}`,
      verified: user.verified,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          unreadCount: 0,
        };
      }
      return c;
    }));
  };

  const completeVerification = (address?: string, building?: string, entrance?: number, apartment?: number) => {
    setUser(prev => ({
      ...prev,
      verified: true,
      verifiedMethod: 'Верифицирован через Росреестр / Госуслуги',
      address: address || prev.address,
      building: building || prev.building,
      entrance: entrance || prev.entrance,
      apartment: apartment || prev.apartment,
    }));
    setIsVerificationModalOpen(false);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      currentNeighborhood,
      setCurrentNeighborhood,
      availableNeighborhoods,
      activeTab,
      setActiveTab,
      feedCategory,
      setFeedCategory,
      radiusScope,
      setRadiusScope,
      posts,
      addPost,
      toggleLikePost,
      addComment,
      votePoll,
      marketItems,
      addMarketItem,
      marketFilter,
      setMarketFilter,
      masters,
      masterCategoryFilter,
      setMasterCategoryFilter,
      chats,
      activeChatId,
      setActiveChatId,
      sendMessageToChat,
      mapMarkers,
      completeVerification,
      isVerificationModalOpen,
      setIsVerificationModalOpen,
      isCreatePostModalOpen,
      setIsCreatePostModalOpen,
      isCreateMarketModalOpen,
      setIsCreateMarketModalOpen,
      isRegisteringView,
      setIsRegisteringView
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
