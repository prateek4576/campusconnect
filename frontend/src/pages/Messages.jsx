import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import MessageSkeleton from "../components/MessageSkeleton";

export default function Messages() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const loadMessages = async () => {
    try {
      const { data } = await api.get("/messages");
      setMessages(data || []);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  /*
   * Group messages by item.
   */
  const conversations = {};

  messages.forEach((msg) => {
    if (!conversations[msg.conversation_id]) {
      conversations[msg.conversation_id] = [];
    }

    conversations[msg.conversation_id].push(msg);
  });

  const conversationList = Object.entries(conversations)
    .map(([conversationId, msgs]) => ({
      conversationId,
      messages: msgs,
      lastMessage: msgs[msgs.length - 1],
    }))
    .sort(
      (a, b) =>
        new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at),
    );

  if (selectedConversation) {
    return (
      <ChatWindow
        conversationId={selectedConversation}
        user={user}
        onBack={() => {
          setSelectedConversation(null);
          loadMessages();
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="border-b-2 border-black pb-6 mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-[#E9C46A] text-black border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm brutal-press mb-3"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="font-display font-black text-4xl md:text-5xl uppercase">
          My Messages
        </h1>

        <p className="mt-3 text-lg">
          Chat with students about lost and found items.
        </p>
      </div>

      {loading ? (
  <div className="space-y-4">
    <MessageSkeleton />
    <MessageSkeleton />
    <MessageSkeleton />
  </div>
) : conversationList.length === 0 ? (
        <div className="bg-white border-2 border-black brutal-shadow-lg p-12 text-center">
          <MessageCircle size={45} className="mx-auto mb-4" />

          <h2 className="font-display font-black text-2xl uppercase">
            No messages yet
          </h2>

          <p className="mt-2">
            When someone contacts you about an item, the conversation will
            appear here.
          </p>

          <Link
            to="/items/lost"
            className="inline-block mt-5 bg-[#E9C46A] border-2 border-black px-5 py-3 brutal-shadow-sm brutal-press font-bold uppercase"
          >
            Browse Lost Items →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {conversationList.map((conversation) => {
            const last = conversation.lastMessage;

            const otherUser =
              last.sender_id === user?.id
                ? last.receiver_name
                : last.sender_name;

            const unreadCount = conversation.messages.filter(
              (msg) => msg.receiver_id === user?.id && msg.read !== true,
            ).length;

            return (
              <button
                key={conversation.conversationId}
                onClick={() =>
                  setSelectedConversation(conversation.conversationId)
                }
                className="relative w-full text-left bg-white border-2 border-black brutal-shadow-sm brutal-press p-5"
              >
                {/* ARROW */}
                <span className="absolute top-4 right-5 text-3xl font-bold">
                  →
                </span>

                {/* UNREAD COUNT */}
                {unreadCount > 0 && (
                  <span className="absolute top-12 right-5 bg-[#E63946] text-white border-2 border-black min-w-[28px] h-7 px-2 flex items-center justify-center font-black text-xs brutal-shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div>
                    <div className="font-display font-black text-xl uppercase">
                      {last.item_title || "Item Conversation"}
                    </div>

                    <div className="text-sm font-bold uppercase mt-1">
                      Conversation with {otherUser}
                    </div>

                    <p className="mt-2 text-sm line-clamp-2">{last.message}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================================================= */
/* CHAT WINDOW */
/* ================================================= */

function ChatWindow({ conversationId, user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [item, setItem] = useState(null);
  const [sending, setSending] = useState(false);

  const loadChat = async () => {
    try {
      const { data } = await api.get(
        `/messages/conversation/${conversationId}`
      );

      setMessages(data || []);

      if (data?.length > 0) {
        setItem(data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const openChat = async () => {
      try {
        // Mark only THIS conversation as read
        await api.put(
          `/messages/conversation/${conversationId}/read`
        );

        // Load only THIS conversation
        await loadChat();
      } catch (error) {
        console.error(
          "Failed to open chat",
          error
        );
      }
    };

    openChat();

    const interval = setInterval(
      loadChat,
      3000
    );

    return () => clearInterval(interval);
  }, [conversationId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);

      await api.post("/messages", {
        item_id: messages[0]?.item_id,
        conversation_id: conversationId,
        message: message.trim(),
      });

      setMessage("");

      await loadChat();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Could not send message."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

      {/* BACK */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-5 font-bold uppercase text-sm"
      >
        <ArrowLeft size={18} />
        Back to Messages
      </button>

      <div className="bg-white border-2 border-black brutal-shadow-lg">

        {/* HEADER */}
        <div className="bg-[#2A9D8F] text-white border-b-2 border-black p-5">

          <div className="font-bold uppercase text-xs tracking-widest">
            Conversation
          </div>

          <h1 className="font-display font-black text-2xl uppercase mt-1">
            {item?.item_title || "Item Conversation"}
          </h1>

          {messages.length > 0 && (
            <div className="text-xs uppercase font-bold mt-1">
              With{" "}
              {messages[0].sender_id === user?.id
                ? messages[0].receiver_name
                : messages[0].sender_name}
            </div>
          )}

        </div>

        {/* MESSAGES */}
        <div className="p-5 min-h-[400px] max-h-[550px] overflow-y-auto space-y-4">

          {messages.length === 0 ? (

            <div className="text-center py-20">
              <p className="font-bold uppercase">
                No messages yet
              </p>
            </div>

          ) : (

            messages.map((msg) => {

              const mine =
                msg.sender_id === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    mine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[80%] border-2 border-black p-4 ${
                      mine
                        ? "bg-[#E9C46A]"
                        : "bg-[#FDFBF7]"
                    }`}
                  >

                    <div className="font-bold text-xs uppercase mb-1">
                      {mine
                        ? "You"
                        : msg.sender_name}
                    </div>

                    <p className="text-sm">
                      {msg.message}
                    </p>

                    <div className="text-[10px] uppercase mt-3 pt-2 border-t-2 border-black opacity-60">

                      {new Date(
                        msg.created_at
                      ).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}

                    </div>

                  </div>

                </div>
              );
            })

          )}

        </div>

        {/* INPUT */}
        <div className="border-t-2 border-black p-4">

          <div className="flex gap-3">

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={2}
              placeholder="Type your message..."
              className="flex-1 border-2 border-black px-3 py-3 resize-none"
            />

            <button
              onClick={sendMessage}
              disabled={
                sending ||
                !message.trim()
              }
              className="bg-[#2A9D8F] text-white border-2 border-black px-5 brutal-shadow-sm brutal-press font-bold uppercase disabled:opacity-50"
            >
              {sending ? "..." : "Send"}
            </button>

          </div>

          <p className="text-[10px] uppercase mt-2 opacity-60">
            Press Enter to send • Shift + Enter for new line
          </p>

        </div>

      </div>

    </div>
  );
}