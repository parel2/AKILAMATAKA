import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import PhotoOrPlaceholder from '@/components/PhotoOrPlaceholder';
import { CONTENT } from '@/data/content';
import { chatProfilePhoto } from '@/data/photos';
import { haptics } from '@/core/haptics';

interface ChatMessage {
  from: 'them' | 'me';
  text: string;
}

interface Scene03ChatProps {
  onDone: () => void;
}

export default function Scene03Chat({ onDone }: Scene03ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  const [waitingReply, setWaitingReply] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const transitionRef = useRef<number | null>(null);

  const script = CONTENT.chat.script;

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (turnIndex >= script.length) return;
    setTyping(true);
    setWaitingReply(false);

    const currentTurn = script[turnIndex];

    typingTimerRef.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { from: 'them', text: currentTurn.text }]);

      if (currentTurn.replies.length === 0) {
        transitionRef.current = window.setTimeout(() => {
          onDoneRef.current();
        }, 2000);
      } else {
        setTimeout(() => setWaitingReply(true), 400);
      }
    }, 1400);

    return () => {
      if (typingTimerRef.current !== null) clearTimeout(typingTimerRef.current);
    };
  }, [turnIndex, script]);

  const handleReply = (replyText: string, nextText: string) => {
    haptics(10);
    setMessages((prev) => [...prev, { from: 'me', text: replyText }]);
    setWaitingReply(false);

    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { from: 'them', text: nextText }]);
        setTimeout(() => {
          setTurnIndex((prev) => prev + 1);
        }, 800);
      }, 1200);
    }, 600);
  };

  const currentTurn = script[turnIndex];

  return (
    <SceneShell
      background="linear-gradient(170deg, #FFF5F7 0%, #FFE4EA 100%)"
      scrollable
    >
      <div className="w-full max-w-sm flex flex-col" style={{ height: '70vh' }}>
        {/* Chat header */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-soft mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-rose-300 to-rose-500 flex items-center justify-center border-2 border-white shadow-soft">
            <PhotoOrPlaceholder
              src={chatProfilePhoto ?? ''}
              alt="Foto profil Parel"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-display text-base text-ink">{CONTENT.chat.headerName}</p>
            <p className="font-body text-xs text-rose-400">
              {typing ? CONTENT.chat.headerStatus : 'online'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollable rounded-2xl bg-white/40 backdrop-blur-sm p-3 space-y-2"
        >
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl font-body text-sm ${
                    msg.from === 'me'
                      ? 'bg-rose-500 text-white rounded-br-md'
                      : 'bg-white text-ink rounded-bl-md shadow-soft'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl rounded-bl-md shadow-soft px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-rose-300"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick replies */}
        {waitingReply && currentTurn && currentTurn.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-3 flex flex-wrap gap-2"
          >
            {currentTurn.replies.map((reply, i) => (
              <button
                key={i}
                onPointerDown={() => handleReply(reply.text, reply.next)}
                className="px-4 py-2.5 rounded-full bg-white text-ink font-body text-sm shadow-soft border-2 border-rose-100 active:scale-90 transition-transform"
              >
                {reply.text}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </SceneShell>
  );
}
