import React, { useState, useRef, useEffect } from 'react';
import { Mic, Image as ImageIcon, Send, X, MicOff } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
// SWITCH: Now using Hugging Face instead of Gemini
import { runChat } from '../../api/huggingface';
import './PromptInput.css';

const PromptInput = () => {
  const storeInputValue = useChatStore((state) => state.inputValue);
  const setStoreInputValue = useChatStore((state) => state.setInputValue);
  const addMessage = useChatStore((state) => state.addMessage);
  const setLoading = useChatStore((state) => state.setLoading);
  const setError = useChatStore((state) => state.setError);
  const isLoading = useChatStore((state) => state.isLoading);

  const [localInput, setLocalInput] = useState('');
  const [image, setImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (storeInputValue) {
      handleSend(storeInputValue);
      setStoreInputValue('');
    }
  }, [storeInputValue]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setLocalInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Speech recognition not supported");
    if (isListening) recognitionRef.current.stop();
    else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          data: reader.result.split(',')[1],
          mimeType: file.type,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (forcedPrompt) => {
    const prompt = (forcedPrompt || localInput).trim();
    if (!prompt || isLoading) return;
    
    addMessage({ 
      role: 'user', 
      content: prompt,
      image: image?.preview 
    });
    
    setLocalInput('');
    setImage(null);
    setError(null);
    setLoading(true);
    
    try {
      // Logic for sending to Hugging Face
      const response = await runChat(prompt, image);
      addMessage({ role: 'model', content: response });
    } catch (err) {
      setError(err.message);
      addMessage({ role: 'error', content: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-wrapper">
      {image && (
        <div className="image-preview-container">
          <img src={image.preview} alt="Upload preview" className="image-preview" />
          <button className="remove-image-btn" onClick={() => setImage(null)}>
            <X size={14} />
          </button>
        </div>
      )}
      
      <div className="input-container" style={{ opacity: isLoading ? 0.7 : 1 }}>
        <input
          type="text"
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isLoading ? "Llama 3 is thinking..." : "Enter a prompt here"}
          className="prompt-field"
          disabled={isLoading}
        />
        
        <div className="input-actions">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          <button className="action-btn" onClick={() => fileInputRef.current.click()} title="Upload Image (Text only model)" disabled={isLoading}>
            <ImageIcon size={20} />
          </button>
          
          <button className={`action-btn ${isListening ? 'listening' : ''}`} onClick={toggleListening} title="Voice Input" disabled={isLoading}>
            <Mic size={20} color={isListening ? "#ff5546" : "inherit"} />
          </button>
          
          <button onClick={() => handleSend()} className="send-btn" title="Send Message" disabled={isLoading || (!localInput.trim() && !image)}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
