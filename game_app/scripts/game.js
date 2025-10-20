(function(){
  // Simple WebAudio synth for effects
  let audioCtx = null;
  function ensureAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } }
  function playTone(freq=440, duration=120, type='sine', volume=0.08){
    ensureAudio(); if(!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = volume; o.connect(g); g.connect(audioCtx.destination);
    const now = audioCtx.currentTime; o.start(now);
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration/1000);
    o.stop(now + duration/1000 + 0.02);
  }
  function sfxClick(){ playTone(2400, 40, 'square', 0.05); }
  function sfxRoll(){ playTone(600, 70, 'triangle', 0.05); }
  function sfxMove(){ playTone(880, 90, 'sine', 0.06); }
  function sfxPositive(){ playTone(1200, 120, 'triangle', 0.06); setTimeout(()=>playTone(1600, 120, 'triangle', 0.06), 100); }
  function sfxNegative(){ playTone(200, 160, 'sawtooth', 0.06); }

  function openModal(card, apply){
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const choices = document.getElementById('choices');
    title.textContent = card.title;
    desc.textContent = card.desc || '';
    choices.innerHTML = '';
    card.options.forEach((opt)=>{
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.textContent = opt.text;
      btn.onclick = ()=>{ sfxClick(); apply(opt); modal.classList.remove('open'); };
      choices.appendChild(btn);
    });
    modal.classList.add('open');
  }

  function flashRed(){
    const el = document.getElementById('screen-flash'); if(!el) return;
    el.classList.add('show');
    setTimeout(()=> el.classList.remove('show'), 150);
  }

  function setHeat(co2){
    const pct = Math.min(100, Math.round((co2 / GAME_CONFIG.loseCo2Threshold) * 100));
    const fill = document.getElementById('heat-fill'); if(fill){ fill.style.width = pct + '%'; }
  }

  const tooltipEl = { el: null };
  function showTooltip(x, y, text){
    if(!tooltipEl.el) tooltipEl.el = document.getElementById('tooltip');
    if(!tooltipEl.el) return;
    tooltipEl.el.textContent = text;
    tooltipEl.el.style.left = x + 'px';
    tooltipEl.el.style.top = y + 'px';
    tooltipEl.el.style.display = 'block';
  }
  function hideTooltip(){ if(!tooltipEl.el) tooltipEl.el = document.getElementById('tooltip'); if(tooltipEl.el) tooltipEl.el.style.display = 'none'; }

  function animateFrameEntrance(){
    const root = document.getElementById('frame-root'); if(!root || !window.anime) return;
    root.style.opacity = 0;
    window.anime({ targets: root, opacity: [0,1], translateY: [-8,0], duration: 600, easing: 'easeOutQuad' });
  }

  function dieGlyph(n){
    // Unicode die faces 1..6: U+2680..U+2685
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    return faces[Math.max(1, Math.min(6, n)) - 1];
  }

  function spinDiceOverlay(finalValue){
    const el = document.getElementById('dice-3d'); if(!el) return;
    el.style.opacity = 1; el.style.transformOrigin = '50% 50%';
    el.textContent = dieGlyph(finalValue);
    if(window.anime){
      window.anime({
        targets: el,
        rotate: ['0deg','720deg'],
        scale: [0.8, 1.2, 1],
        translateY: [-20, -10, 0],
        duration: 700,
        easing: 'easeOutCubic',
        complete: ()=>{ el.style.opacity = 0; }
      });
    } else {
      setTimeout(()=>{ el.style.opacity = 0; }, 700);
    }
  }

  class MainScene extends Phaser.Scene {
    constructor(){ super('MainScene'); }
    init(){
      this.state = { pos: 1, gp: GAME_CONFIG.initialGp, co2: GAME_CONFIG.initialCo2, turns: 0, over: false, result: null, dice: 0, msg: MESSAGES.ROLL_DICE };
      this.cells = [];
      this.powerUps = { reroll: 1, offset: 1, double: 0, doubleActive: false };
      this.currentHighlight = null;
    }
    create(){
      animateFrameEntrance();
      const { width, height } = this.cameras.main;
      this.bg = this.add.rectangle(width/2, height/2, width, height, 0x87CEEB);
      this.add.text(width/2, 30, '🌍 ECO DICE GAME', { fontSize: '24px', color:'#2E7D32', fontStyle:'bold' }).setOrigin(0.5);
      this.drawBoard();
      this.createPlayer();
      this.createUI();
      this.createRollButton();
      this.updateDisplay();

      const rerollBtn = document.getElementById('pu-reroll');
      const offsetBtn = document.getElementById('pu-offset');
      const doubleBtn = document.getElementById('pu-double');
      document.getElementById('btn-restart').onclick = ()=> { sfxClick(); window.location.reload(); };
      document.getElementById('btn-help').onclick = ()=> { sfxClick(); document.getElementById('help').classList.add('open'); };
      document.getElementById('help-close').onclick = ()=> { sfxClick(); document.getElementById('help').classList.remove('open'); };
      rerollBtn.onclick = () => { sfxClick(); this.useReroll(); };
      offsetBtn.onclick = () => { sfxClick(); this.useOffset(); };
      doubleBtn.onclick = () => { sfxClick(); this.useDouble(); };
      this.syncPowerUpsUI();
      this.updateHighlight();
      setHeat(this.state.co2);
    }
    drawBoard(){
      const { width } = this.cameras.main;
      const boardWidth = 720, boardHeight = 480; const startX = (width-boardWidth)/2, startY = 80;
      const cellW = boardWidth/6, cellH = boardHeight/5;
      BOARD_LAYOUT.forEach((cell, idx) => {
        const row = Math.floor(idx/6), col = idx%6;
        const x = startX + ((row%2===0)? col : (5-col)) * cellW + cellW/2;
        const y = startY + row * cellH + cellH/2;
        const rect = this.add.rectangle(x, y, cellW-6, cellH-6, cell.color).setStrokeStyle(3, 0x1b5e20).setInteractive({ useHandCursor:true });
        const label = this.add.text(x, y-10, String(cell.position), { fontSize:'13px', color:'#0d0d0d', fontStyle:'bold' }).setOrigin(0.5);
        const icon = cell.cellType==='bonus'?'🌱':cell.cellType==='penalty'?'⚠️':cell.cellType==='special'?'🎯':'🌍';
        const iconObj = this.add.text(x, y+7, icon, { fontSize:'18px' }).setOrigin(0.5);
        rect.on('pointerover', (p)=>{
          const impact = `${cell.message}`;
          const bounds = rect.getBounds();
          const world = this.cameras.main.worldView;
          showTooltip(bounds.centerX - world.x, bounds.y - world.y, impact);
        });
        rect.on('pointerout', ()=> hideTooltip());
        this.cells[cell.position-1] = rect;
      });
    }
    createPlayer(){
      const { width } = this.cameras.main; const startX = (width-720)/2 + 50; const startY = 120;
      this.player = this.add.circle(startX, startY, 15, 0xFF6B6B).setStrokeStyle(3, 0xFFFFFF);
      this.tweens.add({ targets: this.player, alpha: 0.85, duration: 900, yoyo: true, repeat: -1 });
    }
    createUI(){
      const { width, height } = this.cameras.main;
      const panel = this.add.rectangle(100, height/2, 260, 320, 0xFFFFFF).setStrokeStyle(2,0x1b5e20).setAlpha(0.96);
      this.gpText = this.add.text(100, height/2-110, '🌱 GP: 0', { fontSize:'18px', color:'#2E7D32', fontStyle:'bold' }).setOrigin(0.5);
      this.co2Text = this.add.text(100, height/2-70, '💨 CO₂: 0', { fontSize:'18px', color:'#D32F2F', fontStyle:'bold' }).setOrigin(0.5);
      this.turnText = this.add.text(100, height/2-30, '🔄 Turns: 0', { fontSize:'16px', color:'#1976D2' }).setOrigin(0.5);
      this.dice = this.add.text(100, height/2+10, '🎲 Dice: 0', { fontSize:'16px', color:'#7B1FA2' }).setOrigin(0.5);
      this.messageText = this.add.text(100, height/2+55, 'Roll the dice!', { fontSize:'14px', color:'#424242', wordWrap:{ width:220 } }).setOrigin(0.5);
    }
    createRollButton(){
      const { width, height } = this.cameras.main;
      this.rollBtn = this.add.rectangle(width/2, height-80, 220, 56, 0x4CAF50).setStrokeStyle(3,0x2E7D32).setInteractive({ useHandCursor:true });
      this.rollBtnText = this.add.text(width/2, height-80, '🎲 ROLL DICE', { fontSize:'16px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5);
      this.rollBtn.on('pointerdown', ()=>{ if(!this.state.over){ sfxRoll(); this.rollDice(); }});
      this.rollBtn.on('pointerover', ()=> this.rollBtn.setFillStyle(0x66BB6A));
      this.rollBtn.on('pointerout', ()=> this.rollBtn.setFillStyle(0x4CAF50));
    }
    async rollDice(){
      const overlay = document.getElementById('dice-3d');
      this.rollBtnText.setText('Rolling...'); this.rollBtn.setFillStyle(0x9E9E9E);
      // preview spins
      for(let i=0;i<10;i++){
        const r = 1+Math.floor(Math.random()*6);
        this.dice.setText('🎲 Dice: '+r);
        if(overlay){ overlay.style.opacity = 1; overlay.textContent = dieGlyph(r); }
        await new Promise(rz=>setTimeout(rz,90));
      }
      // final value
      const value = 1+Math.floor(Math.random()*6);
      this.state.dice = value; this.dice.setText('🎲 Dice: '+value);
      spinDiceOverlay(value);
      setTimeout(()=>{ this.movePlayer(value); this.rollBtnText.setText('🎲 ROLL DICE'); this.rollBtn.setFillStyle(0x4CAF50); }, 350);
    }
    movePlayer(dice){
      if(this.state.over) return; let move = dice;
      if(this.powerUps.doubleActive){ move = dice*2; this.powerUps.doubleActive = false; }
      const newPos = Math.min(this.state.pos + move, GAME_CONFIG.boardSize);
      this.state.turns++;
      this.state.pos = newPos;
      const cell = BOARD_LAYOUT.find(c=>c.position===newPos);
      if(cell){
        const beforeGp = this.state.gp, beforeCo2 = this.state.co2;
        this.state.gp = Math.max(0, this.state.gp + cell.gpDelta);
        this.state.co2 = Math.max(0, this.state.co2 + cell.co2Delta);
        this.state.msg = cell.message;
        const gpDelta = this.state.gp - beforeGp; const co2Delta = this.state.co2 - beforeCo2;
        this.onBaseDelta(gpDelta, co2Delta);
      }
      this.animatePlayer(); this.updateDisplay(); this.updateHighlight(); setHeat(this.state.co2); this.updateWarmingTint();

      if(!this.state.over){
        const challenge = CELL_CHALLENGES[String(newPos)] || CELL_CHALLENGES[newPos];
        const roll = Math.random();
        if(challenge && roll < 0.75){
          openModal(challenge, (opt)=>{
            const beforeGp = this.state.gp, beforeCo2 = this.state.co2;
            this.state.gp = Math.max(0, this.state.gp + (opt.gp||0));
            this.state.co2 = Math.max(0, this.state.co2 + (opt.co2||0));
            this.applyOutcome(beforeGp, beforeCo2);
            setHeat(this.state.co2); this.updateWarmingTint();
          });
        } else if(roll < 0.2){
          openModal(pick(RANDOM_EVENTS), (opt)=>{ const bg=this.state.gp, bc=this.state.co2; this.state.gp=Math.max(0,this.state.gp+(opt.gp||0)); this.state.co2=Math.max(0,this.state.co2+(opt.co2||0)); this.applyOutcome(bg, bc); setHeat(this.state.co2); this.updateWarmingTint(); });
        } else if(roll < 0.35){
          openModal(pick(QUIZZES), (opt)=>{ const bg=this.state.gp, bc=this.state.co2; this.state.gp=Math.max(0,this.state.gp+(opt.gp||0)); this.state.co2=Math.max(0,this.state.co2+(opt.co2||0)); this.applyOutcome(bg, bc); setHeat(this.state.co2); this.updateWarmingTint(); });
        }
      }
      this.checkEnd();
    }
    onBaseDelta(gpDelta, co2Delta){
      if(co2Delta>0 || gpDelta<0){ sfxNegative(); flashRed(); }
      else if(co2Delta<0 || gpDelta>0){ sfxPositive(); }
      else { sfxMove(); }
    }
    applyOutcome(beforeGp, beforeCo2){
      const gpDelta = this.state.gp - beforeGp; const co2Delta = this.state.co2 - beforeCo2;
      if(co2Delta>0 || gpDelta<0){ sfxNegative(); flashRed(); } else if(co2Delta<0 || gpDelta>0){ sfxPositive(); } else { sfxMove(); }
      this.updateDisplay(); this.checkEnd();
    }
    animatePlayer(){
      const { width } = this.cameras.main; const boardWidth = 720, boardHeight = 480; const startX = (width-boardWidth)/2, startY = 80; const cellW = boardWidth/6, cellH = boardHeight/5;
      const r = Math.floor((this.state.pos-1)/6); const c = (this.state.pos-1)%6;
      const x = startX + ((r%2===0)? c : (5-c)) * cellW + cellW/2; const y = startY + r * cellH + cellH/2;
      this.tweens.add({ targets: this.player, x, y, duration: 720, ease: 'Power2' });
    }
    updateHighlight(){
      if(this.currentHighlight){ this.currentHighlight.setStrokeStyle(3, 0x1b5e20); this.currentHighlight = null; }
      const rect = this.cells[this.state.pos-1]; if(!rect) return;
      rect.setStrokeStyle(5, 0x00c853);
      this.currentHighlight = rect;
    }
    updateWarmingTint(){
      const ratio = Math.min(1, this.state.co2 / GAME_CONFIG.loseCo2Threshold);
      const base = 0x87CEEB; // sky blue
      const hot = 0xffe0b2; // warm tint
      const blend = (a,b,t)=>(((a>>16)&255)+(((b>>16)&255-(a>>16)&255)*t))<<16 | (((a>>8)&255)+(((b>>8)&255-(a>>8)&255)*t))<<8 | ((a&255)+(((b&255)-(a&255))*t));
      const color = blend(base, hot, ratio);
      this.bg.fillColor = color;
    }
    updateDisplay(){
      this.gpText.setText('🌱 GP: '+this.state.gp);
      this.co2Text.setText('💨 CO₂: '+this.state.co2);
      this.turnText.setText('🔄 Turns: '+this.state.turns);
      this.messageText.setText(this.state.msg);
      if(this.state.co2>=15) this.co2Text.setColor('#D32F2F'); else if(this.state.co2>=10) this.co2Text.setColor('#F57C00'); else this.co2Text.setColor('#388E3C');
      const rr = document.getElementById('pu-reroll'); const of = document.getElementById('pu-offset'); const db = document.getElementById('pu-double');
      if(rr) rr.disabled = this.powerUps.reroll<=0 || this.state.over;
      if(of) of.disabled = this.powerUps.offset<=0 || this.state.over;
      if(db) db.disabled = this.powerUps.double<=0 || this.state.over;
    }
    checkEnd(){
      if(this.state.co2 >= GAME_CONFIG.loseCo2Threshold){ this.end('lose'); return; }
      if(this.state.pos >= GAME_CONFIG.boardSize){ if(this.state.gp >= GAME_CONFIG.winGpThreshold) this.end('win'); else this.end('lose'); return; }
      if(this.state.turns >= GAME_CONFIG.maxTurns){ this.end('lose'); }
    }
    end(type){
      this.state.over = true; this.state.result = type; this.rollBtn.setVisible(false); this.rollBtnText.setVisible(false);
      const msg = type==='win' ? '🎉 CONGRATULATIONS! YOU SAVED THE EARTH! 🎉' : '💀 GAME OVER! EARTH GOT TOO HOT! 💀';
      this.messageText.setText(msg).setColor(type==='win'? '#2E7D32':'#D32F2F').setFontSize('16px');
      if(type==='lose') this.cameras.main.shake(350, 0.004);
    }
    // Helpers
    syncPowerUpsUI(){
      document.getElementById('pu-reroll-c').textContent = String(this.powerUps.reroll);
      document.getElementById('pu-offset-c').textContent = String(this.powerUps.offset);
      document.getElementById('pu-double-c').textContent = String(this.powerUps.double);
    }
    useReroll(){ if(this.state.over) return; if(this.powerUps.reroll<=0) return; this.powerUps.reroll--; this.state.dice = 1+Math.floor(Math.random()*6); this.dice.setText('🎲 Dice: '+this.state.dice); this.syncPowerUpsUI(); this.updateDisplay(); }
    useOffset(){ if(this.state.over) return; if(this.powerUps.offset<=0) return; this.powerUps.offset--; this.state.co2 = Math.max(0, this.state.co2 - 2); this.updateDisplay(); this.syncPowerUpsUI(); sfxPositive(); setHeat(this.state.co2); this.updateWarmingTint(); }
    useDouble(){ if(this.state.over) return; if(this.powerUps.double<=0) return; this.powerUps.double--; this.powerUps.doubleActive = true; this.syncPowerUpsUI(); sfxClick(); this.updateDisplay(); }
  }

  function pick(list){ return list[Math.floor(Math.random()*list.length)]; }

  const config = { type: Phaser.AUTO, width: 1200, height: 800, parent: 'game', backgroundColor: '#87CEEB', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: MainScene };
  new Phaser.Game(config);
})();
