/* eslint-disable */
// Ported from the TechnoVERGE design prototype. Scene, screens, x-ray post pass and camera shots.
import * as THREE from 'three';

export const XR = [null, [0.34, 0.44, 0.74, 0.82], [0.3, 0.4, 1.1, 1.2], [0.28, 0.38, 1.1, 1.2], [0.22, 0.32, 0.8, 0.88], null, [0.36, 0.48, 1.1, 1.2], null];
export const FOCUS = [0.45, 0.62, 0.55, 0.5, 0.5, 0.62, 0.42, 0.45];

export class Engine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ fonts: { bar: string, cond: string, mono: string }, reduced: boolean }} opts
   */
  constructor(canvas, opts) {
    this.canvas = canvas;
    this.F = opts.fonts;
    this.reduced = !!opts.reduced;
    this.XR = XR; this.FOCUS = FOCUS; this.LENS_R = 150;
    this.ptr = { x: 0, y: 0 };
    this.shot = null; this.build = 0; this.xrNow = 0; this.xrShot = -1; this.lensOn = false;
    this.dead = false; this.three = null;
  }

  sm(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  dispose() {
    this.dead = true;
    if (this.ro) this.ro.disconnect();
    const th = this.three; if (!th) return;
    [th.rtA, th.rtB, th.rtN, th.rtNet].forEach((t) => t && t.dispose());
    th.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); });
    th.renderer.dispose();
  }

  tex(T, w, h, draw, rx, ry) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g, w, h);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
    if (rx) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); }
    return t;
  }

  rackFace(g, w, h, kind, seed) {
    let s = seed || 7; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const U = (h - 24) / 42, x0 = 22, x1 = w - 22, top = 12;
    g.fillStyle = kind === 'legacy' ? '#2A2D2C' : '#1D2123'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3A4043'; g.fillRect(8, 0, 12, h); g.fillRect(w - 20, 0, 12, h);
    g.fillStyle = '#596164'; for (let u = 0; u < 42; u++) { g.fillRect(12, top + u * U + U / 2 - 1, 4, 2); g.fillRect(w - 16, top + u * U + U / 2 - 1, 4, 2); }
    const led = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 4, 3); };
    const ok = kind === 'legacy' ? null : '#37C76A';
    let u = 0;
    const unit = (n, draw) => { const y = top + u * U; draw(y, n * U); u += n; };
    const server1 = (y, hh, beige) => { g.fillStyle = beige ? '#C9C4B2' : '#2F3538'; g.fillRect(x0, y + 1, x1 - x0, hh - 2); g.fillStyle = beige ? '#A9A491' : '#3E464A'; for (let i = 0; i < 8; i++) g.fillRect(x0 + 6 + i * 16, y + 3, 12, hh - 6); g.fillStyle = beige ? '#8D8875' : '#252A2C'; g.fillRect(x1 - 52, y + 3, 44, hh - 6); led(x1 - 46, y + hh / 2 - 1, ok || (r() < 0.35 ? '#E39A2C' : '#5FAE6B')); led(x1 - 38, y + hh / 2 - 1, ok || '#5FAE6B'); };
    const server2 = (y, hh) => { g.fillStyle = '#2B3134'; g.fillRect(x0, y + 1, x1 - x0, hh - 2); g.fillStyle = '#3A4246'; for (let i = 0; i < 12; i++) g.fillRect(x0 + 6 + i * 13, y + 4, 10, hh / 2 - 5); g.fillStyle = '#20262A'; for (let i = 0; i < 24; i++) { g.beginPath(); g.arc(x0 + 10 + i * 7, y + hh * 0.75, 2, 0, 6.283); g.fill(); } led(x1 - 16, y + 5, ok || '#5FAE6B'); };
    const patch = (y, hh, plugs) => { g.fillStyle = '#16191A'; g.fillRect(x0, y + 1, x1 - x0, hh - 2); for (let i = 0; i < 24; i++) { const px = x0 + 8 + i * 8.4; g.fillStyle = '#0B0C0D'; g.fillRect(px, y + hh / 2 - 2, 6, 5); if (plugs && r() < 0.8) { g.fillStyle = ['#2F6FB0', '#2F6FB0', '#D9B33A', '#8C9294', '#B84B3B'][Math.floor(r() * 5)]; g.fillRect(px, y + hh / 2 - 3, 6, 7); } } g.fillStyle = '#E8EAE6'; g.fillRect(x0 + 2, y + 2, 14, hh - 4); };
    const sw = (y, hh) => { g.fillStyle = '#23292C'; g.fillRect(x0, y + 1, x1 - x0, hh - 2); for (let i = 0; i < 24; i++) { g.fillStyle = '#0D0F10'; g.fillRect(x0 + 10 + i * 7.4, y + 3, 5, hh / 2 - 3); g.fillRect(x0 + 10 + i * 7.4, y + hh / 2 + 1, 5, hh / 2 - 4); if (kind !== 'legacy') led(x0 + 10 + i * 7.4, y + 1, '#37C76A'); } };
    const blank = (y, hh) => { g.fillStyle = '#1A1E20'; g.fillRect(x0, y + 1, x1 - x0, hh - 2); g.fillStyle = '#23282A'; g.fillRect(x0, y + hh - 3, x1 - x0, 1); };
    const gpu = (y, hh) => { g.fillStyle = '#272C2E'; g.fillRect(x0, y + 1, x1 - x0, hh - 2); g.fillStyle = '#121516'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x0 + 18 + i * 31, y + hh / 2, hh * 0.36, 0, 6.283); g.fill(); g.strokeStyle = '#3A4246'; g.lineWidth = 2; g.beginPath(); g.arc(x0 + 18 + i * 31, y + hh / 2, hh * 0.36, 0, 6.283); g.stroke(); } led(x1 - 14, y + 4, '#E8F2EA'); led(x1 - 14, y + 10, '#37C76A'); };
    const void_ = (y, hh) => { g.fillStyle = '#080909'; g.fillRect(x0, y, x1 - x0, hh); };
    if (kind === 'legacy') {
      unit(1, (y, hh) => patch(y, hh, true)); unit(1, (y, hh) => patch(y, hh, true)); unit(1, sw); unit(2, void_);
      while (u < 40) { const p = r(); if (p < 0.35) unit(1, (y, hh) => server1(y, hh, r() < 0.5)); else if (p < 0.55) unit(2, server2); else unit(1 + Math.floor(r() * 3), void_); }
    } else if (kind === 'core') {
      unit(2, (y, hh) => patch(y, hh, true)); unit(1, blank);
      for (let k = 0; k < 8; k++) unit(3, (y, hh) => { g.fillStyle = '#2A3033'; g.fillRect(x0, y + 1, x1 - x0, hh - 2); for (let i = 0; i < 32; i++) { g.fillStyle = '#0D0F10'; g.fillRect(x0 + 8 + i * 5.4, y + 6, 4, hh - 14); } led(x0 + 6, y + 4, '#37C76A'); g.fillStyle = '#D9B33A'; for (let i = 0; i < 10; i++) g.fillRect(x0 + 12 + i * 16, y + hh - 8, 3, 6); });
    } else if (kind === 'gpu') {
      unit(1, (y, hh) => patch(y, hh, true)); unit(1, sw); unit(1, blank);
      while (u < 38) unit(4, gpu);
    } else {
      unit(1, (y, hh) => patch(y, hh, true)); unit(1, (y, hh) => patch(y, hh, true)); unit(1, sw); unit(1, blank);
      while (u < 40) { const p = r(); if (p < 0.45) unit(1, (y, hh) => server1(y, hh, false)); else if (p < 0.8) unit(2, server2); else unit(1, blank); }
    }
    while (u < 42) unit(1, blank);
  }

  doorOver(T, g, w, h, density) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const d = c.getContext('2d');
    d.fillStyle = '#1B1F21'; d.fillRect(0, 0, w, h);
    d.globalCompositeOperation = 'destination-out';
    for (let y = 30; y < h - 30; y += density) for (let x = 26; x < w - 30; x += density) { d.beginPath(); d.arc(x + ((y / density) % 2) * density / 2, y, density * 0.36, 0, 6.283); d.fill(); }
    d.globalCompositeOperation = 'source-over';
    g.globalAlpha = 0.86; g.drawImage(c, 0, 0); g.globalAlpha = 1;
    g.fillStyle = '#2E3538'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h);
    g.fillStyle = '#6E787B'; g.fillRect(w - 28, 220, 7, 92);
    g.fillStyle = '#E4E7E2'; g.fillRect(22, 16, 64, 14); g.fillStyle = '#1B1F21'; g.fillRect(26, 21, 36, 2); g.fillRect(26, 25, 22, 2);
  }

  screens() {
    const BAR = '' + this.F.bar + ', Helvetica, Arial, sans-serif', CON = '' + this.F.cond + ', Helvetica, Arial, sans-serif', MON = '' + this.F.mono + ', Menlo, Consolas, monospace';
    const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
    const pill = (g, x, y, t, bg, fg, px) => { g.font = '600 ' + (px || 13) + 'px ' + BAR; const tw = g.measureText(t).width; g.fillStyle = bg; rr(g, x, y, tw + 20, (px || 13) + 13, 4); g.fill(); g.fillStyle = fg; g.fillText(t, x + 10, y + (px || 13) + 3); return tw + 20; };
    const right = (g, t, x, y) => { g.textAlign = 'right'; g.fillText(t, x, y); g.textAlign = 'left'; };
    const appBar = (g, w, title, meta, dark) => { g.fillStyle = dark ? '#1F2A30' : '#2B3134'; g.fillRect(0, 0, w, 48); g.fillStyle = '#EEF0EE'; g.font = '600 20px ' + BAR; g.fillText(title, 20, 31); g.fillStyle = '#9AA3A5'; g.font = '500 15px ' + MON; right(g, meta, w - 20, 31); };

    const mail = (g, w, h, st) => {
      g.textBaseline = 'alphabetic';
      if (st <= 2) {
        g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h);
        appBar(g, w, 'Mail', 'f.alharbi  ·  Finance');
        g.fillStyle = '#F2F3F1'; g.fillRect(0, 48, 190, h - 48);
        [['Inbox', st >= 1 ? '4' : '3'], ['Sent', ''], ['Drafts', ''], ['Invoices', ''], ['Archive', '']].forEach((fd, i) => { const y = 92 + i * 42; if (i === 0) { g.fillStyle = '#DCE6EE'; g.fillRect(8, y - 27, 174, 38); } g.fillStyle = '#24292B'; g.font = (i === 0 ? '600 ' : '500 ') + '18px ' + BAR; g.fillText(fd[0], 22, y); if (fd[1]) { g.fillStyle = '#2F6FB0'; g.fillText(fd[1], 158, y); } });
        if (st < 2) {
          g.fillStyle = '#15191A'; g.font = '600 28px ' + BAR; g.fillText('Inbox', 214, 92);
          const rows = [['Plant HSE', 'Weekly safety bulletin: hot work permits', '06:31'], ['Procurement', 'PO 88412 approved', '06:12'], ['IT Service Desk', 'Planned maintenance on Thursday', '05:58'], ['Treasury', 'Month-end close checklist', 'Yesterday'], ['Human Resources', 'Updated working hours', 'Yesterday']];
          if (st === 1) rows.unshift(['Gulf Freight Services', 'Shipment on hold: invoice overdue', '06:44']);
          rows.slice(0, 6).forEach((r, i) => {
            const y = 110 + i * 86, nw = st === 1 && i === 0;
            if (nw) { g.fillStyle = '#EEF4F9'; g.fillRect(196, y, w - 196, 86); g.fillStyle = '#2F6FB0'; g.fillRect(196, y, 6, 86); }
            g.fillStyle = '#E4E6E3'; g.fillRect(214, y + 85, w - 228, 1);
            g.fillStyle = '#15191A'; g.font = (nw ? '700 ' : '600 ') + '21px ' + BAR; g.fillText(r[0], 224, y + 36);
            g.fillStyle = nw ? '#15191A' : '#4A5254'; g.font = (nw ? '600 ' : '400 ') + '19px ' + BAR; g.fillText(r[1], 224, y + 66);
            g.fillStyle = '#6B7375'; g.font = '500 16px ' + BAR; right(g, r[2], w - 24, y + 36);
            if (nw) { g.textAlign = 'left'; pill(g, w - 124, y + 48, 'EXTERNAL', '#F6ECCF', '#7A5A12'); }
          });
        } else {
          g.fillStyle = '#15191A'; g.font = '600 30px ' + BAR; g.fillText('Shipment on hold: invoice overdue', 214, 96);
          g.fillStyle = '#4A5254'; g.font = '500 18px ' + BAR; g.fillText('Gulf Freight Services <billing@gulffreight-billing.co>', 214, 130); g.fillText('To: f.alharbi   ·   06:44', 214, 156);
          g.fillStyle = '#FBF0D2'; g.fillRect(214, 176, w - 238, 50); g.fillStyle = '#C99A22'; g.fillRect(214, 176, 6, 50);
          g.fillStyle = '#6E5210'; g.font = '600 18px ' + BAR; g.fillText('Caution: external sender. This link goes to a domain registered 3 days ago.', 234, 208);
          g.fillStyle = '#24292B'; g.font = '400 20px ' + BAR; ['Dear customer,', 'Your shipment GF-20931 is on hold because invoice INV-7741 is', 'overdue. Please review and settle today to avoid demurrage', 'charges at the port.'].forEach((l, i) => g.fillText(l, 214, 270 + i * 32));
          g.fillStyle = '#2F6FB0'; g.fillRect(214, 412, 200, 54); g.fillStyle = '#FFFFFF'; g.font = '600 20px ' + BAR; g.fillText('View invoice', 252, 446);
          const cx = 352, cy = 444; g.fillStyle = '#FFFFFF'; g.strokeStyle = '#15191A'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 32); g.lineTo(cx + 8, cy + 25); g.lineTo(cx + 14, cy + 38); g.lineTo(cx + 20, cy + 36); g.lineTo(cx + 14, cy + 23); g.lineTo(cx + 24, cy + 23); g.closePath(); g.fill(); g.stroke();
        }
      } else if (st === 3) {
        g.fillStyle = '#F4F5F7'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#E3E6E8'; g.fillRect(0, 0, w, 64); g.fillStyle = '#FFFFFF'; rr(g, 70, 14, w - 140, 36, 18); g.fill();
        g.fillStyle = '#5A6264'; g.font = '500 17px ' + MON; g.fillText('gulffreight-billing.co/secure/invoice-login', 100, 38);
        g.fillStyle = '#FFFFFF'; g.strokeStyle = '#DADDE0'; g.lineWidth = 2; g.fillRect(272, 104, 480, 470); g.strokeRect(272, 104, 480, 470);
        g.fillStyle = '#1E3A5F'; g.font = '700 26px ' + CON; g.fillText('GULF FREIGHT SERVICES', 304, 154);
        g.fillStyle = '#15191A'; g.font = '600 26px ' + BAR; g.fillText('Sign in to view your invoice', 304, 206);
        g.fillStyle = '#5A6264'; g.font = '500 16px ' + BAR; g.fillText('Use your work username and password', 304, 236);
        [['Username', 'f.alharbi'], ['Password', '••••••••••']].forEach((fl, i) => { const y = 268 + i * 96; g.fillStyle = '#4A5254'; g.font = '600 15px ' + BAR; g.fillText(fl[0], 304, y); g.strokeStyle = i ? '#2F6FB0' : '#C9CDD0'; g.lineWidth = 2; g.strokeRect(304, y + 12, 416, 48); g.fillStyle = '#15191A'; g.font = '500 20px ' + BAR; g.fillText(fl[1], 320, y + 44); });
        g.fillStyle = '#15191A'; g.fillRect(440, 420, 2, 26);
        g.fillStyle = '#1E3A5F'; g.fillRect(304, 476, 416, 54); g.fillStyle = '#FFFFFF'; g.font = '600 20px ' + BAR; g.fillText('Sign in', 476, 510);
      } else if (st === 4) {
        g.fillStyle = '#1F2A30'; g.fillRect(0, 0, w, h);
        g.strokeStyle = '#7FD3A0'; g.lineWidth = 7; g.beginPath(); g.arc(512, 150, 30, Math.PI, 0); g.stroke(); g.fillStyle = '#7FD3A0'; g.fillRect(470, 150, 84, 64);
        g.fillStyle = '#F2F3F0'; g.font = '600 44px ' + BAR; g.textAlign = 'center'; g.fillText('This device has been isolated', 512, 290);
        g.fillStyle = '#B9C2C0'; g.font = '400 22px ' + BAR; g.fillText('Your security team has disconnected this laptop from the', 512, 340); g.fillText('network while they investigate. Please contact the service desk.', 512, 372);
        g.textAlign = 'left'; let x = 250; [['Network: blocked', '#3A2C27', '#F2B8A4'], ['Security agent: connected', '#24402F', '#9FE0B6'], ['Case 4127', '#2B3740', '#C9D6E2']].forEach((c) => { x += pill(g, x, 420, c[0], c[1], c[2], 18) + 14; });
      } else {
        const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E7EDEF'); gr.addColorStop(1, '#D3DCDF'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.fillStyle = '#15191A'; g.textAlign = 'center'; g.font = '600 120px ' + CON; g.fillText('11:30', 512, 200);
        g.font = '600 30px ' + BAR; g.fillText('F. Alharbi', 512, 268);
        g.fillStyle = '#4A5254'; g.font = '400 20px ' + BAR; g.fillText('Welcome back. This laptop was rebuilt by your security team.', 512, 306);
        g.textAlign = 'left'; let x = 232; ['Clean image', 'New password', 'Multi-factor on'].forEach((t) => { x += pill(g, x, 350, '✓  ' + t, '#DCEBE1', '#24533A', 18) + 14; });
        g.fillStyle = '#15191A'; g.fillRect(412, 430, 200, 54); g.fillStyle = '#FFFFFF'; g.font = '600 20px ' + BAR; g.textAlign = 'center'; g.fillText('Sign in', 512, 464); g.textAlign = 'left';
      }
    };

    const vpn = (g, w, h, k) => {
      const n = k % 10, ban = k >= 10;
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h); appBar(g, w, 'Identity  ·  Sign-in log', 'VPN-GW-01', true);
      let y = 48;
      if (ban) { g.fillStyle = '#E5F1E9'; g.fillRect(0, 48, w, 56); g.fillStyle = '#2F5B40'; g.fillRect(0, 48, 6, 56); g.fillStyle = '#24533A'; g.font = '600 19px ' + BAR; g.fillText('Policy enforced: new device and new country need multi-factor sign-in.', 22, 83); y = 104; }
      g.fillStyle = '#F1F2EF'; g.fillRect(0, y, w, 40); g.fillStyle = '#5A6264'; g.font = '500 13px ' + MON; ['TIME', 'USER', 'SOURCE', 'DEVICE', 'RESULT'].forEach((t, i) => g.fillText(t, [20, 136, 262, 640, 836][i], y + 26)); y += 40;
      const fresh = [['03:14:30', 'f.alharbi', '203.0.113.41 · outside GCC', 'Unknown', 'BLOCKED'], ['03:12:09', 'f.alharbi', 'MFA push · not approved', 'Phone', 'DENIED'], ['03:12:07', 'f.alharbi', '203.0.113.41 · outside GCC', 'Unknown', 'BLOCKED']];
      const old = [['07:58:12', 'f.alharbi', 'Office · Building A', 'FIN-LT-061', 'SUCCESS'], ['07:41:55', 'm.saeed', 'Office · Building A', 'ENG-LT-022', 'SUCCESS'], ['07:30:02', 'a.khan', 'Control building', 'OPS-WS-004', 'SUCCESS'], ['07:12:40', 'r.das', 'Office · Building B', 'HSE-LT-009', 'SUCCESS']];
      fresh.slice(3 - n).concat(old).slice(0, 7).forEach((r) => {
        const bad = r[4] !== 'SUCCESS';
        if (bad) { g.fillStyle = '#FFF6F2'; g.fillRect(0, y, w, 62); }
        g.fillStyle = '#E6E8E5'; g.fillRect(0, y + 61, w, 1);
        g.fillStyle = '#4A5254'; g.font = '500 16px ' + MON; g.fillText(r[0], 20, y + 38);
        g.fillStyle = '#15191A'; g.font = (bad ? '600 ' : '500 ') + '19px ' + BAR; g.fillText(r[1], 136, y + 38); g.fillText(r[2], 262, y + 38); g.fillText(r[3], 640, y + 38);
        pill(g, 836, y + 18, r[4], bad ? '#F6DED6' : '#ECEDEA', bad ? '#9A3A22' : '#4A5254', 14);
        y += 62;
      });
    };

    const fw = (g, w, h, n) => {
      g.fillStyle = '#0F1314'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1C2224'; g.fillRect(0, 0, w, 52); g.fillStyle = '#E4E8E6'; g.font = '600 22px ' + MON; g.fillText('FW-OT-01', 20, 34); g.fillStyle = '#8D9794'; g.font = '500 17px ' + MON; g.fillText('IT/OT boundary', 160, 34);
      g.fillStyle = n > 0 ? '#E8B04A' : '#8D9794'; right(g, 'denied today: ' + (32 + n), w - 20, 34);
      g.font = '500 17px ' + MON; g.fillStyle = '#6F7A77'; g.fillText('policy IT-OT-DEFAULT-DENY  action deny  log on', 20, 90);
      const dst = [['172.16.1.10:502', 'modbus'], ['172.16.1.21:3389', 'rdp'], ['172.16.1.11:502', 'modbus'], ['172.16.1.30:44818', 'enip'], ['172.16.1.12:102', 's7comm'], ['172.16.1.22:5900', 'vnc'], ['172.16.1.13:502', 'modbus'], ['172.16.1.40:445', 'smb'], ['172.16.1.14:502', 'modbus']];
      const lines = [];
      lines.push(['08:59:40', 'allow', '10.20.9.5', '172.30.0.8:443', 'historian', 'OFFICE→DMZ']);
      lines.push(['09:00:02', 'allow', '10.20.7.12', '172.30.0.9:443', 'reports', 'OFFICE→DMZ']);
      for (let i = 0; i < n; i++) { const s = 14 + i * 3; lines.push(['09:02:' + String(s).padStart(2, '0'), 'deny', '10.20.4.61', dst[i][0], dst[i][1], 'OFFICE→CONTROL']); }
      lines.slice(-11).forEach((l, i) => {
        const y = 134 + i * 44, x = 20;
        g.fillStyle = '#6F7A77'; g.fillText(l[0], x, y);
        g.fillStyle = l[1] === 'deny' ? '#E8B04A' : '#7FD3A0'; g.font = '600 17px ' + MON; g.fillText(l[1].toUpperCase(), x + 104, y); g.font = '500 17px ' + MON;
        g.fillStyle = '#C9D1CF'; g.fillText(l[2] + ' → ' + l[3], x + 180, y); g.fillStyle = '#8D9794'; g.fillText(l[4], x + 600, y); g.fillText(l[5], x + 730, y);
      });
    };

    const kase = (g, w, h, n) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h); appBar(g, w, 'SOC  ·  Case 4127', 'Analyst: R. Menon', true);
      pill(g, 20, 70, 'HIGH', '#F6DED6', '#9A3A22', 15); pill(g, 92, 70, n >= 5 ? 'CONTAINING' : 'INVESTIGATING', '#E3ECF3', '#2F5A78', 15);
      g.fillStyle = '#15191A'; g.font = '600 28px ' + BAR; g.fillText('Phishing, then attempts to reach the plant · same user', 20, 140);
      g.fillStyle = '#5A6264'; g.font = '500 13px ' + MON; g.fillText('CORRELATED SIGNALS', 20, 182);
      const sig = [['Yday 06:44', 'Email', 'Phishing link opened on FIN-LT-061'], ['03:12', 'Identity', 'VPN sign-in blocked · f.alharbi · outside GCC'], ['09:02', 'OT firewall', '41 denied connections to the control network'], ['09:05', 'Endpoint', 'Unknown process scanning 172.16.1.0/24']];
      sig.slice(0, Math.min(4, n)).forEach((s, i) => {
        const y = 196 + i * 70; g.fillStyle = i % 2 ? '#FFFFFF' : '#F6F7F5'; g.fillRect(16, y, w - 32, 64);
        g.fillStyle = '#C24A3A'; g.fillRect(16, y, 5, 64);
        g.fillStyle = '#4A5254'; g.font = '500 16px ' + MON; g.fillText(s[0], 36, y + 40);
        g.fillStyle = '#2F5A78'; g.font = '600 18px ' + BAR; g.fillText(s[1], 170, y + 40);
        g.fillStyle = '#15191A'; g.font = '500 20px ' + BAR; g.fillText(s[2], 300, y + 40);
      });
      if (n >= 5) { g.fillStyle = '#1F2A30'; g.fillRect(0, h - 74, w, 74); g.fillStyle = '#F2F3F0'; g.font = '600 20px ' + BAR; g.fillText('Case opened 09:08  ·  time to detect 6 min', 20, h - 30); g.fillStyle = '#7FD3A0'; g.fillRect(w - 230, h - 58, 210, 44); g.fillStyle = '#15191A'; g.font = '600 18px ' + BAR; g.fillText('Isolate device', w - 186, h - 29); }
    };

    const alerts = (g, w, h) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h); appBar(g, w, 'Alert queue', 'all sites', true);
      [['HIGH', 'Phishing to OT reconnaissance', 'Refinery'], ['MED', 'Impossible travel sign-in', 'Head office'], ['LOW', 'New admin account created', 'Terminal'], ['LOW', 'Antivirus signature outdated', 'Clinic 4'], ['INFO', 'Firewall config backup done', 'Refinery'], ['INFO', 'Patch window closed', 'Head office']].forEach((a, i) => {
        const y = 60 + i * 84; g.fillStyle = '#E6E8E5'; g.fillRect(0, y + 82, w, 1);
        const c = { HIGH: ['#F6DED6', '#9A3A22'], MED: ['#F6ECCF', '#7A5A12'], LOW: ['#E3ECF3', '#2F5A78'], INFO: ['#ECEDEA', '#4A5254'] }[a[0]];
        pill(g, 20, y + 26, a[0], c[0], c[1], 16); g.fillStyle = '#15191A'; g.font = '600 24px ' + BAR; g.fillText(a[1], 120, y + 46); g.fillStyle = '#6B7375'; g.font = '500 18px ' + BAR; right(g, a[2], w - 20, y + 46);
      });
    };
    const bars = (g, w, h) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h); appBar(g, w, 'OT boundary  ·  denied connections', 'today', true);
      const v = [2, 1, 1, 3, 2, 2, 1, 4, 3, 41, 6, 3, 2]; const bw = (w - 100) / v.length;
      g.fillStyle = '#E6E8E5'; for (let i = 0; i < 4; i++) g.fillRect(60, 120 + i * 100, w - 90, 1);
      v.forEach((x, i) => { const bh = Math.max(4, x / 41 * 360); g.fillStyle = x > 20 ? '#C24A3A' : '#8D9794'; g.fillRect(70 + i * bw, 480 - bh, bw - 14, bh); g.fillStyle = '#6B7375'; g.font = '500 15px ' + MON; g.fillText(String(i).padStart(2, '0'), 70 + i * bw, 510); });
      g.fillStyle = '#15191A'; g.font = '600 22px ' + BAR; g.fillText('09:00  ·  41 denied from FIN-LT-061', 70, 560);
    };
    const sites = (g, w, h) => {
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h); appBar(g, w, 'Sites  ·  operations status', 'live', true);
      [['Refinery', 'Production normal'], ['Export terminal', 'Normal'], ['Head office', 'Normal'], ['Clinic network', 'Normal'], ['Branch offices', 'Normal']].forEach((s, i) => { const y = 70 + i * 96; g.fillStyle = '#2F9E5F'; g.beginPath(); g.arc(34, y + 36, 9, 0, 6.283); g.fill(); g.fillStyle = '#15191A'; g.font = '600 28px ' + BAR; g.fillText(s[0], 60, y + 46); g.fillStyle = '#24533A'; g.font = '500 22px ' + BAR; right(g, s[1], w - 24, y + 46); g.fillStyle = '#E6E8E5'; g.fillRect(0, y + 90, w, 1); });
    };
    const hmi = (g, w, h, v) => {
      let s = 11 + v * 7; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      g.fillStyle = '#C6CACA'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#AEB3B3'; g.fillRect(0, 0, w, 44); g.fillStyle = '#1E2224'; g.font = '600 22px ' + CON; g.fillText(['UNIT 3  ·  CRUDE DISTILLATION', 'UNIT 5  ·  HYDROTREATER', 'TANK FARM  ·  LEVELS', 'UTILITIES  ·  STEAM AND POWER'][v % 4], 16, 30);
      g.font = '500 15px ' + MON; right(g, 'NORMAL', w - 16, 29);
      g.strokeStyle = '#4E5556'; g.lineWidth = 3;
      const ves = []; const nv = 3 + (v % 2);
      for (let i = 0; i < nv; i++) { const x = 80 + i * (w - 160) / nv, vw = 60 + r() * 50, vh = 180 + r() * 220, y = h - 90 - vh; ves.push([x, y, vw, vh]); g.fillStyle = '#D7DADA'; rr(g, x, y, vw, vh, vw / 2.4); g.fill(); g.stroke(); const lv = 0.3 + r() * 0.5; g.fillStyle = '#7F94A8'; g.fillRect(x + vw + 8, y + vh * (1 - lv), 10, vh * lv); g.strokeRect(x + vw + 8, y, 10, vh); }
      g.lineWidth = 3; for (let i = 0; i < ves.length - 1; i++) { const a = ves[i], b = ves[i + 1]; g.beginPath(); g.moveTo(a[0] + a[2], a[1] + 40); g.lineTo(a[0] + a[2] + 40, a[1] + 40); g.lineTo(a[0] + a[2] + 40, b[1] + b[3] - 30); g.lineTo(b[0], b[1] + b[3] - 30); g.stroke(); }
      ves.forEach((vv) => { g.fillStyle = '#F2F3F1'; g.fillRect(vv[0] - 10, vv[1] - 38, 110, 30); g.strokeStyle = '#4E5556'; g.lineWidth = 1.5; g.strokeRect(vv[0] - 10, vv[1] - 38, 110, 30); g.fillStyle = '#15191A'; g.font = '600 18px ' + MON; g.fillText((60 + r() * 300).toFixed(1), vv[0] - 2, vv[1] - 16); g.lineWidth = 3; g.strokeStyle = '#4E5556'; });
    };
    const dash = (g, w, h) => {
      g.fillStyle = '#F3F4F0'; g.fillRect(0, 0, w, h);
      const X = 96; g.fillStyle = '#15191A'; g.font = '600 40px ' + CON; g.fillText('MS TECHNOVERGE SECURITY OPERATIONS', X, 150);
      g.fillStyle = '#6A7170'; g.font = '500 24px ' + MON; right(g, 'CYBERSECURITY FOR CRITICAL INDUSTRIES', w - X, 148);
      g.fillStyle = 'rgba(21,25,26,.2)'; g.fillRect(X, 176, w - 2 * X, 3);
      g.fillStyle = '#15191A'; g.font = '600 84px ' + CON; g.fillText('SECURITY BUILT INTO EVERY LAYER,', X, 290); g.fillText('FROM THE INBOX TO THE PLANT FLOOR.', X, 372);
      [['PRACTICES', '3', 'Security, network and AI'], ['SERVICES', '10', 'Assessment to response'], ['INDUSTRIES', '6', 'Energy to education'], ['POINT OF CONTACT', '1', 'One accountable team']].forEach((c, p) => {
        const cw = (w - 2 * X - 3 * 24) / 4, x = X + p * (cw + 24); g.fillStyle = '#FAFAF8'; g.fillRect(x, 430, cw, 320); g.strokeStyle = 'rgba(21,25,26,.14)'; g.lineWidth = 2; g.strokeRect(x, 430, cw, 320);
        g.fillStyle = '#4A5150'; g.font = '600 28px ' + CON; g.fillText(c[0], x + 30, 480);
        g.fillStyle = '#15191A'; g.font = '700 150px ' + CON; g.fillText(c[1], x + 26, 650);
        g.strokeStyle = '#2F5B40'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 24; i++) { const xx = x + cw - 200 + i * 7, yy = 610 - Math.sin(i * 0.5 + p) * 24 - Math.sin(i * 1.3 + p * 2) * 7; if (i) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke();
        g.fillStyle = '#2F9E5F'; g.beginPath(); g.arc(x + 38, 706, 7, 0, 6.283); g.fill(); g.fillStyle = '#2A302F'; g.font = '500 26px ' + BAR; g.fillText(c[2], x + 56, 715);
      });
      g.fillStyle = '#3D4443'; g.font = '400 30px ' + BAR; g.fillText('One team assesses, secures, monitors and responds, and modernises the network and prepares for AI along the way.', X, 830);
    };
    const poster = (g, w, h) => {
      g.fillStyle = '#F7F7F4'; g.fillRect(0, 0, w, h); g.fillStyle = '#C24A3A'; g.fillRect(0, 0, w, 70);
      g.fillStyle = '#FFFFFF'; g.font = '700 44px ' + CON; g.fillText('LIFE SAVING RULES', 24, 50);
      ['Permit to work', 'Gas test', 'Isolation', 'Working at height', 'Confined space', 'Bypassing controls'].forEach((t, i) => { const x = 24 + (i % 2) * 248, y = 100 + Math.floor(i / 2) * 150; g.strokeStyle = '#C24A3A'; g.lineWidth = 6; g.beginPath(); g.arc(x + 50, y + 50, 40, 0, 6.283); g.stroke(); g.fillStyle = '#15191A'; g.font = '600 26px ' + CON; g.fillText(t.toUpperCase(), x, y + 128); });
    };
    return { mail, vpn, fw, kase, alerts, bars, sites, hmi, dash, poster };
  }

  async init3D() {
    const canvas = this.canvas; if (!canvas) throw new Error('no canvas');
    const T = THREE;
    try { await Promise.all(['600 44px ' + this.F.cond + '', '700 40px ' + this.F.cond + '', '500 24px ' + this.F.bar + '', '600 24px ' + this.F.bar + '', '400 24px ' + this.F.bar + '', '500 20px ' + this.F.mono + '', '600 20px ' + this.F.mono + ''].map((f) => document.fonts.load(f))); } catch (e) {}
    if (this.dead) return;
    const renderer = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    const MOB = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || (window.innerWidth || 1440) < 820;
    this.MOB = MOB;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOB ? 1.25 : 1.75));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
    const scene = new T.Scene(); scene.background = new T.Color('#D6DEE2'); scene.fog = new T.Fog(scene.background.clone(), 60, 420);
    const camera = new T.PerspectiveCamera(50, 1, 0.05, 900);
    const hemi = new T.HemisphereLight(0xffffff, 0xbfc5bf, 0.8); scene.add(hemi);
    const envScene = new T.Scene(); envScene.background = new T.Color(0x8d938f);
    const envStrip = new T.MeshBasicMaterial({ color: new T.Color(5, 5, 5) });
    for (let i = -3; i <= 3; i++) { const l = new T.Mesh(new T.BoxGeometry(0.5, 0.05, 7), envStrip); l.position.set(i * 2.4, 4, 0); envScene.add(l); }
    const envWin = new T.Mesh(new T.PlaneGeometry(16, 3), new T.MeshBasicMaterial({ color: new T.Color(3.2, 3.2, 3.4) })); envWin.position.set(0, 2, -9); envScene.add(envWin);
    const envBox = new T.Mesh(new T.BoxGeometry(22, 7, 22), new T.MeshBasicMaterial({ color: new T.Color(0.7, 0.72, 0.7), side: T.BackSide })); envBox.position.y = 3; envScene.add(envBox);
    const pmrem = new T.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(envScene, 0.03).texture; pmrem.dispose();
    const sun = new T.DirectionalLight(0xffffff, 1.2); sun.castShadow = true; sun.shadow.mapSize.set(MOB ? 1024 : 2048, MOB ? 1024 : 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);

    const mats = [], fadeB = [];
    const std = (o) => { const m = new T.MeshStandardMaterial(Object.assign({ transparent: true, opacity: 0 }, o)); mats.push(m); return m; };
    const basic = (o) => { const m = new T.MeshBasicMaterial(Object.assign({ transparent: true, opacity: 0 }, o)); fadeB.push(m); return m; };
    let G = scene;
    const add = (geo, mat, x, y, z, o) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); const op = o || {}; m.castShadow = op.cast !== false; m.receiveShadow = op.recv !== false; if (op.ry) m.rotation.y = op.ry; if (op.rx) m.rotation.x = op.rx; if (op.rz) m.rotation.z = op.rz; G.add(m); return m; };
    const box = (w, h, d, mat, x, y, z, o) => add(new T.BoxGeometry(w, h, d), mat, x, y + h / 2, z, o);
    const cyl = (r, h, mat, x, y, z, o) => add(new T.CylinderGeometry((o && o.r2) || r, r, h, (o && o.seg) || 20, 1, !!(o && o.open)), mat, x, y + h / 2, z, o);
    const plane = (w, h, mat, x, y, z, o) => add(new T.PlaneGeometry(w, h), mat, x, y, z, Object.assign({ cast: false }, o || {}));
    const grp = (x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); scene.add(g); return g; };
    const tx = (w, h, draw, rx, ry) => this.tex(T, w, h, draw, rx, ry);
    const S = this.screens();
    const scr = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; const o = { tex: t, key: null, set: (k) => { if (k === o.key) return; o.key = k; g.save(); draw(g, w, h, k); g.restore(); t.needsUpdate = true; } }; return o; };
    const stat = (w, h, draw) => { const o = scr(w, h, draw); o.set(0); return o.tex; };
    const scrMats = [];
    const scrMat = (map) => { const m = basic({ map, toneMapped: true }); m.color.setRGB(1.0, 1.0, 1.0); scrMats.push(m); return m; };

    const K = std({ color: 0x23282a, roughness: 0.45, metalness: 0.35 }), K2 = std({ color: 0x15191a, roughness: 0.6, metalness: 0.2 });
    const steel = std({ color: 0xb8beb8, roughness: 0.45, metalness: 0.6 }), white = std({ color: 0xf1f2ef, roughness: 0.6 });
    const fabric = std({ color: 0x2c3234, roughness: 0.95 }), yellow = std({ color: 0xe0b73a, roughness: 0.6 });
    const glassMat = new T.MeshStandardMaterial({ color: 0xeef3f2, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0, depthWrite: false, envMapIntensity: 1.2 });
    const lightPanel = basic({ color: 0xffffff }); lightPanel.color.setRGB(1.7, 1.7, 1.65);
    const lampMat = basic({ color: 0xffffff }), winMat = basic({ color: 0xffffff }), flameMat = basic({ color: 0xffffff }); flameMat.color.setRGB(5, 2.4, 0.8);
    const lamps = [];
    const ceilTex = tx(256, 256, (g, w, h) => { g.fillStyle = '#EEF0EC'; g.fillRect(0, 0, w, h); g.strokeStyle = '#CDD1CB'; g.lineWidth = 3; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); } }, 6, 6);
    const room = (x0, x1, z0, z1, h, floorMat, wallMat, skip) => {
      const W = x1 - x0, D = z0 - z1, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sk = skip || {};
      const cm = std({ map: ceilTex.clone(), roughness: 0.95 }); cm.map.repeat.set(W / 1.2, D / 1.2); cm.map.needsUpdate = true;
      plane(W, D, floorMat, cx, 0, cz, { rx: -Math.PI / 2 });
      plane(W, D, cm, cx, h, cz, { rx: Math.PI / 2 });
      if (!sk.x0) plane(D, h, wallMat, x0, h / 2, cz, { ry: Math.PI / 2 });
      if (!sk.x1) plane(D, h, wallMat, x1, h / 2, cz, { ry: -Math.PI / 2 });
      if (!sk.z1) plane(W, h, wallMat, cx, h / 2, z1, {});
      if (!sk.z0) plane(W, h, wallMat, cx, h / 2, z0, { ry: Math.PI });
      box(W, 0.1, 0.012, std({ color: 0xc9cdc8, roughness: 0.7 }), cx, 0, z1 + 0.007, { cast: false });
    };
    const lightsGrid = (x0, x1, z0, z1, h, nx, nz) => { for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) plane(0.6, 1.2, lightPanel, x0 + (i + 0.5) * (x1 - x0) / nx, h - 0.01, z0 + (j + 0.5) * (z1 - z0) / nz, { rx: Math.PI / 2 }); };
    const monitor = (x, y, z, w, h, map, ry, tilt, stand) => {
      const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; G.add(g);
      const inner = new T.Group(); inner.rotation.x = tilt || 0; g.add(inner);
      const b = new T.Mesh(new T.BoxGeometry(w + 0.024, h + 0.024, 0.028), K2); b.position.z = -0.016; b.castShadow = true; inner.add(b);
      const s = new T.Mesh(new T.PlaneGeometry(w, h), scrMat(map)); s.position.z = 0.0; inner.add(s);
      if (stand !== false) { const n = new T.Mesh(new T.BoxGeometry(0.05, y - 0.76, 0.03), K2); n.position.set(0, -(y - 0.76) / 2, -0.05); n.castShadow = true; g.add(n); const ft = new T.Mesh(new T.BoxGeometry(0.24, 0.012, 0.18), K2); ft.position.set(0, -(y - 0.76) + 0.006, -0.05); g.add(ft); }
      return s;
    };
    const chair = (x, z, ry) => {
      const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; G.add(g);
      const P = (geo, m, px, py, pz, rx2) => { const o = new T.Mesh(geo, m); o.position.set(px, py, pz); if (rx2) o.rotation.x = rx2; o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const leg = P(new T.BoxGeometry(0.04, 0.03, 0.3), K2, Math.sin(a) * 0.15, 0.07, Math.cos(a) * 0.15); leg.rotation.y = a; P(new T.SphereGeometry(0.025, 8, 6), K2, Math.sin(a) * 0.3, 0.025, Math.cos(a) * 0.3); }
      P(new T.CylinderGeometry(0.025, 0.03, 0.36, 10), steel, 0, 0.26, 0);
      P(new T.BoxGeometry(0.48, 0.07, 0.46), fabric, 0, 0.47, 0);
      P(new T.BoxGeometry(0.46, 0.52, 0.06), fabric, 0, 0.82, 0.24, -0.12);
      [-1, 1].forEach((sd) => { P(new T.BoxGeometry(0.04, 0.2, 0.04), K2, sd * 0.26, 0.6, 0.02); P(new T.BoxGeometry(0.06, 0.03, 0.26), K2, sd * 0.26, 0.7, 0.0); });
    };
    const desk = (x, z, w, d, ry, topM) => {
      const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; G.add(g);
      const top = new T.Mesh(new T.BoxGeometry(w, 0.03, d), topM || white); top.position.y = 0.735; top.castShadow = true; top.receiveShadow = true; g.add(top);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((p) => { const l = new T.Mesh(new T.BoxGeometry(0.05, 0.72, 0.05), steel); l.position.set(p[0] * (w / 2 - 0.05), 0.36, p[1] * (d / 2 - 0.06)); l.castShadow = true; g.add(l); });
      const mp = new T.Mesh(new T.BoxGeometry(w - 0.12, 0.36, 0.015), white); mp.position.set(0, 0.5, -d / 2 + 0.06); g.add(mp);
      return g;
    };
    const rackTex = (seed) => tx(256, 900, (g, w, h) => this.rackFace(g, w, h, 'modern', seed));
    const rack = (x, z, ry, seed, label) => {
      const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; G.add(g);
      const b = new T.Mesh(new T.BoxGeometry(0.6, 2.0, 1.0), K); b.position.y = 1.02; b.castShadow = true; b.receiveShadow = true; g.add(b);
      const f = new T.Mesh(new T.PlaneGeometry(0.56, 1.96), std({ map: rackTex(seed), roughness: 0.5, metalness: 0.2 })); f.position.set(0, 1.02, 0.502); g.add(f);
      if (label) { const lt = tx(256, 48, (gg, w, h) => { gg.fillStyle = '#F2F3F0'; gg.fillRect(0, 0, w, h); gg.fillStyle = '#15191A'; gg.font = '600 30px ' + this.F.mono + ', monospace'; gg.fillText(label[0], 10, 35); }); const l = new T.Mesh(new T.PlaneGeometry(0.16, 0.03), std({ map: lt, roughness: 0.6 })); l.position.set(-0.17, label[1], 0.504); g.add(l); }
      return g;
    };

    // ---------- set 0: refinery admin office (origin) + refinery outside ----------
    G = scene;
    const carpet = tx(256, 256, (g, w, h) => { g.fillStyle = '#8E9594'; g.fillRect(0, 0, w, h); let s = 3; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)'; g.fillRect(r() * w, r() * h, 2, 2); } g.strokeStyle = 'rgba(0,0,0,.06)'; g.strokeRect(0, 0, w, h); }, 16, 16);
    const officeWall = std({ color: 0xe9e9e4, roughness: 0.92 });
    room(-4, 4, 2.6, -5.6, 2.9, std({ map: carpet, roughness: 0.95 }), officeWall, { z1: true });
    lightsGrid(-4, 4, 2.6, -5.6, 2.9, 3, 3);
    const OF = std({ color: 0x9aa09e, roughness: 0.4, metalness: 0.6 });
    box(8, 0.8, 0.22, officeWall, 0, 0, -5.6, {}); box(8, 0.04, 0.32, white, 0, 0.8, -5.55, {});
    box(8, 0.3, 0.22, officeWall, 0, 2.6, -5.6, {});
    for (let x = -4; x <= 4.01; x += 1.6) box(0.06, 1.8, 0.14, OF, x, 0.8, -5.6, {});
    box(8, 0.05, 0.12, OF, 0, 0.8, -5.6, {}); box(8, 0.05, 0.12, OF, 0, 2.55, -5.6, {});
    plane(8, 1.8, glassMat, 0, 1.7, -5.62, { recv: false });
    const roofT = tx(256, 256, (g, w, h) => { g.fillStyle = '#B5B3AC'; g.fillRect(0, 0, w, h); let s = 9; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; for (let i = 0; i < 4000; i++) { g.fillStyle = r() < 0.5 ? '#C4C2BA' : '#A19F98'; g.fillRect(r() * w, r() * h, 2, 2); } }, 10, 4);
    plane(26, 10, std({ map: roofT, roughness: 1 }), 0, -0.35, -10.7, { rx: -Math.PI / 2 });
    box(26, 0.5, 0.25, officeWall, 0, -0.35, -15.7, {});
    box(0.3, 1.2, 0.3, steel, -6, -0.35, -9, {}); box(1.8, 1.0, 1.2, std({ color: 0xd9dbd6, roughness: 0.6 }), 4.5, -0.35, -9.5, {});
    // desks, laptop and props
    desk(0.1, -4.45, 1.6, 0.75, 0); desk(-2.0, -4.45, 1.6, 0.75, 0); desk(2.3, -4.45, 1.6, 0.75, 0);
    box(0.42, 0.6, 0.55, std({ color: 0xd4d6d2, roughness: 0.6 }), 0.62, 0, -4.48, {});
    chair(0.2, -3.55, 0.35); chair(-2.0, -3.75, -0.2); chair(2.4, -3.8, 0.1);
    const lap = new T.Group(); lap.position.set(0.1, 0.75, -4.45); G.add(lap);
    const kbT = tx(256, 176, (g, w, h) => { g.fillStyle = '#9EA4A6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2A2F31'; for (let r2 = 0; r2 < 5; r2++) for (let c = 0; c < 14; c++) g.fillRect(14 + c * 16.5, 12 + r2 * 16, 14, 13); g.fillStyle = '#8D9395'; g.fillRect(84, 104, 88, 56); });
    const lb = new T.Mesh(new T.BoxGeometry(0.32, 0.016, 0.22), [std({ color: 0xa4aaac, roughness: 0.35, metalness: 0.6 }), std({ color: 0xa4aaac, roughness: 0.35, metalness: 0.6 }), std({ map: kbT, roughness: 0.4, metalness: 0.4 }), std({ color: 0xa4aaac, roughness: 0.35, metalness: 0.6 }), std({ color: 0xa4aaac, roughness: 0.35, metalness: 0.6 }), std({ color: 0xa4aaac, roughness: 0.35, metalness: 0.6 })]);
    lb.position.y = 0.008; lb.castShadow = true; lb.receiveShadow = true; lap.add(lb);
    const hinge = new T.Group(); hinge.position.set(0, 0.016, -0.108); hinge.rotation.x = -0.31; lap.add(hinge);
    const lid = new T.Mesh(new T.BoxGeometry(0.32, 0.215, 0.008), std({ color: 0xa4aaac, roughness: 0.35, metalness: 0.6 })); lid.position.set(0, 0.1075, -0.004); lid.castShadow = true; hinge.add(lid);
    const mailScr = scr(1024, 640, S.mail); mailScr.set(0);
    const lscr = new T.Mesh(new T.PlaneGeometry(0.3, 0.1875), scrMat(mailScr.tex)); lscr.position.set(0, 0.11, 0.0005); hinge.add(lscr);
    cyl(0.04, 0.1, std({ color: 0xf2f2ee, roughness: 0.3 }), 0.72, 0.75, -4.22, { seg: 20 }); add(new T.TorusGeometry(0.03, 0.008, 8, 16), std({ color: 0xf2f2ee, roughness: 0.3 }), 0.765, 0.8, -4.22, { ry: Math.PI / 2 });
    box(0.21, 0.018, 0.29, std({ color: 0x2f4a6a, roughness: 0.8 }), 0.55, 0.75, -4.62, { ry: 0.12 });
    box(0.054, 0.002, 0.086, std({ color: 0xf4f5f2, roughness: 0.5 }), -0.42, 0.75, -4.28, { ry: 0.4 });
        monitor(-2.0, 1.1, -4.62, 0.6, 0.34, stat(16, 10, (g, w, h) => { g.fillStyle = '#15191A'; g.fillRect(0, 0, w, h); }), 0, 0);
    box(0.44, 0.02, 0.15, std({ color: 0xd9dbd6, roughness: 0.5 }), -2.0, 0.75, -4.25, {});
    monitor(2.3, 1.1, -4.62, 0.6, 0.34, stat(16, 10, (g, w, h) => { g.fillStyle = '#15191A'; g.fillRect(0, 0, w, h); }), 0, 0);
    const posterT = tx(512, 600, S.poster);
    plane(0.5, 0.586, std({ map: posterT, roughness: 0.7 }), -3.985, 1.55, -2.0, { ry: Math.PI / 2 });
    box(0.02, 1.0, 1.6, std({ color: 0xfafaf8, roughness: 0.3 }), -3.99, 1.05, 0.4, {});
    box(0.04, 2.1, 1.0, std({ color: 0xc9c2b4, roughness: 0.6 }), 3.98, 0, 1.2, {});
    box(0.45, 1.3, 0.6, std({ color: 0xcfd2cd, roughness: 0.6 }), 3.7, 0, -1.6, {});

    // refinery
    G = scene;
    const Y = -6;
    const conc = tx(512, 512, (g, w, h) => { g.fillStyle = '#CFC9BC'; g.fillRect(0, 0, w, h); let s = 5; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)'; g.fillRect(r() * w, r() * h, 3, 3); } g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); } }, 60, 60);
    plane(1600, 1600, std({ map: conc, roughness: 0.95 }), 0, Y, -300, { rx: -Math.PI / 2 });
    const road = std({ color: 0x8e8f8b, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    plane(10, 600, road, -36, Y + 0.08, -200, { rx: -Math.PI / 2 }); plane(400, 10, road, 0, Y + 0.08, -118, { rx: -Math.PI / 2 }); plane(400, 10, road, 0, Y + 0.08, -205, { rx: -Math.PI / 2 });
    const clad = std({ color: 0xc2c6c2, roughness: 0.42, metalness: 0.55 }), grate = std({ color: 0x9c8f6e, roughness: 0.8, metalness: 0.3 }), rail = std({ color: 0xd9b33a, roughness: 0.6 });
    const pipeC = std({ color: 0xbfc3bf, roughness: 0.5, metalness: 0.5 }), tankW = std({ color: 0xeceee9, roughness: 0.55 }), rust = std({ color: 0x8a7b68, roughness: 0.9 });
    const column = (x, z, r, h) => {
      cyl(r * 1.15, 3, rust, x, Y, z, { seg: 28 });
      cyl(r, h, clad, x, Y + 3, z, { seg: 28 });
      add(new T.SphereGeometry(r, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), clad, x, Y + 3 + h, z);
      for (let yy = 10; yy < h; yy += 7.5) { cyl(r + 0.9, 0.14, grate, x, Y + yy, z, { seg: 28 }); add(new T.TorusGeometry(r + 0.85, 0.04, 6, 40), rail, x, Y + yy + 1.05, z, { rx: Math.PI / 2, cast: false }); lamps.push([x + r + 0.7, Y + yy + 2.0, z], [x - r - 0.7, Y + yy + 2.0, z]); }
      cyl(0.28, h, pipeC, x + r + 0.45, Y, z + 0.4, { seg: 10 });
    };
    [[-20, -80, 2.2, 42], [-12, -86, 1.6, 34], [-3, -78, 2.8, 50], [30, -100, 2.0, 38], [38, -95, 1.4, 28], [-52, -128, 2.4, 44], [-44, -134, 1.7, 30]].forEach((c) => column(c[0], c[1], c[2], c[3]));
    const furnace = (x, z) => { box(12, 14, 8, std({ color: 0xbfc0ba, roughness: 0.7, metalness: 0.2 }), x, Y, z); box(12.4, 0.4, 8.4, steel, x, Y + 14, z); cyl(1.3, 34, std({ color: 0x9da19d, roughness: 0.6, metalness: 0.4 }), x, Y + 14, z, { seg: 18 }); for (let i = -1; i <= 1; i++) lamps.push([x + i * 4, Y + 8, z + 4.4]); };
    furnace(-32, -70); furnace(18, -86);
    const pipeRack = (x0, x1, z, along) => {
      const L = Math.abs(x1 - x0), cx = (x0 + x1) / 2, prev = G; G = grp(along ? z : cx, 0, along ? cx : z); if (along) G.rotation.y = Math.PI / 2;
      for (let x = -L / 2; x <= L / 2; x += 6) { [-4, 4].forEach((sd) => box(0.4, 8, 0.4, steel, x, Y, sd)); box(0.35, 0.4, 8.4, steel, x, Y + 5, 0); box(0.35, 0.4, 8.4, steel, x, Y + 7.6, 0); if (Math.round(x) % 12 === 0) lamps.push(along ? [z + 4, Y + 8.6, cx - x] : [cx + x, Y + 8.6, z + 4]); }
      [[-3, 0.45], [-2, 0.3], [-1.1, 0.3], [-0.2, 0.5], [0.9, 0.25], [1.8, 0.35], [2.9, 0.45]].forEach((p, i) => { [5.2, 7.8].forEach((yy, k) => { const m = add(new T.CylinderGeometry(p[1] * (k ? 0.7 : 1), p[1] * (k ? 0.7 : 1), L, 12), i === 3 && k === 0 ? yellow : pipeC, 0, Y + yy + 0.2 + p[1], p[0], { rz: Math.PI / 2 }); return m; }); });
      G = prev;
    };
    pipeRack(-70, 60, -96, false); pipeRack(-60, -150, 8, true);
    const tank = (x, z, r, h) => { cyl(r, h, tankW, x, Y, z, { seg: 40 }); add(new T.ConeGeometry(r * 1.01, 1.6, 40), tankW, x, Y + h + 0.8, z); add(new T.TorusGeometry(r + 0.05, 0.08, 6, 60), rail, x, Y + h + 1.0, z, { rx: Math.PI / 2, cast: false }); };
    [[62, -150, 13, 14], [96, -150, 13, 14], [62, -185, 11, 16], [96, -185, 13, 14], [128, -160, 10, 12], [128, -192, 10, 12]].forEach((t) => tank(t[0], t[1], t[2], t[3]));
    [[44, -168, 0.3, 66, 1.4], [79, -132, 104, 0.3, 1.4], [79, -206, 104, 0.3, 1.4]].forEach((b) => box(b[2] || 0.3, b[4], b[3] || 0.3, std({ color: 0xc4beb0, roughness: 0.95 }), b[0], Y, b[1]));
    const sphere = (x, z) => { add(new T.SphereGeometry(7, 36, 22), tankW, x, Y + 10, z); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; cyl(0.35, 10, steel, x + Math.cos(a) * 6.2, Y, z + Math.sin(a) * 6.2, { seg: 8 }); } lamps.push([x, Y + 17.4, z]); };
    sphere(-78, -168); sphere(-58, -172); sphere(-98, -164);
    cyl(0.9, 90, std({ color: 0x9da19d, roughness: 0.6, metalness: 0.4 }), -92, Y, -240, { seg: 14 }); add(new T.ConeGeometry(1.0, 4.6, 14), flameMat, -92, Y + 92.4, -240, { cast: false });
    lamps.push([-92, Y + 60, -239], [-92, Y + 30, -239]);
    box(34, 7, 16, std({ color: 0xd8d2c4, roughness: 0.8 }), 20, Y, -150); box(34.06, 1.5, 16.06, winMat, 20, Y + 3.2, -150, { cast: false }); box(4, 1.6, 3, steel, 12, Y + 7, -150); box(3, 1.2, 3, steel, 30, Y + 7, -152);
    { const im = new T.InstancedMesh(new T.SphereGeometry(0.28, 8, 6), lampMat, lamps.length); const m4 = new T.Matrix4(); lamps.forEach((p, i) => im.setMatrixAt(i, m4.makeTranslation(p[0], p[1], p[2]))); scene.add(im); }

    // ---------- set 1: network room ----------
    G = grp(0, 100, 0);
    const vinyl = tx(256, 256, (g, w, h) => { g.fillStyle = '#D5D8D4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#BFC3BE'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); let s = 4; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(0,0,0,.04)'; g.fillRect(r() * w, r() * h, 3, 2); } }, 9, 8);
    room(-2.8, 2.8, 2.0, -3.0, 2.8, std({ map: vinyl, roughness: 0.5 }), std({ color: 0xdfe2de, roughness: 0.9 }));
    lightsGrid(-2.8, 2.8, 2.0, -3.0, 2.8, 2, 2);
    rack(-1.3, -2.1, 0, 31); rack(-0.7, -2.1, 0, 47, ['VPN-GW-01', 1.62]); rack(-0.1, -2.1, 0, 59, ['FW-EDGE-01', 1.84]);
    box(1.9, 0.06, 0.3, yellow, -0.7, 2.32, -1.95, {}); [-1.5, -0.7, 0.1].forEach((x) => box(0.05, 0.3, 0.05, steel, x, 2.38, -1.95, { cast: false }));
    box(0.6, 0.9, 0.7, std({ color: 0x2b3033, roughness: 0.5 }), 0.75, 0, -2.5, {});
    box(1.6, 1.2, 0.02, std({ color: 0xb9a786, roughness: 0.9 }), 1.7, 0.9, -2.99, { cast: false });
    box(0.36, 0.46, 0.12, std({ color: 0xe9eae6, roughness: 0.6 }), 1.4, 1.3, -2.92, {});
    box(0.03, 0.03, 1.05, K2, 0.95, 1.43, -2.45, {});
    const vpnScr = scr(1024, 600, S.vpn); vpnScr.set(0);
    monitor(0.95, 1.45, -1.85, 0.6, 0.352, vpnScr.tex, -0.4, 0, false);
    const doorN = box(0.95, 2.1, 0.05, std({ color: 0x8d969a, roughness: 0.5, metalness: 0.3 }), 2.0, 0, 1.97, { cast: false });

    // ---------- set 2: control room with OT cabinet ----------
    G = grp(40, 100, 0);
    const ctrlFloor = tx(256, 256, (g, w, h) => { g.fillStyle = '#CDD0CC'; g.fillRect(0, 0, w, h); g.strokeStyle = '#B9BDB8'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); }, 15, 14);
    room(-4.5, 4.5, 3.0, -5.6, 3.2, std({ map: ctrlFloor, roughness: 0.45 }), std({ color: 0xc3c9c8, roughness: 0.9 }));
    lightsGrid(-4.5, 4.5, 3.0, -5.6, 3.2, 3, 3);
    const hmiT = [0, 1, 2, 3].map((v) => stat(1024, 576, (g, w, h) => S.hmi(g, w, h, v)));
    box(7.2, 2.1, 0.08, K2, 0, 0.9, -5.55, { cast: false });
    [-2.7, -0.9, 0.9, 2.7].forEach((x, i) => monitor(x, 1.95, -5.5, 1.7, 0.956, hmiT[i], 0, 0, false));
    desk(-0.6, -2.6, 5.4, 0.9, 0, std({ color: 0x6b7376, roughness: 0.5 }));
    [-2.4, -0.6, 1.2].forEach((x, i) => { [-0.58, 0, 0.58].forEach((dx, j) => monitor(x + dx, 1.08, -2.86, 0.53, 0.3, hmiT[(i + j) % 4], dx * -0.5, -0.06)); chair(x, -1.7, 0.1 * (i - 1)); box(0.44, 0.02, 0.15, std({ color: 0x2b3033, roughness: 0.5 }), x, 0.75, -2.4, {}); });
    rack(3.95, -1.0, -Math.PI / 2, 71);
    const otLab = tx(512, 160, (g, w, h) => { g.fillStyle = '#F2F3F0'; g.fillRect(0, 0, w, h); g.fillStyle = '#2B5C8A'; g.fillRect(0, 0, w, 14); g.fillStyle = '#15191A'; g.font = '700 46px ' + this.F.cond + ', Helvetica, sans-serif'; g.fillText('OT NETWORK  ·  ZONE 3', 22, 76); g.fillStyle = '#4A5250'; g.font = '500 26px ' + this.F.cond + ', Helvetica, sans-serif'; g.fillText('IT/OT boundary firewall  ·  authorised staff only', 22, 124); });
    plane(0.8, 0.25, std({ map: otLab, roughness: 0.6 }), 4.49, 2.45, -1.0, { ry: -Math.PI / 2 });
    const fwScr = scr(1024, 640, S.fw); fwScr.set(0);
    box(0.48, 0.02, 0.44, K2, 3.24, 1.0, -1.0, {});
    { const kv = new T.Group(); kv.position.set(3.37, 1.02, -1.0); kv.rotation.y = -Math.PI / 2; G.add(kv); const hg = new T.Group(); hg.rotation.x = 0.18; kv.add(hg); const lidK = new T.Mesh(new T.BoxGeometry(0.46, 0.3, 0.014), K2); lidK.position.set(0, 0.15, -0.008); lidK.castShadow = true; hg.add(lidK); const sK = new T.Mesh(new T.PlaneGeometry(0.42, 0.2625), scrMat(fwScr.tex)); sK.position.set(0, 0.155, 0.0005); hg.add(sK); kv.rotation.y = -Math.PI / 2; hg.rotation.x = -0.12; }
    box(0.9, 2.2, 0.05, std({ color: 0x8d969a, roughness: 0.5, metalness: 0.3 }), -3.4, 0, 2.97, { cast: false });

    // ---------- set 3: security operations centre ----------
    G = grp(80, 100, 0);
    const socCarpet = tx(256, 256, (g, w, h) => { g.fillStyle = '#566064'; g.fillRect(0, 0, w, h); let s = 8; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.07)'; g.fillRect(r() * w, r() * h, 2, 2); } }, 20, 18);
    room(-7, 7, 3.6, -9.2, 3.8, std({ map: socCarpet, roughness: 0.95 }), std({ color: 0xaab2b4, roughness: 0.9 }));
    lightsGrid(-7, 7, 3.6, -9.2, 3.8, 3, 2);
    const darkTop = std({ color: 0x3a4144, roughness: 0.55 });
    box(7.0, 2.4, 0.1, K2, 0, 1.0, -9.12, { cast: false });
    const caseScr = scr(1024, 640, S.kase); caseScr.set(0);
    const dashTex = null;
    const alertT = stat(1024, 576, S.alerts), barT = stat(1024, 576, S.bars), siteT = stat(1024, 576, S.sites);
    const wallCenter = monitor(0, 2.25, -9.04, 3.2, 1.8, caseScr.tex, 0, 0, false);
    [[-2.45, 2.71, alertT], [-2.45, 1.79, caseScr.tex], [2.45, 2.71, barT], [2.45, 1.79, siteT]].forEach((p) => monitor(p[0], p[1], -9.04, 1.55, 0.872, p[2], 0, 0, false));
    box(10, 0.3, 2.4, std({ color: 0x4a5357, roughness: 0.9 }), 0, 0, -2.6, {});
    [[-5.5, 0], [-3.0, 0.3]].forEach((rw, ri) => {
      const z = rw[0], y0 = rw[1]; const prev = G; G = grp(80, 100 + y0, 0);
      desk(0, z, 9, 0.8, 0, darkTop);
      [-3.3, -1.1, 1.1, 3.3].forEach((x, si) => {
        [-0.53, 0, 0.53].forEach((dx, j) => { const isCase = ri === 0 && si === 1 && j === 1; const m = isCase ? caseScr.tex : [alertT, barT, siteT][(si + j + ri) % 3]; monitor(x + dx, 1.06, z - 0.25, 0.5, 0.3, m, dx * -0.5, -0.06); });
        chair(x, z + 0.85, 0.15 * (si - 1.5)); box(0.44, 0.02, 0.15, std({ color: 0x2b3033, roughness: 0.5 }), x, 0.75, z + 0.1, {});
      });
      G = prev;
    });
    cyl(0.04, 0.1, std({ color: 0xf2f2ee, roughness: 0.3 }), -1.5, 0.75, -5.35, { seg: 16 });

    const skyM = tx(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9FB3C2'); gr.addColorStop(0.5, '#D4DDE2'); gr.addColorStop(1, '#E7E9E4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const skyD = tx(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8E9DB3'); gr.addColorStop(0.45, '#D8C3B3'); gr.addColorStop(1, '#EBC9A4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const skyMat = new T.MeshBasicMaterial({ map: skyM, side: T.BackSide, fog: false, depthWrite: false });
    const sky = new T.Mesh(new T.SphereGeometry(700, 32, 16), skyMat); sky.position.set(0, -6, -150); sky.renderOrder = -1; scene.add(sky);

    const SETS = [
      { o: [0, 0, 0], bg: '#E4E8E7', fog: [40, 380], sun: [16, 20, -40], tg: [0, 0, -3], si: 2.6, sc: '#FFF0DC', hi: 0.3, box: 7, far: 90, sky: skyM, lamp: [0.55, 0.55, 0.52], win: [0.35, 0.4, 0.42] },
      { o: [0, 100, 0], bg: '#D9DDDB', fog: [8, 40], sun: [1.5, 12, 3], tg: [0, 0, -1], si: 0.75, sc: '#FFFFFF', hi: 0.55, box: 5, far: 30, sky: skyM, lamp: [0.55, 0.55, 0.52], win: [0.35, 0.4, 0.42] },
      { o: [40, 100, 0], bg: '#D9DDDB', fog: [9, 42], sun: [1, 12, 3], tg: [0, 0, -1.5], si: 0.75, sc: '#FFFFFF', hi: 0.52, box: 7, far: 30, sky: skyM, lamp: [0.55, 0.55, 0.52], win: [0.35, 0.4, 0.42] },
      { o: [80, 100, 0], bg: '#C9CFCF', fog: [10, 44], sun: [1, 12, 4], tg: [0, 0, -3], si: 0.5, sc: '#F4F6FF', hi: 0.32, box: 10, far: 30, sky: skyM, lamp: [0.55, 0.55, 0.52], win: [0.35, 0.4, 0.42] },
      { o: [0, 0, 0], bg: '#E6DED5', fog: [60, 520], sun: [-170, 34, -110], tg: [0, -6, -130], si: 1.5, sc: '#FFC08A', hi: 0.5, box: 140, far: 420, sky: skyD, lamp: [5, 3.6, 2.0], win: [4.2, 3.4, 2.2] }
    ];
    SETS.forEach((s) => { s.bgC = new T.Color(s.bg); s.scC = new T.Color(s.sc); });
    const SH = [
      [0, [2.2, 1.6, 1.8], [-0.4, 1.1, -5.6], 52, [1.5, 1.5, 0.5], [-0.3, 1.05, -5.6], 48],
      [0, [0.62, 1.34, -2.95], [-0.05, 0.8, -4.57], 34, [0.1, 0.986, -4.232], [0.1, 0.871, -4.59], 28],
      [1, [-1.9, 1.55, -0.35], [-0.9, 1.35, -1.6], 40, [0.05, 1.55, 0.05], [0.42, 1.42, -1.75], 46],
      [2, [0.6, 1.75, 2.4], [0.2, 1.5, -5.5], 46, [2.2, 1.4, -1.6], [3.36, 1.15, -0.98], 36],
      [3, [0.2, 2.8, 2.6], [0, 1.9, -9], 54, [-1.1, 1.094, -5.19], [-1.1, 1.06, -5.75], 30],
      [0, [0.55, 1.3, -3.05], [-0.05, 0.8, -4.57], 32, [0.36, 1.16, -3.62], [-0.06, 0.8, -4.58], 30],
      [4, [-80, 30, -18], [0, -6, -130], 44, [-94, 46, -30], [10, -8, -150], 40],
      [4, [-124, 42, 16], [0, -6, -140], 38, [-118, 44, 10], [4, -8, -146], 38]
    ];
    const CONT = [];

    // ---------- network layer: only drawn in the x-ray pass (layer 1) ----------
    const NET = [];
    const netMat = (hex) => new T.MeshBasicMaterial({ color: hex, transparent: true, opacity: 1, fog: false, depthTest: false, depthWrite: false, toneMapped: false });
    const RED = 0xb4532a, GREEN = 0x2f7a4f, INK = 0x55605f;
    const net = (setI, pts, o) => {
      const off = SETS[setI].o, op = o || {};
      const curve = new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(p[0] + off[0], p[1] + off[1], p[2] + off[2])), false, 'catmullrom', 0.2);
      const r = op.r || 0.006;
      const line = new T.Mesh(new T.TubeGeometry(curve, 80, r * (op.thin ? 0.6 : 1), 6, false), netMat(op.lineCol || INK)); line.layers.set(1); line.renderOrder = 2; scene.add(line);
      const pulses = [];
      for (let k = 0; k < (op.n || 0); k++) { const m = new T.Mesh(new T.SphereGeometry(r * 3.2, 12, 8), netMat(op.col || RED)); m.layers.set(1); m.renderOrder = 3; scene.add(m); pulses.push(m); }
      let gate = null;
      if (op.gate) { gate = new T.Mesh(new T.TorusGeometry(op.gate, r * 1.3, 8, 48), netMat(INK)); const e = curve.getPoint(op.stop || 1), tg = curve.getTangent(op.stop || 1); gate.position.copy(e); gate.lookAt(e.clone().add(tg)); gate.layers.set(1); gate.renderOrder = 2; scene.add(gate); }
      NET.push({ set: setI, curve, pulses, stop: op.stop || 1, speed: op.speed || 0.35, burst: !!op.burst });
    };
    // office: the click sends the password out of the building; the normal cable run stays quiet
    net(0, [[0.1, 0.87, -4.6], [0.15, 1.5, -5.0], [0.5, 2.25, -5.7], [2.5, 5, -16], [9, 14, -48], [18, 26, -90]], { n: 4, r: 0.0026, speed: 0.22 });
    net(0, [[0.1, 0.76, -4.42], [0.32, 0.05, -4.2], [3.9, 0.05, -4.2], [3.95, 2.7, -4.2]], { r: 0.0022, thin: true, lineCol: GREEN, n: 2, col: GREEN, speed: 0.3 });
    // network room: the attempt reaches the VPN gateway and stops at the gate
    net(1, [[-2.75, 2.2, 1.6], [-2.0, 1.95, 0.6], [-1.1, 1.75, -0.6], [-0.7, 1.64, -1.56]], { n: 4, r: 0.004, gate: 0.14, stop: 1, burst: true, speed: 0.42 });
    net(1, [[-0.7, 1.62, -1.6], [0.1, 2.3, -1.9], [0.95, 1.6, -1.9]], { r: 0.003, thin: true, lineCol: GREEN });
    // control room: office traffic hits the IT/OT boundary; plant traffic keeps flowing
    net(2, [[-4.4, 1.6, -0.7], [-1.5, 2.1, -0.95], [1.2, 1.9, -1.0], [3.3, 1.45, -1.0]], { n: 6, r: 0.006, gate: 0.13, stop: 1, burst: true, speed: 0.5 });
    [[1.2, -2.86], [-0.6, -2.86], [-2.4, -2.86]].forEach((c) => net(2, [[3.45, 1.5, -1.0], [2.5, 1.85, -2.3], [c[0], 1.4, c[1]]], { r: 0.004, thin: true, lineCol: GREEN, col: GREEN, n: 2, speed: 0.25 }));
    // SOC: three separate signals converge on one analyst screen
    [[-2.45, 2.71, -9.0], [2.45, 2.71, -9.0], [2.45, 1.79, -9.0]].forEach((p) => net(3, [p, [p[0] * 0.55, 2.6, -7.6], [-1.1, 1.3, -6.2], [-1.1, 1.06, -5.78]], { n: 3, r: 0.007, speed: 0.3, burst: true }));
    // refinery: healthy flows along the pipe racks and back to the office
    net(4, [[-70, 0.2, -96], [-20, 0.2, -96], [20, 0.2, -96], [60, 0.2, -96]], { r: 0.18, lineCol: GREEN, col: GREEN, n: 8, speed: 0.06 });
    net(4, [[12, 0.2, -60], [12, 0.2, -105], [12, 0.2, -150]], { r: 0.18, lineCol: GREEN, col: GREEN, n: 5, speed: 0.08 });
    net(4, [[20, 1.5, -142], [10, 12, -100], [0, 8, -40], [0, 2, -5]], { r: 0.16, lineCol: GREEN, col: GREEN, n: 5, speed: 0.07 });

    const glassMeshes = []; scene.traverse((o) => { if (o.material === glassMat) glassMeshes.push(o); if (o.isMesh && scrMats.indexOf(o.material) >= 0) { o.layers.enable(1); o.renderOrder = 1; } });
    // ---------- passes ----------
    const rtOpt = { type: T.HalfFloatType, samples: MOB ? 2 : 4 };
    const rtA = new T.WebGLRenderTarget(4, 4, rtOpt), rtB = new T.WebGLRenderTarget(4, 4, rtOpt), rtNet = new T.WebGLRenderTarget(4, 4, rtOpt);
    const rtN = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType });
    const normMat = new T.ShaderMaterial({
      uniforms: { far: { value: 60 } },
      vertexShader: 'varying vec3 vN;\nvarying float vD;\nvoid main(){\n  vec3 n = normal;\n  vec4 p = vec4(position, 1.0);\n  #ifdef USE_INSTANCING\n  n = mat3(instanceMatrix) * n;\n  p = instanceMatrix * p;\n  #endif\n  vN = normalize(normalMatrix * n);\n  vec4 mv = modelViewMatrix * p;\n  vD = -mv.z;\n  gl_Position = projectionMatrix * mv;\n}',
      fragmentShader: 'uniform float far;\nvarying vec3 vN;\nvarying float vD;\nvoid main(){ gl_FragColor = vec4(normalize(vN) * 0.5 + 0.5, vD / far); }',
      side: T.DoubleSide
    });
    const blend = new T.ShaderMaterial({
      uniforms: { tA: { value: rtA.texture }, tB: { value: rtB.texture }, tN: { value: rtN.texture }, tNet: { value: rtNet.texture }, mixv: { value: 0 }, xray: { value: 0 }, scan: { value: 0 }, res: { value: new T.Vector2(4, 4) }, time: { value: 0 }, focus: { value: 0.5 }, blur: { value: 1 }, lensC: { value: new T.Vector2(0.5, 0.5) }, lensR: { value: 200 }, lensAmt: { value: 0 } },
      vertexShader: 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: [
        'uniform sampler2D tA; uniform sampler2D tB; uniform sampler2D tN; uniform sampler2D tNet;',
        'uniform float mixv; uniform float xray; uniform float scan; uniform vec2 res; uniform float time; uniform float focus; uniform float blur;',
        'uniform vec2 lensC; uniform float lensR; uniform float lensAmt;',
        'varying vec2 vUv;',
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
        'vec3 soft(sampler2D t, vec2 uv){',
        '  float r = smoothstep(0.16, 0.62, abs(uv.y - focus)) * 3.2 * blur;',
        '  vec2 px = r / res;',
        '  vec3 c = texture2D(t, uv).rgb * 0.28;',
        '  c += texture2D(t, uv + vec2(px.x, 0.0)).rgb * 0.12; c += texture2D(t, uv - vec2(px.x, 0.0)).rgb * 0.12;',
        '  c += texture2D(t, uv + vec2(0.0, px.y)).rgb * 0.12; c += texture2D(t, uv - vec2(0.0, px.y)).rgb * 0.12;',
        '  c += texture2D(t, uv + px * 0.7).rgb * 0.06; c += texture2D(t, uv - px * 0.7).rgb * 0.06;',
        '  c += texture2D(t, uv + vec2(px.x, -px.y) * 0.7).rgb * 0.06; c += texture2D(t, uv + vec2(-px.x, px.y) * 0.7).rgb * 0.06;',
        '  return c;',
        '}',
        'void main(){',
        '  vec3 a = soft(tA, vUv);',
        '  vec3 c = mixv > 0.0 ? mix(a, soft(tB, vUv), mixv) : a;',
        '  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));',
        '  c = mix(vec3(l), c, 0.9);',
        '  c = toneMapping(c);',
        '  c = mix(c, vec3(0.93, 0.935, 0.925), 0.03);',
        '  c = mix(c, c * c * (3.0 - 2.0 * c), 0.24);',
        '  float lum = dot(c, vec3(0.333));',
        '  c += (vec3(0.012, 0.006, -0.008) * smoothstep(0.5, 0.9, lum)) + (vec3(-0.008, 0.0, 0.01) * (1.0 - smoothstep(0.1, 0.5, lum)));',
        '  if (xray > 0.001 || lensAmt > 0.001) {',
        '    vec2 px = 1.25 / res;',
        '    vec4 n0 = texture2D(tN, vUv), n1 = texture2D(tN, vUv + vec2(px.x, 0.0)), n2 = texture2D(tN, vUv - vec2(px.x, 0.0)), n3 = texture2D(tN, vUv + vec2(0.0, px.y)), n4 = texture2D(tN, vUv - vec2(0.0, px.y));',
        '    float en = length(n1.rgb - n2.rgb) + length(n3.rgb - n4.rgb);',
        '    float d0 = max(n0.a, 0.0005);',
        '    float ed = (abs(n1.a - n2.a) + abs(n3.a - n4.a)) / d0;',
        '    float ink = clamp(smoothstep(0.25, 0.7, en) + smoothstep(0.035, 0.12, ed), 0.0, 1.0);',
        '    ink *= 1.0 - smoothstep(0.55, 1.0, n0.a);',
        '    vec3 paper = vec3(0.925, 0.93, 0.92);',
        '    float tone = dot(c, vec3(0.2126, 0.7152, 0.0722));',
        '    vec3 xc = mix(paper * 0.9, paper, smoothstep(0.15, 0.85, tone));',
        '    float hatch = step(0.5, fract((gl_FragCoord.x + gl_FragCoord.y) / 7.0)) * (1.0 - smoothstep(0.1, 0.45, tone)) * 0.06;',
        '    xc -= hatch;',
        '    xc = mix(xc, vec3(0.17, 0.19, 0.2), ink * 0.82);',
        '    vec4 nt = texture2D(tNet, vUv);',
        '    xc = mix(xc, nt.rgb / max(nt.a, 0.001), clamp(nt.a, 0.0, 1.0));',
        '    float yy = 1.0 - vUv.y;',
        '    float m = 1.0 - smoothstep(scan - 0.002, scan + 0.002, yy);',
        '    float ld = length((vUv - lensC) * res);',
        '    float lm = (1.0 - smoothstep(lensR - 1.5, lensR + 1.5, ld)) * lensAmt;',
        '    c = mix(c, xc, max(m * xray, lm));',
        '    c = mix(c, vec3(0.18, 0.47, 0.31), (1.0 - smoothstep(0.0, 1.6, abs(ld - lensR))) * lensAmt * 0.9);',
        '    float ln = (1.0 - smoothstep(0.0, 1.6 / res.y, abs(yy - scan))) * step(0.001, scan) * step(scan, 0.999);',
        '    c = mix(c, vec3(0.18, 0.47, 0.31), ln * 0.9 * xray);',
        '  }',
        '  float v = smoothstep(0.45, 1.05, length((vUv - 0.5) * vec2(1.25, 1.0)));',
        '  c *= 1.0 - v * 0.09;',
        '  c += (hash(vUv * res + fract(time) * 91.7) - 0.5) * 0.025;',
        '  gl_FragColor = vec4(c, 1.0);',
        '  #include <colorspace_fragment>',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false, toneMapped: true
    });
    const post = new T.Scene(); const quad = new T.Mesh(new T.PlaneGeometry(2, 2), blend); quad.frustumCulled = false; post.add(quad);
    const postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.layers.set(0);

    this.three = { T, renderer, scene, camera, mats, fadeB, glassMat, sun, hemi, lampMat, winMat, skyMat, sky, SETS, SH, rtA, rtB, rtN, rtNet, normMat, glassMeshes, blend, post, postCam, NET,
      mailScr, vpnScr, fwScr, caseScr, done: false, ts: {}, xr: 0, lensAmt: 0, lensP: new T.Vector2(0.5, 0.5),
      pA: { p: new T.Vector3(), l: new T.Vector3(), fov: 50, set: 0 }, pB: { p: new T.Vector3(), l: new T.Vector3(), fov: 50, set: 0 }, curSet: -1 };
    const fit = () => { const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); const v = renderer.getDrawingBufferSize(new T.Vector2()); [rtA, rtB, rtN, rtNet].forEach((t) => t.setSize(v.x, v.y)); blend.uniforms.res.value.set(v.x, v.y); if (this.three) this.three.dirty = true; };
    fit();
    if (window.ResizeObserver) { this.ro = new ResizeObserver(fit); this.ro.observe(canvas); }
  }

  applySet(i) {
    const th = this.three; if (th.curSet === i) return; th.curSet = i;
    const s = th.SETS[i], o = s.o, scene = th.scene;
    scene.background.copy(s.bgC); scene.fog.color.copy(s.bgC); scene.fog.near = s.fog[0]; scene.fog.far = s.fog[1];
    th.sun.position.set(o[0] + s.sun[0], o[1] + s.sun[1], o[2] + s.sun[2]); th.sun.target.position.set(o[0] + s.tg[0], o[1] + s.tg[1], o[2] + s.tg[2]); th.sun.target.updateMatrixWorld();
    th.sun.intensity = s.si; th.sun.color.copy(s.scC); th.hemi.intensity = s.hi;
    const c = th.sun.shadow.camera; c.left = -s.box; c.right = s.box; c.top = s.box; c.bottom = -s.box; c.near = 0.5; c.far = s.far; c.updateProjectionMatrix();
    th.lampMat.color.setRGB(s.lamp[0], s.lamp[1], s.lamp[2]); th.winMat.color.setRGB(s.win[0], s.win[1], s.win[2]);
    if (th.skyMat.map !== s.sky) { th.skyMat.map = s.sky; th.skyMat.needsUpdate = true; }
    th.normMat.uniforms.far.value = i === 4 ? 600 : 60;
    const nr = i === 4 ? 1.5 : 0.05; if (th.camera.near !== nr) { th.camera.near = nr; th.camera.updateProjectionMatrix(); }
  }

  frame3D(dt, time) {
    const th = this.three; const { renderer, camera, scene } = th;
    const motion = !this.reduced, sm = (a, c, x) => this.sm(a, c, x);
    const b = this.build, fade = sm(0, 1, b);
    if (!th.done) { th.mats.forEach((m) => { m.opacity = fade; }); th.fadeB.forEach((m) => { m.opacity = fade; }); if (b >= 1) { th.mats.concat(th.fadeB).forEach((m) => { m.transparent = false; m.opacity = 1; m.needsUpdate = true; }); th.done = true; } }
    th.glassMat.opacity = 0.12 * fade;
    const sh = this.shot;
    if (!th.sp) th.sp = { x: 0, y: 0 };
    const pk = 1 - Math.exp(-dt * 3.5); th.sp.x += (this.ptr.x - th.sp.x) * pk; th.sp.y += (this.ptr.y - th.sp.y) * pk;
    if (Math.abs(this.ptr.x - th.sp.x) < 0.0005) th.sp.x = this.ptr.x; if (Math.abs(this.ptr.y - th.sp.y) < 0.0005) th.sp.y = this.ptr.y;
    const k = 1 - Math.exp(-dt * (motion ? 3.2 : 60));
    const smooth = (o) => { const prev = th.ts[o.i]; const v = prev == null || Math.abs(prev - o.t) > 0.5 ? o.t : prev + (o.t - prev) * k; th.ts[o.i] = v; return v; };
    const A = { i: sh.a.i, t: smooth(sh.a) }, B = sh.b ? { i: sh.b.i, t: smooth(sh.b) } : null;
    const main = B && sh.mix > 0.5 ? B : A;
    const t = main.t;
    if (main.i === 0) th.mailScr.set(0);
    if (main.i === 1) th.mailScr.set(t < 0.12 ? 0 : t < 0.3 ? 1 : 2);
    if (main.i === 5) th.mailScr.set(t < 0.35 ? 4 : 5);
    if (main.i === 2) th.vpnScr.set([0.18, 0.3, 0.42].filter((x) => t >= x).length + (t >= 0.5 ? 10 : 0));
    if (main.i === 3) th.fwScr.set(Math.max(0, Math.min(9, Math.floor((t - 0.16) / 0.05))));
    if (main.i === 4) th.caseScr.set([0.4, 0.48, 0.56, 0.64, 0.72].filter((x) => t >= x).length);
    const XR = this.XR[main.i];
    let xr = XR ? sm(XR[0], XR[1], t) * (1 - sm(XR[2], XR[3], t)) : 0;
    if (B && sh.mix > 0.02 && sh.mix < 0.98) xr = 0;
    const goingIn = XR ? t < (XR[1] + XR[2]) / 2 : true;
    th.xr = xr; this.xrNow = xr; this.xrShot = main.i;
    const lensWant = main.i === 0 && !B && motion && this.lensOn ? 1 : 0;
    th.lensAmt += (lensWant - th.lensAmt) * (1 - Math.exp(-dt * 6)); if (th.lensAmt < 0.002 && !lensWant) th.lensAmt = 0;
    const lk = 1 - Math.exp(-dt * 9); th.lensP.x += ((this.ptr.x + 1) / 2 - th.lensP.x) * lk; th.lensP.y += ((this.ptr.y + 1) / 2 - th.lensP.y) * lk;
    const SH = th.SH, SETS = th.SETS;
    const easeS = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
    const pose = (i, tt, P) => { const s = SH[i], o = SETS[s[0]].o, w = easeS(tt), L = (a, c) => a + (c - a) * w; P.p.set(o[0] + L(s[1][0], s[4][0]), o[1] + L(s[1][1], s[4][1]), o[2] + L(s[1][2], s[4][2])); P.l.set(o[0] + L(s[2][0], s[5][0]), o[1] + L(s[2][1], s[5][1]), o[2] + L(s[2][2], s[5][2])); P.fov = L(s[3], s[6]); P.set = s[0]; return P; };
    const PA = pose(A.i, A.t, th.pA); let PB = null, mixv = 0;
    if (B) {
      pose(B.i, B.t, th.pB);
      if (A.i === 0 && B.i === 1) { const e = sm(0, 1, sh.mix); PA.p.lerp(th.pB.p, e); PA.l.lerp(th.pB.l, e); PA.fov += (th.pB.fov - PA.fov) * e; }
      else { PB = th.pB; mixv = sh.mix; }
    }
    // network pulses
    const tm = motion ? time : 0.4;
    th.NET.forEach((nn) => {
      const on = SETS[nn.set] && (PA.set === nn.set || (PB && PB.set === nn.set)) && (xr > 0.001 || th.lensAmt > 0.001);
      nn.pulses.forEach((m, j) => {
        m.visible = on; if (!on) return;
        const ph = (tm * nn.speed + j / nn.pulses.length) % 1;
        const u = Math.min(ph / 0.86, 1) * nn.stop;
        m.position.copy(nn.curve.getPoint(u));
        const end = nn.burst ? sm(0.86, 1, ph) : 0;
        m.scale.setScalar(1 + end * 2.4); m.material.opacity = 1 - end;
      });
    });
    const place = (P) => {
      this.applySet(P.set);
      const kk = P.set === 4 ? 0.4 : 0.06;
      camera.position.set(P.p.x + th.sp.x * 0.6 * kk, P.p.y + th.sp.y * 0.35 * kk, P.p.z);
      let fv = P.fov; const asp = camera.aspect || 1.6; if (asp < 1.35) fv = Math.min(80, 2 * Math.atan(Math.tan(fv * Math.PI / 360) * 1.35 / asp) * 180 / Math.PI);
      if (Math.abs(camera.fov - fv) > 0.001) { camera.fov = fv; camera.updateProjectionMatrix(); }
      camera.lookAt(P.l.x + th.sp.x * 2.2 * kk, P.l.y + th.sp.y * 1.5 * kk, P.l.z);
    };
    const key = [A.i, A.t.toFixed(4), B ? B.i + ':' + B.t.toFixed(4) : '', mixv.toFixed(3), th.sp.x.toFixed(4), th.sp.y.toFixed(4), th.done ? 1 : 0, camera.aspect.toFixed(3), th.mailScr.key, th.vpnScr.key, th.fwScr.key, th.caseScr.key].join('|');
    if (xr < 0.001 && th.lensAmt < 0.001 && key === th.lastKey && !th.dirty) return;
    th.lastKey = key; th.dirty = false;
    const draw = (P, rt) => { place(P); renderer.setRenderTarget(rt); renderer.render(scene, camera); };
    if (mixv < 0.999) draw(PA, th.rtA);
    if (PB && mixv > 0.001) draw(PB, th.rtB);
    if (xr > 0.001 || th.lensAmt > 0.001) {
      const P = main === A ? PA : PB || PA; place(P);
      const bg = scene.background, fog = scene.fog;
      scene.background = null; scene.fog = null; th.sky.visible = false; th.glassMeshes.forEach((g) => { g.visible = false; }); scene.overrideMaterial = th.normMat;
      renderer.setClearColor(0x8080ff, 1); renderer.setRenderTarget(th.rtN); renderer.clear(); renderer.render(scene, camera);
      scene.overrideMaterial = null; th.sky.visible = true; th.glassMeshes.forEach((g) => { g.visible = true; });
      camera.layers.set(1); renderer.setClearColor(0x000000, 0); renderer.setRenderTarget(th.rtNet); renderer.clear(); renderer.render(scene, camera); camera.layers.set(0);
      scene.background = bg; scene.fog = fog;
    }
    const u = th.blend.uniforms;
    u.tA.value = mixv >= 0.999 ? th.rtB.texture : th.rtA.texture;
    u.mixv.value = PB && mixv < 0.999 ? mixv : 0;
    u.xray.value = xr > 0.001 ? 1 : 0;
    u.lensC.value.copy(th.lensP); u.lensR.value = this.LENS_R * renderer.getPixelRatio(); u.lensAmt.value = th.lensAmt;
    u.scan.value = goingIn ? xr : xr;
    u.time.value = time;
    u.focus.value = this.FOCUS[main.i] == null ? 0.5 : this.FOCUS[main.i];
    u.blur.value = motion ? (this.MOB ? 0.6 : 1) : 0;
    renderer.setRenderTarget(null); renderer.render(th.post, th.postCam);
  }
}
