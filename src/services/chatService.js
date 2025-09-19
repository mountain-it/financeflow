import { supabase } from "../lib/supabase";

const chatService = {
  async listConversations(userId, { includeArchived = false } = {}) {
    const query = supabase
      .from("ai_conversations")
      .select("id, title, is_archived, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (!includeArchived) query.eq("is_archived", false);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createConversation(userId, { title = null } = {}) {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert([{ user_id: userId, title }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async archiveConversation(conversationId) {
    const { data, error } = await supabase
      .from("ai_conversations")
      .update({ is_archived: true })
      .eq("id", conversationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unarchiveConversation(conversationId) {
    const { data, error } = await supabase
      .from("ai_conversations")
      .update({ is_archived: false })
      .eq("id", conversationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteConversation(conversationId) {
    // Cascade deletes ai_messages due to FK ON DELETE CASCADE
    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", conversationId);
    if (error) throw error;
    return true;
  },

  async updateConversationTitle(conversationId, title) {
    const { data, error } = await supabase
      .from("ai_conversations")
      .update({ title })
      .eq("id", conversationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listMessages(conversationId) {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("id, role, content, type, quick_actions, provider, metadata, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addMessage(conversationId, userId, { role, content, type = "text", quickActions = null, provider = null, metadata = null }) {
    const row = {
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
      type,
      quick_actions: quickActions,
      provider,
      metadata,
    };
    const { data, error } = await supabase
      .from("ai_messages")
      .insert([row])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default chatService;
