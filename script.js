const SLIDE_COUNT = 16;
// Todos os slides duram o tempo real da música (onended avança automaticamente)

// Mapa de músicas por índice de slide (0-based) — sem repetições
const SLIDE_MUSIC = {
  0:  'musicas/YTDown_Shorts_Farol-das-Estrelas-Status_Media_oAwoNpEoIaU_008_128k.mp3',                  // slide 1
  1:  'musicas/Jorge e Mateus - É Amor - musictodrivebr (128k).mp3',                                      // slide 2
  2:  'musicas/YTDown_Shorts_Amo-noite-e-dia-Jorge-e-Mateus-letra-de-_Media_OtpxkHvf2ms_009_128k.mp3',  // slide 3
  3:  'musicas/YTDown_Shorts_O-que-e-que-tem-Jorge-e-Mateus-para-stat_Media_TvuISjxyGcM_008_128k.mp3',  // slide 4
  4:  'musicas/🎵 Duas metades • Jorge e Mateus - letra de música - sentimento sertanejo (128k).mp3',    // slide 5
  5:  'musicas/Leandro & Leonardo - Eu Juro - ListenToMusic (128k).mp3',                                  // slide 6
  6:  'musicas/YTDown_Shorts_eu-te-seguro-panda_Media_rgqPt0MzW2M_009_128k.mp3',                        // slide 7
  7:  'musicas/GRUPO REVELAÇÃO - CORAÇÃO RADIANTE LETRA🎶 - Música Pra Status (128k).mp3',              // slide 8
  8:  'musicas/YTDown_Shorts_Fico-Assim-Sem-Voce-Claudinho-e-Buchecha_Media_J-Tx6VgSBiU_009_128k.mp3', // slide 9
  9:  'musicas/YTDown_Shorts_Pele-MilFlows-Vem-Ca-pele-pelemilflows-v_Media_OdsaIHFjG6Q_008_128k.mp3', // slide 10
  10: 'musicas/YTDown_Shorts_Bruno-Mars-When-I-Was-Your-Man_Media_0GERqd3vASI_009_128k.mp3',            // slide 11
  11: 'musicas/YTDown_Shorts_Dias-de-luta-Dias-de-gloria-Charlie-Brow_Media_hcDaUCS-Nxs_009_128k.mp3', // slide 12
  12: 'musicas/Como É Grande o Meu Amor Por Você - Roberto Carlos (128k).mp3', // slide 13 – Como É Grande o Meu Amor
  13: 'musicas/YTDown_Shorts_Um-amor-puro-Djavan-mpb-brasil-musica-le_Media_U9Uq_hpSJME_008_128k.mp3', // slide 14 – Djavan
  14: 'musicas/YTDown_Shorts_EU-NEM-SEI-OQUE-DIZER-QUANDO-FALO-DE-VC_Media_XD3PXaYUhZI_007_128k.mp3', // slide 15 – Foto 5 (nem sei o que dizer)
  15: 'musicas/YTDown_Shorts_AS-NOITES-SABEM-COMO-EU-TE-ESPEREI-SONHO_Media_hLO0HknTSRI_009_128k.mp3', // slide 16 – Final (Sonho de Amor)
};

// Índice do slide Djavan (0-based) — mantido para referência
const DJAVAN_SLIDE = 13;

let currentSlide = 0;
let slideTimer = null;
let currentAudio = null;

const slides = document.querySelectorAll('.slide');
const progressBar = document.getElementById('progress-bar');

for (let i = 0; i < SLIDE_COUNT; i++) {
  const seg = document.createElement('div');
  seg.className = 'prog-seg';
  seg.innerHTML = '<div class="fill"></div>';
  progressBar.appendChild(seg);
}

function getSegments() { return document.querySelectorAll('.prog-seg'); }

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio = null;
  }
}

