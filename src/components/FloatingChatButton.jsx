import { MessageCircle, Sparkles } from 'lucide-react';
import './FloatingChatButton.css';

export function FloatingChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="floating-chat-button"
      aria-label="Real Estate Companion"
    >
      <div className="button-content">
        <Sparkles className="sparkle-icon" size={16} />
        <MessageCircle className="chat-icon" size={24} />
      </div>
      <div className="button-tooltip">
        Real Estate Companion
      </div>
    </button>
  );
}
