/* Multiple-choice quiz with instant feedback. Reusable in every lesson.
   Quiz.mount(el, [{q, opts:[...], a:indexOfCorrect, hint}], {onDone})
   A wrong answer is crossed out with a hint; the reader tries again until correct.
   Score counts questions answered right on the first try. Uses Speak.say if present. */
(function(){
  const esc = t => String(t).replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
  const spk = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  window.Quiz = {
    mount(el, items, opts){
      opts = opts || {};
      let first = 0, done = 0;
      el.classList.add("quiz");
      el.innerHTML = items.map((it, i) =>
        '<div class="q" data-i="'+i+'"><div class="ask"><span>'+(i+1)+'. '+esc(it.q)+'</span>'+
        '<button class="btn small" data-read="'+i+'" aria-label="Listen to question '+(i+1)+'">'+spk+'Listen</button></div>'+
        '<div class="opts">'+it.opts.map((o, j) => '<button class="opt" data-j="'+j+'">'+esc(o)+'</button>').join("")+'</div>'+
        '<p class="fb" aria-live="polite"></p></div>').join("") +
        '<p class="score" aria-live="polite"></p>';
      const score = el.querySelector(".score");
      el.addEventListener("click", e => {
        const r = e.target.closest("[data-read]");
        if(r){ const it = items[+r.dataset.read]; window.Speak && Speak.say(it.q + " " + it.opts.join(". ")); return; }
        const b = e.target.closest(".opt"); if(!b) return;
        const box = b.closest(".q"), it = items[+box.dataset.i], fb = box.querySelector(".fb");
        if(box.dataset.done) return;
        if(+b.dataset.j === it.a){
          b.classList.add("ok"); fb.className = "fb ok"; fb.textContent = "Yes! That's right.";
          box.dataset.done = 1; done++;
          if(!box.dataset.missed) first++;
          box.querySelectorAll(".opt").forEach(o => o.disabled = true);
          if(done === items.length){
            score.textContent = "You got " + first + " of " + items.length + " right on the first try." +
              (first === items.length ? " Amazing!" : " Good work. Try again tomorrow!");
            opts.onDone && opts.onDone(first, items.length);
          }
        } else {
          b.classList.add("no"); b.disabled = true; box.dataset.missed = 1;
          fb.className = "fb no"; fb.textContent = "Not quite. " + (it.hint || "Try again.");
        }
      });
    }
  };
})();
