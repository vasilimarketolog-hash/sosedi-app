import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Post, Comment, MarketItem, MasterService, MapMarker, 
  HouseChat, NeighborhoodInfo, CategoryType 
} from '../types';
import { 
  currentNeighborhood as initialNeighborhood, 
  availableNeighborhoods,
  initialPosts, 
  initialMarketItems, 
  initialMasters, 
  initialMapMarkers, 
  initialHouseChats 
} from '../mockData';
import { fetchCloudData, syncPostsToCloud, deletePostFromCloud, syncChatsToCloud } from '../services/cloudSync';

export type TabType = 'feed' | 'market' | 'masters' | 'map' | 'chats' | 'profile';
export type RadiusScope = 'house' | 'complex' | 'district' | 'city';

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
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
  deletePost: (postId: string) => Promise<void>;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string, replyToUser?: string) => void;
  votePoll: (postId: string, optionId: string) => void;

  focusedPostId: string | null;
  setFocusedPostId: (id: string | null) => void;

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
  openDirectChat: (authorName: string, authorAvatar?: string, authorAddress?: string) => void;

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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sosedi_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse sosedi_user from localStorage', e);
    }
    return null; // Guest by default! Reading mode until registration.
  });

  const [currentNeighborhood, setCurrentNeighborhood] = useState<NeighborhoodInfo>(initialNeighborhood);
  const [activeTab, setActiveTabState] = useState<TabType>('feed');
  const [feedCategory, setFeedCategory] = useState<CategoryType>('all');
  const [radiusScope, setRadiusScope] = useState<RadiusScope>('complex');
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);

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
    try {
      const saved = localStorage.getItem('sosedi_chats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse sosedi_chats from localStorage', e);
    }
    return initialHouseChats;
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
      if (user) {
        localStorage.setItem('sosedi_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('sosedi_user');
      }
    } catch (e) {
      console.warn('LocalStorage quota exceeded for user profile', e);
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('sosedi_user');
    } catch (e) {}
  };

  // Hash router & Deep Linking: #feed, #market, #masters, #map, #chats, #profile, #post/id
  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${tab}`;
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      if (!rawHash) return;

      if (rawHash.startsWith('post/')) {
        const postId = rawHash.replace('post/', '');
        setActiveTabState('feed');
        setFocusedPostId(postId);
        return;
      }

      const validTabs: TabType[] = ['feed', 'market', 'masters', 'map', 'chats', 'profile'];
      if (validTabs.includes(rawHash as TabType)) {
        setActiveTabState(rawHash as TabType);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Cloud Data Sync Integration with Smart Comment, Post & Chat Merging
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

      // Get local voted polls map
      let localVotedPolls: Record<string, string> = {};
      try {
        const savedVotes = localStorage.getItem('sosedi_voted_polls');
        if (savedVotes) localVotedPolls = JSON.parse(savedVotes);
      } catch (e) {}

      if (cloud.posts && Array.isArray(cloud.posts)) {
        setPosts(prev => {
          const map = new Map<string, Post>();

          // 1. Add local posts
          currentLocalPosts.forEach(p => map.set(p.id, p));
          // 2. Add prev state
          prev.forEach(p => map.set(p.id, p));

          // 3. Smart merge cloud posts & comments
          cloud.posts.forEach(p => {
            const existing = map.get(p.id);
            if (!existing) {
              const userVoted = localVotedPolls[p.id];
              map.set(p.id, {
                ...p,
                userLiked: Boolean(user && Array.isArray(p.likedBy) && p.likedBy.includes(user.id)),
                poll: p.poll ? {
                  ...p.poll,
                  userVotedOptionId: userVoted || p.poll.userVotedOptionId
                } : undefined
              });
            } else {
              const commentMap = new Map();
              (existing.comments || []).forEach((c: any) => commentMap.set(c.id, c));
              (p.comments || []).forEach((c: any) => commentMap.set(c.id, c));

              const likedBySet = new Set([
                ...(Array.isArray(existing.likedBy) ? existing.likedBy : []),
                ...(Array.isArray(p.likedBy) ? p.likedBy : [])
              ]);
              const mergedLikedBy = Array.from(likedBySet);
              const isLiked = Boolean(user && mergedLikedBy.includes(user.id)) || Boolean(existing.userLiked);

              // Merge polls
              let mergedPoll = existing.poll || p.poll;
              if (existing.poll && p.poll) {
                const totalVotes = Math.max(existing.poll.totalVotes || 0, p.poll.totalVotes || 0);
                const mergedOptions = (p.poll.options || []).map((opt: any) => {
                  const exOpt = (existing.poll?.options || []).find((o: any) => o.id === opt.id);
                  return {
                    ...opt,
                    votes: Math.max(opt.votes || 0, exOpt ? exOpt.votes || 0 : 0)
                  };
                });
                mergedPoll = {
                  ...p.poll,
                  options: mergedOptions,
                  totalVotes,
                  userVotedOptionId: localVotedPolls[p.id] || existing.poll.userVotedOptionId || p.poll.userVotedOptionId
                };
              }

              map.set(p.id, {
                ...existing,
                ...p,
                poll: mergedPoll,
                likedBy: mergedLikedBy,
                userLiked: isLiked,
                likes: Math.max(mergedLikedBy.length, existing.likes || 0, p.likes || 0),
                comments: Array.from(commentMap.values()),
              });
            }
          });

          const getPostTime = (p: any): number => {
            if (!p) return 0;
            if (p.createdAt) {
              const t = new Date(p.createdAt).getTime();
              if (!isNaN(t)) return t;
            }
            if (p.id) {
              const matches = String(p.id).match(/\d+/g);
              if (matches && matches.length > 0) {
                let maxNum = 0;
                for (const m of matches) {
                  const val = Number(m);
                  if (val > maxNum) maxNum = val;
                }
                if (maxNum > 100000000) return maxNum;
                return 100000 - maxNum;
              }
            }
            return 0;
          };

          const all = Array.from(map.values());
          all.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return getPostTime(b) - getPostTime(a);
          });

          return all;
        });
      }

      if (cloud.marketItems && Array.isArray(cloud.marketItems)) {
        setMarketItems(prev => {
          const map = new Map<string, MarketItem>();
          prev.forEach(m => map.set(m.id, m));
          cloud.marketItems.forEach(m => map.set(m.id, m));
          return Array.from(map.values());
        });
      }

      if (cloud.chats && Array.isArray(cloud.chats)) {
        setChats(prev => {
          const map = new Map<string, HouseChat>();
          prev.forEach(c => map.set(c.id, c));
          cloud.chats!.forEach(incChat => {
            const existing = map.get(incChat.id);
            if (!existing) {
              map.set(incChat.id, incChat);
            } else {
              const msgMap = new Map();
              (existing.messages || []).forEach((m: any) => msgMap.set(m.id, m));
              (incChat.messages || []).forEach((m: any) => msgMap.set(m.id, m));
              map.set(incChat.id, {
                ...existing,
                ...incChat,
                messages: Array.from(msgMap.values()),
              });
            }
          });
          return Array.from(map.values());
        });
      }
    };

    // Initial load
    syncFromCloud();

    // Poll every 30 seconds only if tab is visible (Task 9)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      syncFromCloud();
    }, 30000);

    // Sync immediately on focus or when switching back to tab
    const handleActive = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        syncFromCloud();
      }
    };

    window.addEventListener('visibilitychange', handleActive);
    window.addEventListener('focus', handleActive);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleActive);
      window.removeEventListener('focus', handleActive);
    };
  }, [user]);

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
    const nowIso = new Date().toISOString();
    const newPost: Post = {
      ...newPostData,
      id: `p_${Date.now()}`,
      createdAt: nowIso,
      timestamp: nowIso,
      likes: 0,
      likedBy: [],
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

  const deletePost = async (postId: string): Promise<void> => {
    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    try {
      localStorage.setItem('sosedi_posts', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error in deletePost', e);
    }
    await deletePostFromCloud(postId);
  };

  const toggleLikePost = (postId: string) => {
    if (!user) {
      setIsRegisteringView(true);
      return;
    }
    const currentUserId = user.id;

    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const likedBy = Array.isArray(p.likedBy) ? [...p.likedBy] : [];
          const hasLiked = likedBy.includes(currentUserId) || Boolean(p.userLiked);
          let newLikedBy: string[];
          if (hasLiked) {
            newLikedBy = likedBy.filter(id => id !== currentUserId);
          } else {
            newLikedBy = [...likedBy.filter(id => id !== currentUserId), currentUserId];
          }
          const isNowLiked = newLikedBy.includes(currentUserId);
          return {
            ...p,
            likedBy: newLikedBy,
            userLiked: isNowLiked,
            likes: Math.max(0, newLikedBy.length),
          };
        }
        return p;
      });
      syncPostsToCloud(updated, marketItems);
      return updated;
    });
  };

  const addComment = (postId: string, content: string, replyToUser?: string) => {
    if (!content.trim() || !user) return;
    const authorName = user.name;
    const authorAvatar = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
    const authorAddress = user.building ? `${user.building}, Подъезд ${user.entrance}` : 'Жилец дома';
    const verified = Boolean(user.verified);
    const nowIso = new Date().toISOString();

    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const newComment: Comment = {
            id: `c_${Date.now()}`,
            authorName,
            authorAvatar,
            authorAddress,
            verified,
            content,
            createdAt: nowIso,
            timestamp: nowIso,
            likes: 0,
            likedBy: [],
            replyToUser: replyToUser || undefined,
          };
          const existingComments = Array.isArray(p.comments) ? p.comments : [];
          return {
            ...p,
            comments: [...existingComments, newComment],
          };
        }
        return p;
      });
      try {
        localStorage.setItem('sosedi_posts', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error in addComment', e);
      }
      syncPostsToCloud(updated, marketItems);
      return updated;
    });
  };

  const votePoll = (postId: string, optionId: string) => {
    // Record user vote in local storage to prevent reset
    try {
      const savedVotes = localStorage.getItem('sosedi_voted_polls');
      const votesMap = savedVotes ? JSON.parse(savedVotes) : {};
      votesMap[postId] = optionId;
      localStorage.setItem('sosedi_voted_polls', JSON.stringify(votesMap));
    } catch (e) {}

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
    if (!user) {
      setIsRegisteringView(true);
      return;
    }

    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `cm_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      senderAddress: `кв. ${user.apartment || 1}`,
      verified: Boolean(user.verified),
      text,
      createdAt: nowIso,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats(prev => {
      let found = false;
      const updated = prev.map(c => {
        if (c.id === chatId) {
          found = true;
          return {
            ...c,
            messages: [...c.messages, newMsg],
            unreadCount: 0,
          };
        }
        return c;
      });

      let finalChats = updated;
      if (!found) {
        const fallbackChat: HouseChat = {
          id: chatId,
          name: 'Личный диалог',
          description: 'Диалог с соседом',
          icon: '💬',
          membersCount: 2,
          unreadCount: 0,
          type: 'direct',
          participants: [user.name],
          messages: [newMsg],
        };
        finalChats = [fallbackChat, ...prev];
      }

      // Sync to cloud immediately
      syncChatsToCloud(finalChats);
      try {
        localStorage.setItem('sosedi_chats', JSON.stringify(finalChats));
      } catch (e) {}

      return finalChats;
    });
  };

  const openDirectChat = (authorName: string, authorAvatar?: string, authorAddress?: string) => {
    if (!user) {
      setIsRegisteringView(true);
      return;
    }

    const currentUserName = user.name;
    if (authorName === currentUserName) return;

    // Symmetric deterministic Chat ID so both parties always see the same chat
    const sorted = [currentUserName, authorName].sort();
    const chatId = `chat_dm_${sorted[0].replace(/\s+/g, '_')}__${sorted[1].replace(/\s+/g, '_')}`;

    setChats(prev => {
      const existing = prev.find(c => c.id === chatId);
      if (existing) {
        return prev;
      }

      const newDirectChat: HouseChat = {
        id: chatId,
        name: authorName,
        description: `Личный диалог с соседом (${authorAddress || 'соседний дом'})`,
        icon: '💬',
        membersCount: 2,
        unreadCount: 0,
        type: 'direct',
        participants: [currentUserName, authorName],
        partnerInfo: {
          [currentUserName]: {
            name: currentUserName,
            avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            address: user.address,
          },
          [authorName]: {
            name: authorName,
            avatar: authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            address: authorAddress,
          }
        },
        participantAvatar: authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        participantAddress: authorAddress,
        messages: [
          {
            id: `msg_dm_init_${Date.now()}`,
            senderId: 'system',
            senderName: 'Соседи.Онлайн',
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            senderAddress: 'Система',
            verified: true,
            text: `Вы начали личный диалог с соседом ${authorName}. Напишите сообщение ниже.`,
            timestamp: 'Только что',
          }
        ]
      };
      const updated = [newDirectChat, ...prev];
      syncChatsToCloud(updated);
      try {
        localStorage.setItem('sosedi_chats', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setActiveChatId(chatId);
    setActiveTab('chats');
  };

  const completeVerification = (address?: string, building?: string, entrance?: number, apartment?: number) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        verified: true,
        verifiedMethod: 'Подтверждено соседями по квитанции',
        address: address || prev.address || 'ул. Леонардо да Винчи, 2',
        building: building || prev.building || 'ул. Леонардо да Винчи, 2',
        entrance: entrance || prev.entrance || 1,
        apartment: apartment || prev.apartment || 1,
      };
    });
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      logout,
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
      deletePost,
      toggleLikePost,
      addComment,
      votePoll,

      focusedPostId,
      setFocusedPostId,

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
      openDirectChat,

      mapMarkers,
      completeVerification,

      isVerificationModalOpen,
      setIsVerificationModalOpen,
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
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
