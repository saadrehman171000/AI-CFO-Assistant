"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import {
  Bot,
  Send,
  FileText,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Loader2,
  RefreshCw,
  HelpCircle,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/main-layout";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
  sources?: string[];
  relevanceScore?: number;
  fallbackMode?: boolean;
}

interface SuggestedQuestion {
  question: string;
  category: string;
}

interface DocumentSummary {
  summary: string;
  documents: Array<{
    filename: string;
    chunk_types: string[];
    timestamp: string;
    file_type: string;
  }>;
  total_chunks: number;
}

export default function ChatbotPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [documentSummary, setDocumentSummary] = useState<DocumentSummary | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadSuggestedQuestions();
      loadDocumentSummary();
    }
  }, [user]);

  const loadSuggestedQuestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      const response = await fetch(`/api/chatbot/suggested-questions?user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestedQuestions(data.suggested_questions || []);
      }
    } catch (error) {
      console.error("Error loading suggested questions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const loadDocumentSummary = async () => {
    try {
      setIsLoadingDocuments(true);
      const response = await fetch(`/api/chatbot/document-summary?user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocumentSummary(data);
      }
    } catch (error) {
      console.error("Error loading document summary:", error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          user_id: user.id,
          conversation_history: messages.slice(-6), // Last 3 exchanges
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: data.response || "I apologize, but I couldn't process your request at the moment.",
        sender: "bot",
        timestamp: new Date(),
        sources: data.relevant_documents || [],
        relevanceScore: data.sources_used || 0,
        fallbackMode: data.fallback_mode || false,
      };

      setMessages(prev => prev.slice(0, -1).concat(botMessage));
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
        {/* Clean Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Financial Assistant
                </h1>
                <p className="text-sm text-gray-500">
                  Ask questions about your financial data
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                disabled={messages.length === 0}
                className="hidden sm:flex"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Clean Sidebar */}
          <div className={cn(
            "w-80 flex-col bg-white border-r border-gray-200",
            showSidebar ? "flex" : "hidden lg:flex"
          )}>
            {/* Document Summary */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center mb-3">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                <h3 className="font-medium text-gray-900">Your Documents</h3>
              </div>
              {isLoadingDocuments ? (
                <div className="space-y-2">
                  <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                </div>
              ) : documentSummary ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    {documentSummary.summary}
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {documentSummary.documents.map((doc, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded border">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {doc.filename}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {doc.chunk_types.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No documents uploaded yet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload financial documents to start chatting!
                  </p>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center mb-3">
                <HelpCircle className="h-4 w-4 mr-2 text-blue-600" />
                <h3 className="font-medium text-gray-900">Suggested Questions</h3>
              </div>
              {isLoadingSuggestions ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded border border-transparent hover:border-blue-200 transition-all duration-150"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bot className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                      Welcome to your Financial Assistant
                    </h2>
                    <p className="text-gray-600 mb-8">
                      I can help you analyze your financial data, answer questions about your documents, and provide insights.
                    </p>
                    {suggestedQuestions.length > 0 && (
                      <div className="space-y-2 max-w-lg mx-auto">
                        {suggestedQuestions.slice(0, 4).map((question, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-3 text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-150"
                            onClick={() => handleSuggestedQuestion(question)}
                            disabled={isLoading}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start space-x-3",
                      message.sender === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-2xl rounded-lg px-4 py-3 shadow-sm",
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-900 border border-gray-200"
                      )}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center text-xs text-gray-500 mb-2">
                                <Info className="h-3 w-3 mr-1" />
                                Sources ({message.relevanceScore} matches)
                                {message.fallbackMode && (
                                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                    Database Mode
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.sources.map((source, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {source}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                            {message.sender === "bot" && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {message.sender === "user" && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-200">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me about your financial data..."
                      disabled={isLoading}
                      className="pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 text-center">
                  AI responses are generated based on your uploaded financial documents
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
