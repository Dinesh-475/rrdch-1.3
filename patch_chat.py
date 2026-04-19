import re

files = ["index.html", "patients.html", "doctors.html", "students.html"]

beautiful_chat_html = """
    <!-- Floating Chat Widget -->
    <div id="chatBubble" onclick="toggleChat()" title="Ask RRDCH AI Assistant" style="position:fixed; bottom:24px; right:24px; width:64px; height:64px; background:linear-gradient(135deg, #2A6F97, #1A365D); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 32px rgba(42,111,151,0.4); z-index:9999; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); color:white; font-size:1.8rem;">
      <span style="display:inline-block; animation: wave 2s infinite; transform-origin: 70% 70%;">👋</span>
    </div>
    
    <div id="chatPanel" style="display:none; opacity:0; pointer-events:none; position:fixed; bottom:100px; right:24px; width:380px; height:550px; background:white; border-radius:24px; box-shadow:0 15px 50px rgba(0,0,0,0.15); z-index:9998; flex-direction:column; overflow:hidden; border:1px solid rgba(226,232,240,0.8); transform:translateY(20px) scale(0.95); transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
      <div style="background:linear-gradient(135deg, #1A365D, #2A6F97); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; font-size:1.1rem; display:flex; align-items:center; gap:0.5rem;">✨ RRDCH Assistant</div>
          <div style="font-size:0.8rem; opacity:0.8; margin-top:2px;">Powered by AI • Always active</div>
        </div>
        <button onclick="toggleChat()" style="background:rgba(255,255,255,0.2); border:none; color:white; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center; transition:0.2s;">✕</button>
      </div>
      <div id="chatMessages" style="flex:1; overflow-y:auto; padding:1.5rem; display:flex; flex-direction:column; gap:1rem; background:#f8fafc;">
        <div class="chat-msg bot" style="padding:0.85rem 1.15rem; border-radius:16px; font-size:0.95rem; line-height:1.5; max-width:85%; background:white; border:1px solid #e2e8f0; align-self:flex-start; color:#1e293b; border-bottom-left-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.05); animation:fadeInUp 0.3s ease;">Hello! I'm the RRDCH automated assistant. Feel free to ask me anything about our facilities, doctors, admissions, or treatments! 🦷</div>
      </div>
      <div style="padding:1rem; background:white; border-top:1px solid #e2e8f0; display:flex; gap:0.75rem; align-items:center;">
        <input id="chatInput" type="text" placeholder="Type your question..." style="flex:1; padding:0.8rem 1.2rem; border:1px solid #cbd5e1; border-radius:24px; font-size:0.95rem; outline:none; transition:0.2s; background:#f8fafc;" onkeydown="if(event.key==='Enter') sendChat()">
        <button onclick="sendChat()" style="background:#2A6F97; color:white; border:none; width:42px; height:42px; border-radius:50%; cursor:pointer; font-weight:600; display:flex; align-items:center; justify-content:center; transition:0.2s;">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px; height:20px; transform:translate(1px, 0px);"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
    <style>
      #chatBubble:hover { transform:scale(1.1) translateY(-5px) !important; box-shadow:0 12px 40px rgba(42,111,151,0.5) !important; }
      @keyframes wave { 0%, 60%, 100% { transform: rotate(0deg); } 10%, 30% { transform: rotate(14deg); } 20%, 40% { transform: rotate(-8deg); } 50% { transform: rotate(10deg); } }
      #chatPanel.active { opacity:1 !important; pointer-events:all !important; transform:translateY(0) scale(1) !important; }
      @keyframes fadeInUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      .typing-indicator { display:flex; gap:4px; align-items:center; padding:10px 15px; background:white; border-radius:16px; border-bottom-left-radius:4px; border:1px solid #e2e8f0; width:max-content; box-shadow:0 2px 5px rgba(0,0,0,0.05); animation:fadeInUp 0.3s ease; }
      .typing-dot { width:6px; height:6px; background:#94a3b8; border-radius:50%; animation: typing 1.4s infinite ease-in-out both; }
      .typing-dot:nth-child(1) { animation-delay:-0.32s; }
      .typing-dot:nth-child(2) { animation-delay:-0.16s; }
      @keyframes typing { 0%, 80%, 100% { transform:scale(0); } 40% { transform:scale(1); } }
      #chatInput:focus { border-color:#2A6F97 !important; background:white !important; box-shadow:0 0 0 3px rgba(42,111,151,0.1) !important; }
      button[onclick="sendChat()"]:hover { background:#1A365D !important; transform:scale(1.05) !important; }
    </style>
"""