function playAudioForSlide(index, onEnded) {
  stopCurrentAudio();
  const src = SLIDE_MUSIC[index];
  if (!src) {
    // Sem música: avança depois de 5 s como fallback
    if (onEnded) slideTimer = setTimeout(onEnded, 5000);
    return;
  }
  const audio = new Audio(src);
  audio.volume = 0.7;
  currentAudio = audio;

  // Quando souber a duração real, atualiza a barra de progresso
  audio.addEventListener('loadedmetadata', () => {
    const dur = Math.round(audio.duration * 1000);
    const segs = getSegments();
    const seg = segs[index];
    if (seg) {
      seg.style.setProperty('--slide-dur', dur + 'ms');
      seg.querySelector('.fill').style.animation = 'none';
      void seg.querySelector('.fill').offsetWidth;
      seg.querySelector('.fill').style.animation = '';
    }
  });

  audio.play().catch(() => {});
  if (onEnded) audio.onended = onEnded;
}

function goToSlide(index) {
  if (index < 0) index = 0;
  if (index >= SLIDE_COUNT) { endWrapped(); return; }
  clearTimeout(slideTimer);

  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  const segs = getSegments();
  segs.forEach((seg, i) => {
    seg.classList.remove('active', 'done');
    seg.querySelector('.fill').style.animation = 'none';
    if (i < index) seg.classList.add('done');
  });

  const activeSeg = segs[index];
  activeSeg.classList.add('active');
  // Barra começa com placeholder de 30 s; será corrigida no loadedmetadata
  activeSeg.style.setProperty('--slide-dur', '30000ms');
  void activeSeg.querySelector('.fill').offsetWidth;
  activeSeg.querySelector('.fill').style.animation = '';

  currentSlide = index;
  if (index === SLIDE_COUNT - 1) spawnConfetti();

  // Todos os slides avançam quando a música termina
  playAudioForSlide(index, () => goToSlide(index + 1));
}

function endWrapped() {
  stopCurrentAudio();
  const segs = getSegments();
  segs.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
}

function restartWrapped() { stopCurrentAudio(); goToSlide(0); }

document.getElementById('skip-left').addEventListener('click', () => goToSlide(currentSlide - 1));
document.getElementById('skip-right').addEventListener('click', () => goToSlide(currentSlide + 1));

document.getElementById('start-btn').addEventListener('click', startWrapped);
document.getElementById('landing').addEventListener('click', function(e) {
  if (e.target === this) startWrapped();
});

function startWrapped() {
  const landing = document.getElementById('landing');
  landing.style.opacity = '0';
  landing.style.transform = 'scale(1.05)';
  setTimeout(() => {
    landing.style.display = 'none';
      document.getElementById('wrapped').style.display = 'block';
    goToSlide(0);
  }, 600);
}




function spawnConfetti() {
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  const colors = ['#1DB954','#FF6B9D','#F59E0B','#8B5CF6','#ffffff','#3B82F6'];
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    const size = Math.random() * 8 + 4;
    dot.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:-20px;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${Math.random()*3+2}s;animation-delay:${Math.random()*2}s;opacity:${Math.random()*.8+.2};`;
    container.appendChild(dot);
  }
}
const APP_NAME1 = 'Pablo';
const APP_NAME2 = 'Yasmin';
const APP_MSG = 'você é minha música favorita';

function applyNames() {
  const name1 = APP_NAME1;
  const name2 = APP_NAME2;
  const msg = APP_MSG;
  const both = `${name1} & ${name2}`;
  document.getElementById('landing-feat').textContent = `feat. ${both}`;
  document.getElementById('s1-names-sub').textContent = both;
  ['photo1-artists','photo2-artists','photo3-artists','photo4-artists','photo5-artists','msg-names'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = both;
  });
  document.getElementById('s9-sub-text').textContent = `feat. ${both}`;
  document.getElementById('final-name1').textContent = name1;
  document.getElementById('final-name2').textContent = name2;
  // lyric slides names
  ['lyric1-name1','lyric2-name1','lyric3-name1','lyric4-name1','lyric5-name1'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = name1;
  });
  ['lyric3-name2','lyric5-name2'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = name2;
  });
  // msg quote
  const words = msg.split(' ');
  const half = Math.ceil(words.length / 2);
  const l1 = words.slice(0,half).join(' ');
  const l2 = words.slice(half).join(' ');
  const mq = document.getElementById('msg-quote');
  mq.innerHTML = l2 ? `"<em>${l1}</em><br>${l2}"` : `"<em>${msg}</em>"`;
}

applyNames();