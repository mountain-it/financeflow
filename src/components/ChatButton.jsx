import React from 'react';
import { FiMessageSquare } from 'react-icons/fi';

const ChatButton = () => {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
      >
        <FiMessageSquare className="text-xl" />
      </button>

      {isChatOpen && (
        <div className="absolute bottom-16 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-lg">AI Financial Assistant</h3>
            <p className="text-gray-600">Ask me anything about your finances</p>
          </div>
          <div className="p-4">
            {/* Chat conversation will appear here */}
          </div>
          <div className="p-4 border-t border-gray-200 flex items-center">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="ml-2 bg-indigo-600 text-white rounded-full p-2">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;