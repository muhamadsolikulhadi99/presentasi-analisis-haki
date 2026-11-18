const $ = s => document.querySelector(s);
const normalize = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
const chapters = window.PAPER_SUMMARIES;
$("#summaryGrid").innerHTML = chapters.map((c,i)=>`<article class="summary-card"><div class="num">BAB ${String(i+1).padStart(2,"0")}</div><h3>${c.title.replace(/^Bab [IVX]+ — /,"")}</h3><p>${c.summary}</p><ul>${c.points.map(p=>`<li>${p}</li>`).join("")}</ul><button data-chapter="${i}">Buka bagian makalah →</button></article>`).join("");
function parsePaper(){
  const lines = window.PAPER_TEXT.replace(/\r/g,"").split("\n");
  let out="", toc=[], currentChapter="";
  for(let i=0;i<lines.length;i++){
    const raw=lines[i], t=raw.trim();
    if(!t){continue;}
    if(/^BAB (I|II|III|IV|V|VI|VII)\s*$/.test(t)){
      currentChapter=lines[i+1]?.trim()||t;
      const id="bab-"+(toc.length+1);toc.push({id,title:t+" — "+currentChapter});
      out+=`<h2 id="${id}">${escapeHTML(t)}<br>${escapeHTML(currentChapter)}</h2>`;i++;continue;
    }
    if(/^[A-G]\.\s+/.test(t)){
      out+=`<h3>${escapeHTML(t)}</h3>`;continue;
    }
    if(/^DAFTAR PUSTAKA|^CATATAN METODOLOGIS/i.test(t)){
      const id="bagian-"+toc.length;toc.push({id,title:t});
      out+=`<h2 id="${id}">${escapeHTML(t)}</h2>`;continue;
    }
    if(/^MAKALAH$/.test(t)){out+=`<p style="text-align:center;font-weight:700;letter-spacing:.2em">${escapeHTML(t)}</p>`;continue;}
    if(t.length<110 && (/^\d+\.\s/.test(t)||/^[1-9]\.\s/.test(t))){out+=`<p>${escapeHTML(t)}</p>`;continue;}
    if(/^Kata kunci:/i.test(t)){out+=`<p><b>${escapeHTML(t)}</b></p>`;continue;}
    if(t.startsWith("**")&&t.endsWith("**")){out+=`<p><b>${escapeHTML(t.replace(/\*/g,""))}</b></p>`;continue;}
    out+=`<p>${escapeHTML(t).replace(/\*(.*?)\*/g,"<em>$1</em>")}</p>`;
  }
  $("#paperContent").innerHTML=out;
  $("#tocLinks").innerHTML=toc.map(x=>`<a href="#${x.id}">${escapeHTML(x.title)}</a>`).join("");
}
parsePaper();
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-chapter]");
  if(b){const idx=Number(b.dataset.chapter);const babIds=[...document.querySelectorAll(".paper-content h2[id^='bab-']")];babIds[idx]?.scrollIntoView({behavior:"smooth"}); }
});
$("#searchInput").addEventListener("input",e=>{
  const q=normalize(e.target.value.trim());
  const paras=[...$("#paperContent").querySelectorAll("p,h2,h3")];
  paras.forEach(p=>{
    const raw=p.dataset.original||p.textContent;
    p.dataset.original=raw;
    p.innerHTML=escapeHTML(raw);
    if(q && normalize(raw).includes(q)){p.innerHTML=escapeHTML(raw).replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"ig"),"<mark>$1</mark>");}
  });
});
$("#themeToggle").onclick=()=>document.body.classList.toggle("dark");
$("#menuToggle").onclick=()=>$("#mainNav").classList.toggle("open");
$("#fontUp").onclick=()=>$("#paperContent").style.fontSize=(parseFloat(getComputedStyle($("#paperContent")).fontSize)+1)+"px";
$("#fontDown").onclick=()=>$("#paperContent").style.fontSize=Math.max(12,parseFloat(getComputedStyle($("#paperContent")).fontSize)-1)+"px";
$("#copyLink").onclick=async()=>{try{await navigator.clipboard.writeText(location.href+"#makalah");$("#copyLink").textContent="Tautan disalin";}catch{ $("#copyLink").textContent="Salin dari bilah alamat";}};
let slide=0;
function showSlide(){
 const c=chapters[slide];
 $("#presBody").innerHTML=`<div class="pres-kicker">${slide===0?"PENGANTAR KAJIAN":`BAB ${String(slide).padStart(2,"0")}`}</div><h2>${slide===0?"Menganalisis Satu Kasus Pelanggaran HAKI Secara Menyeluruh":escapeHTML(c.title)}</h2><p>${slide===0?"Studi kasus dugaan pelanggaran hak cipta LKS Pendidikan Agama Islam Titian Prestasi dan Pandhan Simo.":escapeHTML(c.summary)}</p><ul>${(slide===0?["Perspektif hukum hak cipta","Etika digital dan integritas akademik","Nilai-nilai Pendidikan Agama Islam"]:c.points).map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul>`;
 $("#slideNumber").textContent=`${slide+1} / ${chapters.length}`;
}
function openPresentation(){slide=0;showSlide();$("#presentation").classList.add("active");$("#presentation").setAttribute("aria-hidden","false");}
function closePresentation(){$("#presentation").classList.remove("active");$("#presentation").setAttribute("aria-hidden","true");}
$("#presentToggle").onclick=openPresentation;$("#closePresentation").onclick=closePresentation;
$("#prevSlide").onclick=()=>{slide=Math.max(0,slide-1);showSlide();};
$("#nextSlide").onclick=()=>{slide=Math.min(chapters.length-1,slide+1);showSlide();};
document.addEventListener("keydown",e=>{if(!$("#presentation").classList.contains("active"))return;if(e.key==="Escape")closePresentation();if(e.key==="ArrowRight"){$("#nextSlide").click();}if(e.key==="ArrowLeft"){$("#prevSlide").click();}});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
