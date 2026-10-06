import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, CheckCheck, Clock, FileText, Calendar, ShieldAlert, CheckCircle } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, onSelectCase }) => {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  const myNotifications = notifications.filter((n) => {
    if (!currentUser) return false;
    if (n.recipientId === currentUser.id) return true;
    if (currentUser.role === 'admin' && (n.recipientRole === 'admin' || n.recipientId === 'all_admins')) return true;
    if (n.recipientRole === 'all') return true;
    return false;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'hearing':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'application':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'assignment':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Legal System Notifications</h3>
              <p className="text-xs text-slate-400">
                {myNotifications.filter((n) => !n.read).length} unread alerts for {currentUser?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-slate-800 transition"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {myNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-sm font-medium text-slate-600">No Notifications</p>
              <p className="text-xs text-slate-400 mt-1">You are all caught up on case alerts and docket notices.</p>
            </div>
          ) : (
            myNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationRead(notif.id);
                  if (notif.caseId && onSelectCase) {
                    onSelectCase(notif.caseId);
                    onClose();
                  }
                }}
                className={`py-3.5 px-3 rounded-xl transition cursor-pointer flex gap-3 text-left ${
                  notif.read ? 'hover:bg-slate-50 opacity-80' : 'bg-amber-50/50 hover:bg-amber-50 border-l-4 border-amber-500'
                }`}
              >
                <div className="mt-0.5 p-2 rounded-lg bg-white shadow-sm border border-slate-100 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4
                      className={`text-sm leading-tight ${
                        notif.read ? 'font-medium text-slate-800' : 'font-bold text-slate-900'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {notif.caseId && (
                      <span className="text-amber-700 font-medium hover:underline">View Matter Details →</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-4 py-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            Close Notification Center
          </button>
        </div>
      </div>
    </div>
  );
};