javascript_chat = """        // Chat Assistant
        const GEMINI_KEY = "AIzaSyD7aZJ_Wcj5k-FynCqDS415jBfWTi00YxE";
        const RRDCH_SYSTEM = `You are the official AI assistant for Rajarajeshwari Dental College and Hospital (RRDCH). Address: 14 Ramohalli Cross, Mysore Road, Kumbalgodu, Bangalore 560074. Contact: 080-28437150. Email: info@rrdch.org. Accreditations: NABH, NAAC A+, ISO 9001:2015. Maintain simple answers, around 2-3 sentences.`;
        let chatHistory = [];
        function toggleChat() { 
          const p = document.getElementById("chatPanel");
          const isAct = p.classList.contains("active");
          if(isAct) { p.classList.remove("active"); setTimeout(() => p.style.display = "none", 300); }
          else { p.style.display = "flex"; setTimeout(() => p.classList.add("active"), 10); setTimeout(() => document.getElementById("chatInput").focus(), 300); }
        }
        async function sendChat() {
          const inp = document.getElementById("chatInput"); const msg = inp.value.trim(); if(!msg) return;
          appendMsg(msg, "user"); inp.value = ""; 
          const loader = appendMsg("Typing...", "loading"); 
          chatHistory.push({ role: "user", parts: [{ text: msg }] });
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
                method:"POST", headers:{"Content-Type":"application/json"},
                body: JSON.stringify({
                  system_instruction: { parts: [{ text: RRDCH_SYSTEM }] },
                  contents: chatHistory 
                })
            });
            const data = await res.json();
            loader.remove();
            if(data.error) {
                appendMsg("System offline. Please check your API key.", "bot");
                chatHistory.pop();
                return;
            }
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error processing request.";
            appendMsg(reply, "bot"); chatHistory.push({ role: "model", parts: [{ text: reply }] });
            if (chatHistory.length > 8) chatHistory = chatHistory.slice(-8);
          } catch(e) { loader.remove(); appendMsg("Connection error.", "bot"); chatHistory.pop(); }
        }
        function appendMsg(text, type) {
          const c = document.getElementById("chatMessages");
          const div = document.createElement("div"); 
          
          if(type === 'loading') {
              div.className = "loading-msg";
              div.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
              c.appendChild(div);
              c.scrollTop = c.scrollHeight; return div;
          }
          
          div.className = "chat-msg " + type; 
          div.textContent = text;
          
          if(type === 'user') {
              div.style.cssText = "padding:0.85rem 1.15rem; border-radius:16px; font-size:0.95rem; line-height:1.5; max-width:85%; background:linear-gradient(135deg, #2A6F97, #4A8DB5); color:white; align-self:flex-end; border-bottom-right-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.05); animation:fadeInUp 0.3s ease;";
          } else {
              div.style.cssText = "padding:0.85rem 1.15rem; border-radius:16px; font-size:0.95rem; line-height:1.5; max-width:85%; background:white; border:1px solid #e2e8f0; align-self:flex-start; color:#1e293b; border-bottom-left-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.05); animation:fadeInUp 0.3s ease;";
          }
          
          c.appendChild(div); 
          c.scrollTop = c.scrollHeight; return div;
        }
    </script>
"""

# Regex parts
js_regex = re.compile(r"// Chat Assistant.*?</span>\n\s*</div>\n\s*</div>", re.DOTALL) 

for f in files:
    with open(f, "r") as file:
        content = file.read()
    
    # 1) Replace the script part
    content = re.sub(
        r"// Chat Assistant.*?</script>",
        javascript_chat,
        content,
        flags=re.DOTALL
    )
    
    # 2) Replace the HTML widget part
    content = re.sub(
        r"<!-- Floating Chat Widget -->.*?(</body>|\Z)",
        beautiful_chat_html + r"\n\1",
        content,
        flags=re.DOTALL
    )
    
    with open(f, "w") as file:
        file.write(content)

print("Patched completely!")
