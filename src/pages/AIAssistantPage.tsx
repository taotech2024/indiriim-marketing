import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, Avatar, Paper, IconButton, useTheme, Skeleton } from '@mui/material';
import TablerIcon from '../components/Common/TablerIcon';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIAssistantPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Merhaba ${user?.name || ''}! Ben indiriim.com AI asistanıyım. Kampanya analizi, içerik üretimi veya raporlama konularında sana nasıl yardımcı olabilirim?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate LLM connection/initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateMockResponse(newMessage.text),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('kampanya')) {
      return "Son kampanyalarınızın performansı oldukça iyi görünüyor. Özellikle 'Yaz İndirimi' kampanyası %25 dönüşüm oranıyla öne çıkıyor. Yeni bir kampanya kurgulamak isterseniz hedef kitle önerilerinde bulunabilirim.";
    }
    if (lowerInput.includes('rapor') || lowerInput.includes('analiz')) {
      return "Son 7 günlük verilere göre, e-posta açılma oranlarınızda %5'lik bir artış var. Ancak SMS dönüşümlerinde hafif bir düşüş gözlemleniyor. SMS içeriklerinde daha kısa ve harekete geçirici mesajlar denemenizi öneririm.";
    }
    if (lowerInput.includes('merhaba') || lowerInput.includes('selam')) {
      return "Merhaba! Bugün size nasıl yardımcı olabilirim?";
    }
    return "Anladım. Bu konuda size detaylı bir analiz hazırlayabilirim. İsterseniz öncelikle hedef kitlenizi belirleyelim veya geçmiş veriler üzerinden bir taslak oluşturalım.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header Area */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TablerIcon name="Robot" size="md" color={theme.palette.primary.main} />
            AI Asistan
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Kampanya ve içerik süreçlerinizi yapay zeka ile hızlandırın.
          </Typography>
        </Box>
      </Box>

      {/* Chat Area */}
      <Paper 
        elevation={0}
        sx={{ 
          flex: 1, 
          bgcolor: 'background.paper', 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Messages List */}
        {loading ? (
          <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box sx={{ width: '70%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Skeleton variant="rounded" height={40} width="60%" />
                <Skeleton variant="rounded" height={20} width="90%" />
                <Skeleton variant="rounded" height={20} width="80%" />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {messages.map((msg) => (
              <Box 
                key={msg.id} 
                sx={{ 
                  display: 'flex', 
                  gap: 2,
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: msg.sender === 'user' ? 'secondary.main' : 'primary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  {msg.sender === 'user' ? <TablerIcon name="User" size="sm" color="white" /> : <TablerIcon name="Robot" size="sm" color="white" />}
                </Avatar>
                <Box 
                  sx={{ 
                    maxWidth: '70%',
                    bgcolor: msg.sender === 'user' 
                      ? (theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main')
                      : (theme.palette.mode === 'dark' ? 'background.default' : 'grey.100'),
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    p: 2,
                    borderRadius: 2,
                    borderTopRightRadius: msg.sender === 'user' ? 0 : 2,
                    borderTopLeftRadius: msg.sender === 'ai' ? 0 : 2,
                    boxShadow: msg.sender === 'ai' ? 'none' : '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {msg.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 1, 
                      opacity: 0.7, 
                      fontSize: '0.7rem',
                      textAlign: msg.sender === 'user' ? 'right' : 'left'
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            ))}
            
            {isTyping && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <TablerIcon name="Robot" size="sm" color="white" />
                </Avatar>
                <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100', p: 2, borderRadius: 2, borderTopLeftRadius: 0 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Skeleton variant="circular" width={8} height={8} sx={{ bgcolor: 'text.secondary' }} />
                    <Skeleton variant="circular" width={8} height={8} sx={{ bgcolor: 'text.secondary' }} />
                    <Skeleton variant="circular" width={8} height={8} sx={{ bgcolor: 'text.secondary' }} />
                  </Box>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}

        {/* Input Area */}
        <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder={loading ? "AI Asistan başlatılıyor..." : "Bir şeyler yazın..."}
              variant="outlined"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              multiline
              maxRows={4}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper'
                }
              }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping || loading}
              sx={{ 
                width: 50, 
                height: 50, 
                bgcolor: 'primary.main', 
                color: 'white',
                borderRadius: 3,
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
              }}
            >
              <TablerIcon name="Send" size="md" />
            </IconButton>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
            Yapay zeka asistanı hata yapabilir. Önemli bilgileri kontrol etmenizi öneririz.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AIAssistantPage;
