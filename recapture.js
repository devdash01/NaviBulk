import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function capture() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1536,1100',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9222/json');
    const tabs = await res.json();
    const target = tabs.find(t => t.url.includes('5173')) || tabs[0];
    console.log('Target found:', target.url);

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.onopen = resolve);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const reqId = id++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === reqId) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    // 1. Capture Home Page
    await send('Runtime.evaluate', { expression: "window.location.hash = 'home';" });
    await new Promise(r => setTimeout(r, 1500));
    const homeShot = await send('Page.captureScreenshot', { format: 'png' });
    const homeBuf = Buffer.from(homeShot.data, 'base64');
    fs.writeFileSync('c:/Users/Dakshh Goel/sih/screenshots/admiralty_home_problem_framing.png', homeBuf);
    fs.writeFileSync('C:/Users/Dakshh Goel/.gemini/antigravity-ide/brain/45ed5076-d998-4ab0-8b4f-0c2403df2e59/admiralty_home_problem_framing.png', homeBuf);
    console.log('Home screenshot saved, size:', homeBuf.length);

    // 2. Capture Voyage Planner
    await send('Runtime.evaluate', { expression: "window.location.hash = 'planner';" });
    await new Promise(r => setTimeout(r, 1500));
    const plannerShot = await send('Page.captureScreenshot', { format: 'png' });
    const plannerBuf = Buffer.from(plannerShot.data, 'base64');
    fs.writeFileSync('c:/Users/Dakshh Goel/sih/screenshots/admiralty_voyage_planner.png', plannerBuf);
    fs.writeFileSync('C:/Users/Dakshh Goel/.gemini/antigravity-ide/brain/45ed5076-d998-4ab0-8b4f-0c2403df2e59/admiralty_voyage_planner.png', plannerBuf);
    console.log('Planner screenshot saved, size:', plannerBuf.length);

    ws.close();
  } catch (err) {
    console.error('Error capturing:', err);
  } finally {
    proc.kill();
  }
}

capture();
