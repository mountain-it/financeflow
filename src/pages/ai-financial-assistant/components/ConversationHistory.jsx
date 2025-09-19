import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import chatService from '../../../services/chatService';
import { useAuth } from '../../../contexts/AuthContext';

const ConversationHistory = ({ isVisible, onConversationSelect, onNewConversation, currentConversationId, onArchived, onClose }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Archived modal state
  const [showArchived, setShowArchived] = useState(false);
  const [archived, setArchived] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [archivedError, setArchivedError] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const list = await chatService.listConversations(user.id);
        setConversations(list);
      } catch (e) {
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const handleArchive = async (conversationId, e) => {
    e?.stopPropagation();
    if (!conversationId) return;
    try {
      await chatService.archiveConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      onArchived?.(conversationId);
    } catch (err) {
      setError('Failed to archive conversation');
    }
  };

  const handleDelete = async (conversationId, e) => {
    e?.stopPropagation();
    if (!conversationId) return;
    const confirmed = window.confirm('Delete this conversation permanently? This cannot be undone.');
    if (!confirmed) return;
    try {
      await chatService.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      onArchived?.(conversationId);
    } catch (err) {
      setError('Failed to delete conversation');
    }
  };

  // Load archived conversations
  const openArchived = async () => {
    setShowArchived(true);
    setLoadingArchived(true);
    setArchivedError(null);
    try {
      const list = await chatService.listConversations(user.id, { includeArchived: true });
      setArchived((list || []).filter((c) => c.is_archived));
    } catch (err) {
      setArchivedError('Failed to load archived conversations');
    } finally {
      setLoadingArchived(false);
    }
  };

  const handleUnarchive = async (conversationId) => {
    try {
      const updated = await chatService.unarchiveConversation(conversationId);
      setArchived((prev) => prev.filter((c) => c.id !== conversationId));
      // Add back to active list at top
      setConversations((prev) => [updated, ...prev.filter((c) => c.id !== conversationId)]);
    } catch (err) {
      setArchivedError('Failed to unarchive conversation');
    }
  };

  const filteredConversations = (conversations || []).filter((conv) => {
    const title = (conv?.title || 'Untitled').toLowerCase();
    return title.includes((searchQuery || '').toLowerCase());
  });

  const formatTimestamp = (ts) => {
    try {
      const timestamp = new Date(ts || Date.now());
      const now = new Date();
      const diff = now - timestamp;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff / (1000 * 60));
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    } catch { return ''; }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full md:w-72 xl:w-80 border-r border-border bg-card flex flex-col flex-shrink-0 h-full fixed inset-0 z-40 md:static md:inset-auto md:z-auto md:flex">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Conversations</h3>
          <Button variant="ghost" size="icon" onClick={onNewConversation} title="New conversation">
            <Icon name="Plus" size={16} />
          </Button>
          {/* Mobile close button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted/50"
            title="Close"
            onClick={() => onClose?.()}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <Input
          type="search"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          className="w-full"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-sm text-muted-foreground">Loading conversations.</div>
        )}
        {error && (
          <div className="p-4 text-sm text-error">{error}</div>
        )}

        <div className="p-2 space-y-1">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onConversationSelect(conversation)}
              className={`w-full p-3 rounded-lg hover:bg-muted/50 financial-transition text-left group ${
                currentConversationId === conversation.id ? 'bg-muted/40 border border-border' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm text-foreground group-hover:text-primary financial-transition line-clamp-1">
                    {conversation.title || 'Untitled'}
                  </h4>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatTimestamp(conversation.updated_at || conversation.created_at)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {/* Placeholder for last message preview (optional) */}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full font-medium text-muted-foreground bg-muted/10">
                    General
                  </span>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <button
                      title="Archive conversation"
                      onClick={(e) => handleArchive(conversation.id, e)}
                      className="p-1 rounded hover:bg-muted/60"
                    >
                      <Icon name="Archive" size={12} />
                    </button>
                    <button
                      title="Delete conversation"
                      onClick={(e) => handleDelete(conversation.id, e)}
                      className="p-1 rounded hover:bg-muted/60 text-error"
                    >
                      <Icon name="Trash" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredConversations.length === 0 && !loading && (
          <div className="p-8 text-center">
            <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No conversations found</p>
            <p className="text-xs text-muted-foreground mt-1">Create a new conversation to start</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full" onClick={openArchived}>
          <Icon name="Archive" size={16} className="mr-2" />
          View Archived
        </Button>
      </div>

      {/* Archived Modal */}
      {showArchived && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowArchived(false)} />
          <div className="relative z-50 w-full max-w-md bg-popover text-popover-foreground border border-border rounded-lg financial-shadow-modal">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Archived Conversations</h3>
              <button className="p-2 rounded hover:bg-muted financial-transition" onClick={() => setShowArchived(false)}>
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loadingArchived && (
                <div className="p-4 text-sm text-muted-foreground">Loading archived…</div>
              )}
              {archivedError && (
                <div className="p-4 text-sm text-error">{archivedError}</div>
              )}
              {!loadingArchived && archived.length === 0 && !archivedError && (
                <div className="p-6 text-sm text-muted-foreground text-center">No archived conversations</div>
              )}
              {archived.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 financial-transition">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-medium truncate">{conv.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground">Updated {new Date(conv.updated_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleUnarchive(conv.id)} title="Unarchive">
                      <Icon name="ArchiveRestore" size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setShowArchived(false); onConversationSelect?.(conv); }} title="Open">
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => setShowArchived(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;
