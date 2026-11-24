/* Read-aloud + tap-a-word helper. Reusable in every lesson.
   Speak.say(text, onend)      read text aloud in English (slow, clear)
   Speak.queue([{text, el}])   read items in order, highlighting each el with .reading
   Words.mount(dict)           makes every <button class="vw" data-w="key"> open a word card
                               dict[key] = {he, def, ex, show?} */
(function(){
  const SS = ("speechSynthesis" in window) ? window.speechSynthesis : null;
  let voice = null, stopFlag = false;
  function pick(){
    try{
      const vs = SS.getVoices();
      voice = vs.find(v=>/^en[-_](US|GB)/i.test(v.lang) && /natural|google|samantha|aria|jenny|daniel/i.test(v.name))
           || vs.find(v=>/^en[-_](US|GB)/i.test(v.lang)) || vs.find(v=>/^en/i.test(v.lang)) || null;
    }catch(e){}
  }
  if(SS){ pick(); try{ SS.addEventListener("voiceschanged", pick); }catch(e){} }
  function noVoice(){ const m=document.getElementById("voiceMsg"); if(m) m.hidden=false; }
  function say(text, onend){
    if(!SS){ noVoice(); onend && onend(); return; }
    try{
      SS.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; if(voice) u.voice = voice; u.rate = 0.85;
      let started = false;
      u.onstart = ()=>{ started = true; };
      u.onend = ()=>{ onend && onend(); };
      u.onerror = e=>{ if(!/interrupted|canceled/.test(e.error||"")) noVoice(); };
      SS.speak(u); SS.resume();
      setTimeout(()=>{ if(!started && !SS.speaking) noVoice(); }, 3000);
    }catch(e){ noVoice(); }
  }
  function stop(){ stopFlag = true; if(SS) SS.cancel(); document.querySelectorAll(".reading").forEach(x=>x.classList.remove("reading")); }
  function queue(items, done){
    stopFlag = false; let i = 0;
    const next = ()=>{
      document.querySelectorAll(".reading").forEach(x=>x.classList.remove("reading"));
      if(stopFlag || i >= items.length){ done && done(); return; }
      const it = items[i++];
      if(it.el){ it.el.classList.add("reading"); it.el.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"center"}); }
      say(it.text, ()=>setTimeout(next, 450));
    };
    next();
  }
  window.Speak = {say, queue, stop};

  window.Words = {
    mount(dict){
      const sheet = document.createElement("div");
      sheet.className = "sheet"; sheet.setAttribute("role","dialog"); sheet.setAttribute("aria-live","polite");
      sheet.innerHTML = '<div class="row" style="justify-content:space-between"><span class="w"></span>'+
        '<button class="btn small" data-close>Close</button></div><div class="he"></div><p class="def"></p><p class="ex"></p>'+
        '<div class="row"><button class="btn main small" data-listen>Listen again</button></div>';
      document.body.appendChild(sheet);
      let cur = null;
      const q = s=>sheet.querySelector(s);
      document.addEventListener("click", e=>{
        const b = e.target.closest(".vw[data-w]"); if(!b) return;
        cur = b.dataset.w; const d = dict[cur]; if(!d) return;
        q(".w").textContent = d.show || cur; q(".he").textContent = d.he;
        q(".def").textContent = d.def; q(".ex").textContent = "“" + d.ex + "”";
        sheet.classList.add("on"); say(d.show || cur);
      });
      q("[data-close]").onclick = ()=>sheet.classList.remove("on");
      q("[data-listen]").onclick = ()=>{ if(cur) say((dict[cur].show||cur) + ". " + dict[cur].ex); };
      document.addEventListener("keydown", e=>{ if(e.key==="Escape") sheet.classList.remove("on"); });
    }
  };
})();
