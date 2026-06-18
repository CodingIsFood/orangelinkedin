'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ChatInterface({ initialConversations, currentUser, selectedConvoId }) {
  const supabase = createClient();
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedConvoId) {
      const convo = conversations.find(c => c.id === selectedConvoId);
      if (convo) {
        setActiveConvo(convo);
        fetchMessages(selectedConvoId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConvoId, conversations]);

  const fetchMessages = async (convoId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  useEffect(() => {
    if (!activeConvo) return;

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages_channel_${activeConvo.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvo.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvo, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConvo.id,
        sender_id: currentUser.id,
        text: msgText
      });
      
    if (error) {
      console.error('Error sending message:', error);
    } else {
      // Create a notification for the recipient
      await supabase.from('notifications').insert({
        user_id: activeConvo.partner.id,
        actor_id: currentUser.id,
        type: 'message',
        reference_id: activeConvo.id
      });
      
      // Update conversation updated_at
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeConvo.id);
    }
  };

  return (
    <div className="card glass-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0, marginTop: '1rem', marginBottom: '1rem' }}>
      
      {/* Sidebar: Conversation List */}
      <div style={{ width: '300px', borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Messages</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.9rem' }}>No conversations yet.</p>
          ) : (
            conversations.map(convo => (
              <div 
                key={convo.id} 
                onClick={() => router.push(`/messages?id=${convo.id}`)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--card-border)', 
                  cursor: 'pointer',
                  background: activeConvo?.id === convo.id ? 'rgba(255,107,0,0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                {convo.partner.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={convo.partner.avatar_url} alt={convo.partner.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {convo.partner.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{convo.partner.name}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main: Active Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
        {activeConvo ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)' }}>
              {activeConvo.partner.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeConvo.partner.avatar_url} alt={activeConvo.partner.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                  {activeConvo.partner.name?.charAt(0) || 'U'}
                </div>
              )}
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{activeConvo.partner.name}</h3>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Send a message to start the conversation.</p>
              ) : (
                messages.map(msg => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                      <div style={{ 
                        background: isMine ? 'var(--primary-orange)' : 'var(--secondary)', 
                        color: isMine ? 'white' : 'var(--foreground)',
                        padding: '0.8rem 1rem', 
                        borderRadius: isMine ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        fontSize: '0.95rem'
                      }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: isMine ? 'right' : 'left' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '24px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--foreground)', outline: 'none' }}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0.8rem 1.5rem' }} disabled={!newMessage.trim()}>
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>

    </div>
  );
}
