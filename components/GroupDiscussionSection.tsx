
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Sender } from '../types';
import { continueGroupDiscussion } from '../services/geminiService';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ImageIcon } from './icons/ImageIcon';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const SenderAvatar: React.FC<{ sender: Sender }> = ({ sender }) => {
    const getAvatarDetails = () => {
        switch (sender) {
            case 'User': return { initial: 'U', color: 'bg-sky-500' };
            case 'Aisha': return { initial: 'A', color: 'bg-emerald-500' };
            case 'Rohan': return { initial: 'R', color: 'bg-purple-500' };
            case 'System': return { initial: 'S', color: 'bg-slate-500' };
            default: return { initial: '?', color: 'bg-gray-400' };
        }
    };
    const { initial, color } = getAvatarDetails();
    return (
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ${color}`}>
            {initial}
        </div>
    );
};

const GroupDiscussionSection: React.FC = () => {
  const [topic, setTopic] = useState<string>('The role of technology in Indian agriculture.');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [discussionStarted, setDiscussionStarted] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartDiscussion = () => {
    if (!topic.trim()) {
        setError('Please enter a discussion topic.');
        return;
    }
    setError(null);
    setMessages([{ sender: 'System', text: `Discussion started on the topic: "${topic}". You can start by sharing your opening thoughts.` }]);
    setDiscussionStarted(true);
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;
    
    const newUserMessage: Message = { sender: 'User', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    
    let base64Image: string | undefined;
    let mimeType: string | undefined;

    if (imageFile) {
      try {
        base64Image = await fileToBase64(imageFile);
        mimeType = imageFile.type;
        setImageFile(null);
        setImagePreview(null);
      } catch (e) {
        setError("Failed to process image.");
        setIsLoading(false);
        return;
      }
    }
    
    try {
      const aiResponses = await continueGroupDiscussion(topic, messages, userInput, base64Image, mimeType);
      setMessages(prev => [...prev, ...aiResponses]);
    } catch(err: any) {
      setMessages(prev => [...prev, { sender: 'System', text: 'An error occurred. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, imageFile, topic, messages]);

  if (!discussionStarted) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Group Discussion Simulator</h2>
            <p className="text-slate-600 mb-6">Enter a topic to begin a simulated group discussion with AI participants.</p>
            <div className="flex flex-col gap-4">
                <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Impact of Climate Change on India's Foreign Policy"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition h-24"
                />
                <button
                    onClick={handleStartDiscussion}
                    className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors duration-300"
                >
                    Start Discussion
                </button>
                {error && <p className="text-rose-500 mt-2">{error}</p>}
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-xl shadow-lg">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 text-center">Topic: <span className="text-sky-700">{topic}</span></h3>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'User' ? 'flex-row-reverse' : ''}`}>
              <SenderAvatar sender={msg.sender} />
              <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'User' ? 'bg-sky-100 text-slate-800' : 'bg-white text-slate-700 shadow-sm'}`}>
                {msg.sender !== 'User' && <p className="font-bold text-sm mb-1 text-slate-600">{msg.sender}</p>}
                <p className="text-base whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <SenderAvatar sender="Aisha" />
              <div className="p-3 rounded-lg bg-white shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
	                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
	                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 bg-white">
        {imagePreview && (
            <div className="relative w-24 h-24 mb-2 p-1 border rounded-md">
                <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover rounded" />
                <button onClick={() => {setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = '';}} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg">&times;</button>
            </div>
        )}
        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-full transition-colors">
            <ImageIcon />
          </button>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Your thoughts..."
            className="flex-grow px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="bg-sky-600 text-white rounded-full p-2.5 hover:bg-sky-700 disabled:bg-slate-400 transition-colors">
            <PaperAirplaneIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionSection;
