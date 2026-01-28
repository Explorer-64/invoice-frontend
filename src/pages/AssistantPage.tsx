import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Send, StopCircle, Volume2, Sparkles, Clock, Users, FileText, Play } from "lucide-react";
import { backend as apiClient } from "app";
import { useCurrentUser } from "app/auth";
import { Message, ChatResponse } from "types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SEO } from "components/SEO";
import { useGeolocation } from "components/GeolocationProvider";
import { useInvoiceItemsStore } from "utils/useInvoiceItemsStore";

const AssistantPage = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { nearbyClients, latitude, longitude } = useGeolocation();
  const { addItem } = useInvoiceItemsStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [contextData, setContextData] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const startingTextRef = useRef<string>("");

  // Load context data on mount
  useEffect(() => {
    loadContext();
    initializeSpeechRecognition();
    loadVoices();
  }, [user?.id]);

  // Voices load asynchronously, so we need to listen for them
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadContext = async () => {
    try {
      let response;
      if (user) {
        response = await apiClient.get_assistant_context();
      } else {
        response = await apiClient.get_demo_context();
      }
      const data = await response.json();
      setContextData(data);
    } catch (error) {
      console.error("Failed to load context:", error);
    }
  };

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);
    
    // Load saved voice preference or auto-select a good one
    const savedVoice = localStorage.getItem('preferredVoice');
    if (savedVoice && voices.find(v => v.name === savedVoice)) {
      setSelectedVoice(savedVoice);
    } else if (voices.length > 0) {
      // Auto-select a good default voice (prioritizing friendly female voices)
      const preferredVoices = [
        'Google US English',
        'Samantha', 
        'Microsoft Zira',
        'Google UK English Female',
        'Victoria'
      ];

      const defaultVoice = voices.find(voice => preferredVoices.some(p => voice.name.includes(p))) || 
                           voices.find(voice => voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')) || 
                           voices.find(voice => voice.lang.startsWith('en-US')) || 
                           voices[0];
      
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      }
    }
  };

  const initializeSpeechRecognition = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Web Speech API not supported in this browser');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;      // Keep listening
    recognition.interimResults = true;  // Get partial results while speaking
    recognition.lang = "en-US";         // Language
    recognition.maxAlternatives = 1;    // Only need best match

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      // Rebuild the full transcript from the current session
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }

      setInterimTranscript(interimText.trim());
      
      // Combine with the text that was already there when we started listening
      const separator = startingTextRef.current && finalText ? " " : "";
      const fullText = startingTextRef.current + separator + finalText.trim();
      
      setInputText(fullText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      
      // Handle different error types
      if (event.error === "no-speech") {
        // Just a pause, ignore it - will auto-restart
        console.log("⏸️ No speech detected (silence timeout)");
      } else if (event.error === "aborted") {
        // User manually stopped - no error needed
        console.log("🛑 Speech recognition aborted by user");
        setIsListening(false);
      } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        toast.error("Microphone access denied. Please allow microphone access.");
        setIsListening(false);
      } else {
        // Other actual errors
        console.error("❌ Speech recognition error:", event.error);
        setIsListening(false);
      }
    };

    // Auto-restart when it stops (browser stops after silence)
    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error("Failed to restart:", error);
          isListeningRef.current = false;
          setIsListening(false);
        }
      }
    };

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
      setIsListening(true);
    };
    
    recognition.onaudiostart = () => {
      console.log("🔊 Audio capturing started");
    };
    
    recognition.onsoundstart = () => {
      console.log("🔉 Sound detected!");
    };
    
    recognition.onspeechstart = () => {
      console.log("🗣️ Speech detected!");
    };
    
    recognition.onspeechend = () => {
      console.log("🤐 Speech ended");
    };
    
    recognition.onsoundend = () => {
      console.log("🔇 Sound ended");
    };
    
    recognition.onaudioend = () => {
      console.log("🔇 Audio capturing ended");
    };

    recognitionRef.current = recognition;
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    if (isListening) {
      console.log("🛑 Stopping speech recognition");
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current.stop();
        setInterimTranscript("");
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    } else {
      console.log("▶️ Starting speech recognition...");
      try {
        // Save current text so we can append to it
        startingTextRef.current = inputText;
        // Don't clear inputText here, we will update it in onresult
        setInterimTranscript("");
        isListeningRef.current = true;
        console.log("🔍 Set isListeningRef.current to:", isListeningRef.current);
        setIsListening(true);
        recognitionRef.current.start();
        console.log("✅ Recognition start() called successfully");
        toast.success("Listening... Speak now!", { duration: 4000 });
      } catch (error) {
        console.error("❌ Error starting recognition:", error);
        isListeningRef.current = false;
        setIsListening(false);
        toast.error("Failed to start voice input: " + error);
      }
    }
  };

  const handleRestoreClient = async (clientId: number) => {
    try {
      await apiClient.restore_client({ clientId });
      toast.success("Client restored");
      loadContext();
    } catch (error) {
      console.error("Failed to restore client:", error);
      toast.error("Failed to restore client");
    }
  };

  const handleRestoreSession = async (sessionId: number) => {
    try {
      await apiClient.restore_session({ sessionId });
      toast.success("Session restored");
      loadContext();
    } catch (error) {
      console.error("Failed to restore session:", error);
      toast.error("Failed to restore session");
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsProcessing(true);

    try {
      let response;
      if (user) {
        response = await apiClient.chat_with_assistant({
          message: userMessage,
          conversation_history: messages,
          nearby_clients: nearbyClients.map(c => ({
             id: c.id,
             name: c.name,
             distance: c.distance
          }))
        });
      } else {
        response = await apiClient.chat_demo({
          message: userMessage,
          conversation_history: messages,
        });
      }

      const data: ChatResponse = await response.json();
      setMessages(data.conversation_history);

      // Reload context after interaction
      loadContext();

      // Handle frontend actions
      if (data.metadata?.frontend_actions && user?.uid) {
        for (const action of data.metadata.frontend_actions as any[]) {
          if (action.type === 'create_invoice_item') {
            try {
              await addItem({
                name: action.name,
                description: action.description || action.name,
                unit_price: action.unit_price,
                default_quantity: action.default_quantity,
                sku: action.sku,
                category: action.category
              }, user.uid);
              toast.success(`Saved item: ${action.name}`);
            } catch (err) {
              console.error("Failed to execute frontend action:", err);
              toast.error(`Failed to save item: ${action.name}`);
            }
          }
        }
      }

      // Handle action feedback
      if (data.metadata) {
        const { 
          deleted_client_id, 
          deleted_session_id,
          deleted_invoice_id,
          last_client_id,
          last_session_id,
          last_invoice_id,
          updated_client_id,
          updated_session_id,
          last_action
        } = data.metadata;

        if (deleted_client_id) {
          toast.success("Client archived", {
            action: {
              label: "Undo",
              onClick: () => handleRestoreClient(deleted_client_id)
            }
          });
        }

        if (deleted_session_id) {
          toast.success("Session archived", {
            action: {
              label: "Undo",
              onClick: () => handleRestoreSession(deleted_session_id)
            }
          });
        }

        if (deleted_invoice_id) {
          toast.success("Invoice deleted");
        }

        if (last_client_id || updated_client_id) {
          toast.success("Client saved");
        }

        if (last_session_id || updated_session_id) {
          toast.success("Session saved");
        }

        if (last_invoice_id) {
          if (last_action === "send_invoice_email") {
            toast.success("Invoice sent via email");
          } else {
            toast.success("Invoice created");
          }
        }
      }

      // Speak the response if speech synthesis is available
      speakResponse(data.message);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      
      let errorMessage = "Failed to send message";
      
      if (error.detail) {
        if (typeof error.detail === "string") {
          errorMessage = error.detail;
        } else if (Array.isArray(error.detail)) {
          // Pydantic validation error
          errorMessage = error.detail.map((e: any) => e.msg).join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) {
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use selected voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === selectedVoice);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    // Adjust speech parameters for more natural sound
    utterance.rate = 1.0;  // Normal speed is usually best for "friendly"
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    window.speechSynthesis.speak(utterance);
  };

  const previewVoice = (voiceName: string) => {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === voiceName);
    
    if (voice) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Hello, I'm your billing assistant. How can I help you today?");
      utterance.voice = voice;
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    localStorage.setItem('preferredVoice', voiceName);
    previewVoice(voiceName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "How many hours this week?", icon: Clock },
    { label: "Start a session", icon: Play },
    { label: "Show my clients", icon: Users },
    { label: "Create an invoice", icon: FileText },
  ];

  // If no user, we still render the assistant but maybe with a different initial state or context
  // The backend will handle the "sales mode" logic
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEO 
        title="AI Assistant" 
        description="Try our AI voice assistant. Detect job arrivals, log hours, and create invoices hands-free." 
        url="https://invoicejobs.com/assistant-page"
      />
      <PageHeader title="AI Assistant" subtitle="Voice-powered billing assistant" />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Billing Assistant</h1>
                  <p className="text-sm text-muted-foreground">Ask me anything about your work and invoices</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!user && (
                   <Button variant="default" onClick={() => navigate("/login")} className="hidden md:flex bg-orange-600 hover:bg-orange-700">
                      Sign Up to Save Data
                   </Button>
                )}
                {/* Voice Selection */}
                <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select voice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices
                      .filter(voice => voice.lang.startsWith('en'))
                      .map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name.replace('Google ', '').replace('Microsoft ', '').substring(0, 30)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Mute Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full"
                >
                  {isMuted ? (
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-primary" />
                  )}
                </Button>
              </div>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {user ? "How can I help you today?" : "Try the AI Billing Assistant"}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {user 
                    ? "Ask me about your hours, start tracking time, or create invoices"
                    : "I can help you track time and manage invoices. Try asking me something!"
                  }
                </p>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setInputText(action.label)}
                        className="bg-card border border-border hover:bg-accent rounded-xl p-4 text-left transition-colors flex items-center gap-3"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                {!user && (
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm max-w-md mx-auto">
                    <p>You are in <strong>Try Me</strong> mode. Your data will not be saved until you sign in.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">Assistant</span>
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      {message.timestamp && (
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {isProcessing && (
              <div className="flex justify-start mt-4">
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-card sticky bottom-0">
          <div className="container mx-auto px-6 py-4 max-w-4xl">
            <div className="flex gap-3 items-end">
              {!isListening ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVoiceInput}
                  className="h-12 w-12 flex-shrink-0"
                  disabled={isProcessing}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={toggleVoiceInput}
                  className="h-12 px-4 flex-shrink-0 gap-2"
                >
                  <StopCircle className="h-5 w-5" />
                  Done Speaking
                </Button>
              )}

              {/* Input area with interim transcript overlay */}
              <div className="relative flex-1">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isListening ? "Listening..." : "Type or use voice..."}
                  className="min-h-[60px] pr-4 resize-none"
                  disabled={isProcessing}
                />
                {interimTranscript && (
                  <div className="absolute top-2 left-3 text-sm text-muted-foreground italic pointer-events-none">
                    {interimTranscript}
                  </div>
                )}
              </div>

              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || isProcessing || isListening}
                size="icon"
                className="h-12 w-12 flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift+Enter for new line • Click mic for voice input
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setInputText(action.label)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg py-2 px-3 text-left transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssistantPage;
