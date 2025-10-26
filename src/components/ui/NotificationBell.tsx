"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Check, Trash2 } from "lucide-react";
import { useUser } from "../../app/main/components/UserProvider";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationBell() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousUnreadCount = useRef(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const lastPlayedTimeRef = useRef<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, message: string) => {
    if (notificationPermission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/assets/images/Logo.jpg',
        badge: '/assets/images/Logo.jpg',
        tag: 'wise-attitude-notification',
        requireInteraction: false,
        silent: false
      });
    }
  }, [notificationPermission]);


  // Enable audio when user first interacts
  const enableAudio = useCallback(() => {
    if (audioRef.current && !audioEnabled) {
      // Try to play and pause immediately to enable audio
      audioRef.current.play().then(() => {
        setAudioEnabled(true);
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
      }).catch((error) => {
        console.log("Could not enable audio:", error);
      });
    }
  }, [audioEnabled]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    const now = Date.now();
    const timeSinceLastPlay = now - lastPlayedTimeRef.current;
    
    // ป้องกันการเล่นเสียงซ้ำภายใน 2 วินาที
    if (timeSinceLastPlay < 2000) {
      console.log("🔇 Sound blocked - too soon since last play:", timeSinceLastPlay, "ms");
      return;
    }
    
    console.log("🔊 Attempting to play notification sound, audioEnabled:", audioEnabled);
    if (audioRef.current) {
      lastPlayedTimeRef.current = now;
      
      // Try to enable audio first if not already enabled
      if (!audioEnabled) {
        audioRef.current.play().then(() => {
          setAudioEnabled(true);
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          // Now play the sound
          audioRef.current!.play().then(() => {
            console.log("✅ Notification sound played successfully (after enabling)");
          }).catch((error) => {
            console.log("❌ Could not play notification sound after enabling:", error);
          });
        }).catch((error) => {
          console.log("❌ Could not enable audio:", error);
        });
      } else {
        // Audio is already enabled, just play
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          console.log("✅ Notification sound played successfully");
        }).catch((error) => {
          console.log("❌ Could not play notification sound:", error);
        });
      }
    } else {
      console.log("❌ Cannot play sound - audioRef not available");
    }
  }, [audioEnabled]);

  // Connect to Server-Sent Events
  const connectToSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/notifications/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('🔗 Connected to notification stream');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received SSE data:', data);

        if (data.type === 'connected') {
          console.log('✅ SSE connection established');
        } else if (data.type === 'new_notification') {
          console.log('🔔 New notification received via SSE:', data.notifications);
          
          // อัปเดตการแจ้งเตือน
          if (data.notifications && data.notifications.length > 0) {
            setNotifications(prev => {
              const newNotifications = data.notifications.filter((newNotif: { id: string }) => 
                !prev.some((oldNotif: { id: string }) => oldNotif.id === newNotif.id)
              );
              
              if (newNotifications.length > 0) {
                console.log('🎵 Playing notification sound and showing browser notification');
                
                // เล่นเสียงและแสดง browser notification เพียงครั้งเดียว
                playNotificationSound();
                
                const latestNotification = newNotifications[0];
                if (latestNotification) {
                  showBrowserNotification(latestNotification.title, latestNotification.message);
                  
                  // อัปเดต lastNotificationId เพื่อป้องกันการเล่นเสียงซ้ำ
                  setLastNotificationId(latestNotification.id);
                }
                
                // อัปเดต unread count
                setUnreadCount(prev => prev + newNotifications.length);
              }
              
              return [...newNotifications, ...prev];
            });
          }
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsConnected(false);
      
      // ลองเชื่อมต่อใหม่หลังจาก 5 วินาที
      setTimeout(() => {
        if (user) {
          connectToSSE();
        }
      }, 5000);
    };

    return eventSource;
  }, [user, playNotificationSound, showBrowserNotification]);

  // Disconnect from Server-Sent Events
  const disconnectFromSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      console.log('🔌 Disconnected from notification stream');
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    // Don't fetch if user is not logged in
    if (!user) {
      console.log("NotificationBell: User not logged in, skipping fetch");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("NotificationBell: Fetching notifications for user:", user.name);
      
      const response = await fetch("/api/notifications", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: NotificationData = await response.json();
        
        // Check if there are new notifications by comparing counts and IDs
        const hasNewNotifications = data.notifications.length > notifications.length;
        const hasNewUnread = data.unreadCount > previousUnreadCount.current;
        const isFirstLoad = notifications.length === 0 && data.notifications.length > 0;
        
        // Check for new notifications by comparing IDs
        const latestNotification = data.notifications[0];
        const hasNewNotificationById = latestNotification && latestNotification.id !== lastNotificationId;
        
        setNotifications(data.notifications);
        
        // ไม่เล่นเสียงใน fetchNotifications เพราะจะเล่นใน SSE แทน
        // เก็บข้อมูลสำหรับ debug เท่านั้น
        console.log("🔍 Notification update (no sound):", {
          hasNewNotifications,
          hasNewUnread,
          hasNewNotificationById,
          isFirstLoad,
          lastNotificationId,
          currentNotificationId: latestNotification?.id,
          currentNotifications: notifications.length,
          newNotifications: data.notifications.length,
          currentUnread: previousUnreadCount.current,
          newUnread: data.unreadCount
        });
        
        // Update last notification ID (only if not already set by SSE)
        if (latestNotification && !lastNotificationId) {
          setLastNotificationId(latestNotification.id);
        }
        
        setUnreadCount(data.unreadCount);
        previousUnreadCount.current = data.unreadCount;
      } else if (response.status === 401) {
        // ไม่แสดง error เมื่อ user ไม่มี session (อาจจะ logout แล้ว)
        console.log("User not authenticated, skipping notifications");
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error("Failed to fetch notifications:", response.status, response.statusText);
        setError("ไม่สามารถโหลดการแจ้งเตือนได้");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
        setUnreadCount((prev) => {
          const deletedNotif = notifications.find((notif) => notif.id === notificationId);
          return deletedNotif && !deletedNotif.isRead ? prev - 1 : prev;
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/delete-all", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "เมื่อสักครู่";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LOAN_CREATED":
        return "📋";
      case "LOAN_RETURNED":
        return "✅";
      case "LOAN_OVERDUE":
        return "⚠️";
      case "LOAN_STATUS_CHANGED":
        return "🔄";
      case "ASSET_ADDED":
        return "📦";
      case "ASSET_UPDATED":
        return "🔄";
      case "SYSTEM":
        return "🔔";
      default:
        return "📢";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Auto-enable audio when component mounts
  useEffect(() => {
    if (audioRef.current && !audioEnabled) {
      // Try to enable audio automatically
      audioRef.current.play().then(() => {
        setAudioEnabled(true);
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
        console.log("✅ Audio enabled automatically on mount");
      }).catch((error) => {
        console.log("❌ Could not enable audio automatically:", error);
        // Try again after a short delay
        setTimeout(() => {
          if (audioRef.current && !audioEnabled) {
            audioRef.current.play().then(() => {
              setAudioEnabled(true);
              audioRef.current?.pause();
              audioRef.current!.currentTime = 0;
              console.log("✅ Audio enabled on retry");
            }).catch((retryError) => {
              console.log("❌ Could not enable audio on retry:", retryError);
            });
          }
        }, 1000);
      });
    }
  }, [audioEnabled]);

  // Connect to SSE when user is available
  useEffect(() => {
    if (user) {
      // ดึงข้อมูลการแจ้งเตือนครั้งแรก
      fetchNotifications();
      // เชื่อมต่อ SSE สำหรับ real-time updates
      connectToSSE();
    } else {
      // Disconnect เมื่อ user logout
      disconnectFromSSE();
    }

    // Cleanup เมื่อ component unmount
    return () => {
      disconnectFromSSE();
    };
  }, [user, fetchNotifications, connectToSSE, disconnectFromSSE]);

  // Set initial lastNotificationId when notifications are first loaded
  useEffect(() => {
    if (notifications.length > 0 && !lastNotificationId) {
      setLastNotificationId(notifications[0].id);
      console.log("🔔 Set initial lastNotificationId:", notifications[0].id);
    }
  }, [notifications, lastNotificationId]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user, fetchNotifications]);

  // ไม่มีการ refresh อัตโนมัติ - ตรวจสอบเฉพาะเมื่อเปิด dropdown

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sound/alert-message.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      {/* Bell Button */}
      <button
        onClick={() => {
          enableAudio();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">การแจ้งเตือน</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={fetchNotifications}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                disabled={loading}
              >
                <span>🔄</span>
                <span>{loading ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
              </button>
              <button
                onClick={deleteAllNotifications}
                className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                  unreadCount > 0 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                }`}
                disabled={loading || unreadCount > 0}
                title={unreadCount > 0 ? 'กรุณาอ่านการแจ้งเตือนทั้งหมดก่อน' : 'ลบการแจ้งเตือนทั้งหมด'}
              >
                <span>🗑️</span>
                <span>ลบทั้งหมด</span>
              </button>
            </div>
            {notifications.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                >
                  <Check size={14} />
                  <span>อ่านทั้งหมด</span>
                </button>
                <button
                  onClick={deleteAllNotifications}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                  <span>ลบ</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">กำลังโหลด...</div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="text-red-600 mb-2">{error}</div>
                <button
                  onClick={fetchNotifications}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  ลองใหม่
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                ไม่มีการแจ้งเตือน
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? "text-gray-900" : "text-gray-700"
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="ทำเครื่องหมายว่าอ่านแล้ว"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-800"
                            title="ลบ"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ปิด
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
