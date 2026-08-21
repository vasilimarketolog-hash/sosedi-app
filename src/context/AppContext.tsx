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
  addPost: (newPost: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
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
  
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  completeVerification: (address: string, building: string, entrance: number, apartment: number) => void;

  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;

  isCreateMarketModalOpen: boolean;
  setIsCreateMarketModalOpen: (open: boolean) => void;

  isRegisteringView: boolean;
  setIsRegisteringView: (open: boolean) => void;
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
    const saved = localStorage.getItem('sosedi_posts');
    return saved ? JSON.parse(saved) : initialPosts;
  });

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    const saved = localStorage.getItem('sosedi_market');
    return saved ? JSON.parse(saved) : initialMarketItems;
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

  useEffect(() => {
    try {
      localStorage.setItem('sosedi_user', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for user profile', e);
    }
  }, [user]);

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

  const addPost = (newPostData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => {
    const newPost: Post = {
      ...newPostData,
      id: `p_${Date.now()}`,
      timestamp: 'Только что',
      likes: 0,
      userLiked: false,
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const userLiked = !p.userLiked;
        return {
          ...p,
          userLiked,
          likes: userLiked ? p.likes + 1 : p.likes - 1,
        };
      }
      return p;
    }));
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    setPosts(prev => prev.map(p => {
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
    }));
  };

  const votePoll = (postId: string, optionId: string) => {
    setPosts(prev => prev.map(p => {
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
          }
        };
      }
      return p;
    }));
  };

  const addMarketItem = (itemData: Omit<MarketItem, 'id' | 'date' | 'views'>) => {
    const newItem: MarketItem = {
      ...itemData,
      id: `m_${Date.now()}`,
      date: 'Только что',
      views: 1,
    };
    setMarketItems([newItem, ...marketItems]);
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
        };
      }
      return c;
    }));
  };

  const completeVerification = (address: string, building: string, entrance: number, apartment: number) => {
    setUser(prev => ({
      ...prev,
      address,
      building,
      entrance,
      apartment,
      verified: true,
      verifiedMethod: 'Верифицировано через Росреестр / Госуслуги',
      thanksCount: prev.thanksCount + 10,
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
      isVerificationModalOpen,
      setIsVerificationModalOpen,
      completeVerification,
      isCreatePostModalOpen,
      setIsCreatePostModalOpen,
      isCreateMarketModalOpen,
      setIsCreateMarketModalOpen,
      isRegisteringView,
      setIsRegisteringView,
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
