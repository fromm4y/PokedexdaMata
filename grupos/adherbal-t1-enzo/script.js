const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const STORAGE_KEY = "mundoMamiferosProgressV1";
const achievementDefs = [
  { id:"starter", icon:"🧭", name:"Explorador iniciante", desc:"Inicie sua primeira aventura." },
  { id:"friend", icon:"🐾", name:"Amigo dos mamíferos", desc:"Descubra informações sobre três mamíferos diferentes." },
  { id:"master", icon:"🌳", name:"Mestre da floresta", desc:"Complete um desafio de exploração." },
  { id:"driver", icon:"🏁", name:"Piloto selvagem", desc:"Faça 100 pontos no minigame Fuga Selvagem." }
];
const defaultProgress = { achievements:[], discoveries:[], bestScore:0, challengeDone:false };
let progress = loadProgress();
let currentAnimal = "onca";
function loadProgress(){ try { return {...defaultProgress,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}; } catch { return {...defaultProgress}; } }
function saveProgress(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {} updateAchievements(); }
function unlock(id){ if(!progress.achievements.includes(id)){ progress.achievements.push(id); saveProgress(); } }
function updateAchievements(){
  if(progress.discoveries.length>=3 && !progress.achievements.includes("friend")) progress.achievements.push("friend");
  if(progress.challengeDone && !progress.achievements.includes("master")) progress.achievements.push("master");
  if(progress.bestScore>=100 && !progress.achievements.includes("driver")) progress.achievements.push("driver");
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)); } catch {}
  const count=progress.achievements.length;
  $("#achievementCount").textContent=`${count}/4`;
  $("#progressText").textContent=`${count} de 4 conquistas`;
  $("#progressBar").style.width=(count/4*100)+"%";
  $("#achievementList").innerHTML="";
  achievementDefs.forEach(a=>{
    const done=progress.achievements.includes(a.id);
    const article=document.createElement("article");
    article.className="achievement "+(done?"unlocked":"locked");
    const icon=document.createElement("div"); icon.className="achievement-icon"; icon.textContent=a.icon;
    const copy=document.createElement("div");
    const title=document.createElement("h3"); title.textContent=a.name;
    const desc=document.createElement("p"); desc.textContent=a.desc;
    const state=document.createElement("span"); state.className="state"; state.textContent=done?"✓ Desbloqueada":"🔒 Bloqueada";
    copy.append(title,desc,state); article.append(icon,copy); $("#achievementList").append(article);
  });
}
function showView(name){
  $$(".view").forEach(v=>v.classList.add("hidden"));
  const target=$("#view-"+name); if(target) target.classList.remove("hidden");
  $$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  $("#animalModal").classList.add("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
  if(name==="game") drawGame();
}
$("#startAdventure").addEventListener("click",()=>{
  $("#welcome").classList.add("hidden"); $("#mainMenu").classList.remove("hidden");
  unlock("starter"); showView("habitat");
});
$("#brandHome").addEventListener("click",e=>{e.preventDefault();showView("habitat")});
$$(".tab").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$$("[data-view]").filter(b=>!b.classList.contains("tab")).forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
const animalInfo={
  onca:{emoji:"🐆",title:"Onça-pintada",text:"A onça-pintada é o maior felino das Américas. Ela tem mandíbulas fortes, nada muito bem e ajuda a manter o equilíbrio da floresta. Se encontrar uma na natureza, admire de longe e nunca tente se aproximar."},
  tigre:{emoji:"🐅",title:"Tigre",text:"O tigre vive na Ásia e suas listras são diferentes das de qualquer outro tigre. Ele é um ótimo nadador e precisa de grandes áreas naturais para viver. A onça-pintada vive nas Américas; o tigre não é nativo da Amazônia."}
};
$$(".animal-panel").forEach(btn=>btn.addEventListener("click",()=>{
  currentAnimal=btn.dataset.animal; const a=animalInfo[currentAnimal];
  $("#animalModalEmoji").textContent=a.emoji; $("#animalModalTitle").textContent=a.title; $("#animalModalText").textContent=a.text;
  $("#animalModal").classList.remove("hidden");
}));
$("#closeAnimalModal").addEventListener("click",()=>$("#animalModal").classList.add("hidden"));
$("#animalModal").addEventListener("click",e=>{if(e.target.id==="animalModal") e.currentTarget.classList.add("hidden")});
$("#animalChallenge").addEventListener("click",()=>{progress.challengeDone=true;saveProgress();$("#animalModal").classList.add("hidden");showView("achievements")});

const mapPoints={
 camp:{icon:"🏕️",title:"Acampamento base",text:"Sua expedição começa aqui. Revise o guia, veja as conquistas e escolha a próxima trilha.",open:true,action:"habitat",label:"Voltar ao início"},
 jaguar:{icon:"🐆",title:"Trilha da onça",text:"Aprenda sobre a onça-pintada e outros felinos. Observe sem perturbar os animais.",open:true,action:"habitat",label:"Explorar felinos"},
 river:{icon:"🐾",title:"Rio tranquilo",text:"Os rios são importantes para muitos mamíferos, como capivaras e botos. Descubra mais usando a identificação por foto.",open:true,action:"identify",label:"Identificar mamíferos"},
 canopy:{icon:"🌳",title:"Mirante das copas",text:"Muitas espécies usam as árvores para encontrar alimento, abrigo e caminhos pela floresta.",open:true,action:"identify",label:"Começar descoberta"},
 deep:{icon:"🔒",title:"Mata profunda",text:"Esta área fica disponível depois de completar um desafio de exploração.",open:false,action:"game",label:"Completar desafio"}
};
$$(".map-point").forEach(btn=>btn.addEventListener("click",()=>{
 const p=mapPoints[btn.dataset.point], open=p.open || progress.challengeDone;
 $("#mapDetail").replaceChildren();
 const icon=document.createElement("div");icon.className="detail-icon";icon.textContent=open?p.icon:"🔒";
 const h=document.createElement("h3");h.textContent=open?p.title:"Área bloqueada";
 const text=document.createElement("p");text.textContent=open?p.text:"Complete um desafio de exploração para abrir esta trilha.";
 $("#mapDetail").append(icon,h,text);
 if(open){const action=document.createElement("button");action.className="btn btn-gold";action.textContent=p.label;action.addEventListener("click",()=>showView(p.action));$("#mapDetail").append(action);}
}));

const audio=$("#jaguarAudio"), roarBtn=$("#roarButton");
roarBtn.addEventListener("click",()=>FichaPokedex.tocarSom("Panthera onca","Onça-pintada",roarBtn)); // rugido real (Wikimedia Commons)

// Identificação de mamíferos — mantém a rota e o formato do backend existentes.
const photoInput=$("#photoInput"), photoPreview=$("#photoPreview");
let selectedPhoto=null;
photoInput.addEventListener("change",()=>{
 selectedPhoto=photoInput.files?.[0]||null;
 $("#identifyResult").classList.add("hidden");$("#identifyMessage").classList.add("hidden");
 if(!selectedPhoto)return;
 if(!selectedPhoto.type.startsWith("image/")){showIdentifyMessage("Escolha um arquivo de imagem.");selectedPhoto=null;return;}
 photoPreview.src=URL.createObjectURL(selectedPhoto);photoPreview.classList.remove("hidden");
});
function showIdentifyMessage(text,loading=false){const el=$("#identifyMessage");el.textContent=text;el.classList.remove("hidden");el.classList.toggle("loading",loading);}
function fileAsJpeg(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{const canvas=document.createElement("canvas");const scale=Math.min(1,1280/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);resolve(canvas.toDataURL("image/jpeg",.88).split(",")[1]);};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Não consegui abrir essa foto."));};img.src=url;
 });
}
$("#identifyButton").addEventListener("click",async()=>{
 if(!selectedPhoto){showIdentifyMessage("📸 Escolha uma foto primeiro!");return;}
 $("#identifyResult").classList.add("hidden");showIdentifyMessage("🔎 O explorador está observando a foto...",true);
 try{
  const base64=await fileAsJpeg(selectedPhoto);
  const pedido={modelo:"gemini-3.6-flash",body:{contents:[{parts:[{text:"Você é um especialista em mamíferos. Observe a foto e identifique o mamífero somente se houver evidências suficientes. Não chute. Se não tiver certeza ou não for mamífero, identificado deve ser false e confiança menor que 80. Retorne nome, curiosidades curtas em português e se pode ser perigoso."},{inline_data:{mime_type:"image/jpeg",data:base64}}]}],generationConfig:{temperature:.2,responseMimeType:"application/json",responseSchema:{type:"object",properties:{identificado:{type:"boolean"},confianca:{type:"integer"},nome:{type:"string"},curiosidades:{type:"string"},perigoso:{type:"boolean"}},required:["identificado","confianca"]}}}};
  const response=await fetch("/api/identificar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pedido)});
  if(!response.ok)throw new Error("Servidor indisponível");
  const responseData=await response.json();
  const raw=responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!raw)throw new Error("Resposta vazia");
  const data=JSON.parse(raw);
  if(data.identificado!==true || !Number.isFinite(Number(data.confianca)) || Number(data.confianca)<80){showIdentifyMessage("🐾 Hmm, não consegui ter certeza. Tente outra foto mais nítida!");return;}
  $("#resultName").textContent="🐾 "+(data.nome||"Mamífero");
  $("#resultConfidence").textContent=String(Number(data.confianca));
  $("#resultFacts").textContent=data.curiosidades||"Ainda não temos curiosidades sobre este animal.";
  $("#resultSafety").classList.toggle("hidden",data.perigoso!==true);
  $("#identifyMessage").classList.add("hidden");$("#identifyResult").classList.remove("hidden");
  const normalized=(data.nome||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  if(normalized && !progress.discoveries.includes(normalized)){progress.discoveries.push(normalized);saveProgress();}
 }catch(err){showIdentifyMessage("😕 Não consegui analisar a foto agora. Confira a conexão e tente novamente.");}
});

// Minigame canvas
const canvas=$("#gameCanvas"),ctx=canvas.getContext("2d");
const W=canvas.width,H=canvas.height;
let game={running:false,paused:false,over:false,lane:1,score:0,speed:3,obstacles:[],ticks:0,last:0,raf:0,keys:{}};
$("#bestScore").textContent=progress.bestScore;
/* ===== Desenhos do jogo (pedido do Enzo): árvores de verdade, jipe sem emoji,
   obstáculos detalhados e de vários tipos ===== */
const ARVORES=[];for(let i=0;i<16;i++)ARVORES.push({lado:i%2,y:i*(H/8)+((i*37)%60),tipo:i%3,esc:.8+((i*13)%5)/10,dx:(i*29)%40});
function arvore(x,y,t,e){
 ctx.save();ctx.translate(x,y);ctx.scale(e,e);
 // sombra no chão
 ctx.fillStyle="rgba(0,0,0,.28)";ctx.beginPath();ctx.ellipse(14,46,46,16,0,0,Math.PI*2);ctx.fill();
 if(t===0){ // árvore de copa redonda (ipê / mata)
  ctx.fillStyle="#5b3a22";ctx.fillRect(-6,10,12,40);
  const g=ctx.createRadialGradient(-12,-28,6,0,-10,52);g.addColorStop(0,"#6fbf5a");g.addColorStop(.6,"#2f7d3a");g.addColorStop(1,"#174b25");
  ctx.fillStyle=g;[[-22,-6,30],[18,-10,30],[0,-30,34],[-6,8,26],[20,10,22]].forEach(([a,b,r])=>{ctx.beginPath();ctx.arc(a,b,r,0,Math.PI*2);ctx.fill()});
  ctx.fillStyle="rgba(255,255,255,.12)";ctx.beginPath();ctx.arc(-14,-34,12,0,Math.PI*2);ctx.fill();
 }else if(t===1){ // palmeira
  ctx.strokeStyle="#7a5530";ctx.lineWidth=9;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(0,48);ctx.quadraticCurveTo(10,10,2,-22);ctx.stroke();
  ctx.strokeStyle="#5d3f22";ctx.lineWidth=2;for(let k=0;k<6;k++){ctx.beginPath();ctx.moveTo(-4,40-k*11);ctx.lineTo(8,38-k*11);ctx.stroke();}
  for(let k=0;k<7;k++){const a=k/7*Math.PI*2;ctx.save();ctx.translate(2,-24);ctx.rotate(a);const g=ctx.createLinearGradient(0,0,56,0);g.addColorStop(0,"#2e7a36");g.addColorStop(1,"#7cc461");ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(30,-16,58,4);ctx.quadraticCurveTo(30,-2,0,6);ctx.fill();ctx.restore();}
  ctx.fillStyle="#6b4a1e";[[-4,-20],[6,-18],[1,-14]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,4,0,Math.PI*2);ctx.fill()});
 }else{ // araucária / pinheiro em camadas
  ctx.fillStyle="#4d3320";ctx.fillRect(-5,4,10,46);
  [[-44,8,"#1f5a2c"],[-36,-14,"#26693300"],[-30,-30,"#2f7a3a"],[-20,-46,"#3c8d45"]].forEach(([w,yy,c],k)=>{ctx.fillStyle=k===1?"#246632":c;ctx.beginPath();ctx.moveTo(-w,yy+16);ctx.quadraticCurveTo(0,yy-14,w,yy+16);ctx.quadraticCurveTo(0,yy+8,-w,yy+16);ctx.fill();});
 }
 ctx.restore();
}
function moita(x,y){ctx.fillStyle="#2c6b34";[[0,0,10],[9,-4,8],[-9,-3,8]].forEach(([a,b,r])=>{ctx.beginPath();ctx.arc(x+a,y+b,r,0,Math.PI*2);ctx.fill()});ctx.fillStyle="#d94f6a";ctx.beginPath();ctx.arc(x+4,y-8,2.5,0,Math.PI*2);ctx.fill();}
function drawRoad(){
 const gg=ctx.createLinearGradient(0,0,W,0);gg.addColorStop(0,"#163a22");gg.addColorStop(.5,"#1f4a2b");gg.addColorStop(1,"#163a22");ctx.fillStyle=gg;ctx.fillRect(0,0,W,H);
 // capim
 ctx.strokeStyle="#2f6a3a";ctx.lineWidth=2;for(let i=0;i<70;i++){const x=(i*53)%W,y=((i*97)+game.ticks*.18)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y-9);ctx.moveTo(x,y);ctx.lineTo(x+3,y-8);ctx.stroke();}
 // estrada de terra com bordas
 ctx.fillStyle="#6b5a3e";ctx.beginPath();ctx.moveTo(150,0);ctx.lineTo(570,0);ctx.lineTo(680,H);ctx.lineTo(40,H);ctx.closePath();ctx.fill();
 const ge=ctx.createLinearGradient(0,0,0,H);ge.addColorStop(0,"#8a7553");ge.addColorStop(1,"#9c845c");ctx.fillStyle=ge;ctx.beginPath();ctx.moveTo(178,0);ctx.lineTo(542,0);ctx.lineTo(625,H);ctx.lineTo(95,H);ctx.closePath();ctx.fill();
 // pedrinhas e marcas de pneu
 ctx.fillStyle="rgba(60,45,28,.35)";for(let i=0;i<40;i++){const y=((i*71)+game.ticks*.2)%H,k=y/H,x=178-83*k+((i*137)%((364+167*k)|0));ctx.beginPath();ctx.ellipse(x,y,3,2,0,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle="#e6d5a3a8";ctx.lineWidth=5;ctx.setLineDash([34,28]);ctx.lineDashOffset=-game.ticks*.2;
 for(let x of [315,405]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+(x-360)*.85,H);ctx.stroke();}
 ctx.setLineDash([]);
 // moitas floridas na beira
 for(let i=0;i<10;i++){const y=((i*103)+game.ticks*.2)%H;moita(110-(y/H)*50+(i%3)*6,y);moita(610+(y/H)*45-(i%3)*6,(y+50)%H);}
 // árvores dos dois lados (descem junto com o jipe)
 ARVORES.forEach(a=>{const y=(a.y+game.ticks*.2)%(H+120)-60;const x=a.lado?W-60+a.dx/2:58-a.dx/2;arvore(x,y,a.tipo,a.esc)});
}
function drawCar(x,y){ // jipe de safári visto de cima
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.roundRect(-34,-50,74,108,16);ctx.fill();
 ctx.fillStyle="#1c1c1c";[[-36,-38],[28,-38],[-36,22],[28,22]].forEach(([a,b])=>{ctx.beginPath();ctx.roundRect(a,b,10,24,4);ctx.fill()});
 const gc=ctx.createLinearGradient(-30,0,30,0);gc.addColorStop(0,"#b3772a");gc.addColorStop(.5,"#e2a547");gc.addColorStop(1,"#b3772a");
 ctx.fillStyle=gc;ctx.beginPath();ctx.roundRect(-29,-56,58,104,13);ctx.fill();ctx.strokeStyle="#7a4f1a";ctx.lineWidth=2;ctx.stroke();
 ctx.strokeStyle="rgba(122,79,26,.6)";ctx.beginPath();ctx.moveTo(-14,-54);ctx.lineTo(-14,-36);ctx.moveTo(14,-54);ctx.lineTo(14,-36);ctx.stroke();
 ctx.fillStyle="#fff6c9";ctx.beginPath();ctx.arc(-19,-52,4,0,Math.PI*2);ctx.arc(19,-52,4,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#86c9d0";ctx.beginPath();ctx.roundRect(-23,-34,46,18,6);ctx.fill();ctx.fillStyle="rgba(255,255,255,.4)";ctx.fillRect(-18,-31,14,4);
 ctx.fillStyle="#3d5a2c";ctx.beginPath();ctx.roundRect(-25,-12,50,44,8);ctx.fill();
 ctx.strokeStyle="#2a3f1e";ctx.lineWidth=2;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-22,-4+k*10);ctx.lineTo(22,-4+k*10);ctx.stroke();}
 ctx.fillStyle="#222";ctx.beginPath();ctx.arc(0,44,11,0,Math.PI*2);ctx.fill();ctx.fillStyle="#555";ctx.beginPath();ctx.arc(0,44,5,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#d0412f";ctx.fillRect(-27,40,7,5);ctx.fillRect(20,40,7,5);
 ctx.restore();
}
const TIPOS_OBST=["log","rock","mud","branch","termite","logmush"];
function drawObstacle(o){
 const x=laneX(o.lane),y=o.y;
 ctx.save();ctx.translate(x,y);ctx.rotate(o.rot||0);
 ctx.fillStyle="rgba(0,0,0,.28)";ctx.beginPath();ctx.ellipse(6,16,38,10,0,0,Math.PI*2);ctx.fill();
 if(o.type==="log"||o.type==="logmush"){ // tronco caído com anéis e casca
  const g=ctx.createLinearGradient(0,-16,0,16);g.addColorStop(0,"#9a6a3f");g.addColorStop(.5,"#7a5130");g.addColorStop(1,"#4f321c");
  ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(-40,-15,80,30,13);ctx.fill();
  ctx.strokeStyle="#3f2814";ctx.lineWidth=2;for(let k=-28;k<32;k+=14){ctx.beginPath();ctx.moveTo(k,-13);ctx.quadraticCurveTo(k+5,0,k,13);ctx.stroke();}
  ctx.fillStyle="#d9b47c";ctx.beginPath();ctx.ellipse(38,0,7,14,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#a07a46";ctx.beginPath();ctx.ellipse(38,0,4,8,0,0,Math.PI*2);ctx.stroke();
  if(o.type==="logmush"){[[-18,-14],[-6,-16],[10,-14]].forEach(([a,b],k)=>{ctx.fillStyle="#f2e6cf";ctx.fillRect(a-2,b,4,7);ctx.fillStyle=k===1?"#c0392b":"#e67e22";ctx.beginPath();ctx.ellipse(a,b,8,5,0,Math.PI,0);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(a-2,b-2,1.5,0,Math.PI*2);ctx.fill();});}
 }else if(o.type==="rock"){ // pedra com luz e sombra
  const g=ctx.createRadialGradient(-10,-12,4,0,0,36);g.addColorStop(0,"#c9c9bd");g.addColorStop(.6,"#8b8d80");g.addColorStop(1,"#5c5e53");
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-30,14);ctx.lineTo(-24,-12);ctx.lineTo(-4,-26);ctx.lineTo(20,-20);ctx.lineTo(32,4);ctx.lineTo(22,18);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#4a4c43";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(4,6);ctx.lineTo(16,0);ctx.stroke();
  ctx.fillStyle="#5d8a3a";ctx.beginPath();ctx.ellipse(-16,12,8,4,0,0,Math.PI*2);ctx.fill();
 }else if(o.type==="mud"){ // poça de lama
  const g=ctx.createRadialGradient(0,0,4,0,0,42);g.addColorStop(0,"#5a3e22");g.addColorStop(1,"#3b2714");
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,42,20,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(180,220,255,.25)";ctx.beginPath();ctx.ellipse(-10,-5,14,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#2b1c0e";[[18,6],[-22,8],[6,10]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,3,0,Math.PI*2);ctx.fill()});
 }else if(o.type==="branch"){ // galho caído com folhas
  ctx.strokeStyle="#6b4423";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-40,8);ctx.lineTo(36,-6);ctx.moveTo(-6,2);ctx.lineTo(10,-18);ctx.moveTo(14,-2);ctx.lineTo(30,14);ctx.stroke();
  [[10,-20],[32,16],[38,-8],[-30,4],[-12,-4]].forEach(([a,b],k)=>{ctx.fillStyle=k%2?"#3f8f3a":"#5bb34a";ctx.beginPath();ctx.ellipse(a,b,9,5,k,0,Math.PI*2);ctx.fill()});
 }else{ // cupinzeiro do cerrado
  const g=ctx.createLinearGradient(0,-36,0,18);g.addColorStop(0,"#c28a52");g.addColorStop(1,"#7e5228");
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-26,18);ctx.quadraticCurveTo(-22,-20,-6,-38);ctx.quadraticCurveTo(4,-44,10,-30);ctx.quadraticCurveTo(24,-8,26,18);ctx.closePath();ctx.fill();
  ctx.fillStyle="#5a3a1c";[[-8,-14],[6,-4],[-12,4],[10,-22]].forEach(([a,b])=>{ctx.beginPath();ctx.ellipse(a,b,3,2,0,0,Math.PI*2);ctx.fill()});
 }
 ctx.restore();
}
function laneX(lane){return [255,360,465][lane];}
function drawGame(){
 drawRoad();game.obstacles.forEach(drawObstacle);drawCar(laneX(game.lane),H-120);
}
function startGame(){
 cancelAnimationFrame(game.raf);game={...game,running:true,paused:false,over:false,lane:1,score:0,speed:3,obstacles:[],ticks:0,last:0,keys:{}};
 $("#score").textContent="0";$("#speedLabel").textContent="1×";$("#gameOverlay").classList.add("hidden");$("#crashOverlay").classList.add("hidden");$("#pauseButton").textContent="Ⅱ Pausar";drawGame();game.raf=requestAnimationFrame(loop);if(window.Musica)Musica.ligar();
}
function loop(timestamp){
 if(!game.running||game.paused)return;
 const dt=Math.min(32,timestamp-(game.last||timestamp));game.last=timestamp;game.ticks+=dt;
 game.speed=3+Math.min(5,game.score/80);game.score+=dt*.018;
 if(Math.random()<.018+game.speed*.0008)game.obstacles.push({lane:Math.floor(Math.random()*3),y:-30,type:TIPOS_OBST[Math.floor(Math.random()*TIPOS_OBST.length)],rot:(Math.random()-.5)*.2});
 game.obstacles.forEach(o=>o.y+=game.speed*dt*.09);
 game.obstacles=game.obstacles.filter(o=>o.y<H+50);
 const carY=H-120;
 for(const o of game.obstacles){if(o.lane===game.lane&&Math.abs(o.y-carY)<52){endGame();return;}}
 $("#score").textContent=Math.floor(game.score);$("#speedLabel").textContent=(game.speed/3).toFixed(1)+"×";
 drawGame();game.raf=requestAnimationFrame(loop);
}
function endGame(){
 game.running=false;game.over=true;cancelAnimationFrame(game.raf);if(window.Musica)Musica.desligar();
 const score=Math.floor(game.score);$("#finalScore").textContent=score;$("#crashOverlay").classList.remove("hidden");
 if(score>progress.bestScore){progress.bestScore=score;saveProgress();$("#bestScore").textContent=score;}
 updateAchievements();
}
function moveLane(delta){if(!game.running||game.paused)return;game.lane=Math.max(0,Math.min(2,game.lane+delta));drawGame();}
$("#playButton").addEventListener("click",startGame);$("#againButton").addEventListener("click",startGame);
$("#pauseButton").addEventListener("click",()=>{
 if(!game.running&&!game.paused)return;
 game.paused=!game.paused;
 if(game.paused){cancelAnimationFrame(game.raf);if(window.Musica)Musica.desligar();$("#pauseButton").textContent="▶ Continuar";ctx.fillStyle="#06120b99";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="bold 42px Arial";ctx.fillText("PAUSADO",W/2,H/2);}
 else{$("#pauseButton").textContent="Ⅱ Pausar";game.last=0;if(window.Musica)Musica.ligar();game.raf=requestAnimationFrame(loop);}
});
$("#leftControl").addEventListener("click",()=>moveLane(-1));$("#rightControl").addEventListener("click",()=>moveLane(1));
document.addEventListener("keydown",e=>{
 if(["ArrowLeft","ArrowRight","a","A","d","D"].includes(e.key)&&!$("#view-game").classList.contains("hidden"))e.preventDefault();
 if(e.key==="ArrowLeft"||e.key==="a"||e.key==="A")moveLane(-1);
 if(e.key==="ArrowRight"||e.key==="d"||e.key==="D")moveLane(1);
 if(e.key==="Escape")$("#animalModal").classList.add("hidden");
});
let touchStartX=null;
canvas.addEventListener("touchstart",e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
canvas.addEventListener("touchend",e=>{if(touchStartX===null)return;const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>20)moveLane(dx<0?-1:1);touchStartX=null;},{passive:true});
window.addEventListener("resize",()=>{if(!$("#view-game").classList.contains("hidden")&&!game.running)drawGame();});
updateAchievements();drawGame();
