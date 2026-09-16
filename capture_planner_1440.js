import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function capture() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
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

    await send('Runtime.evaluate', { expression: "window.location.hash = 'planner';" });
    await new Promise(r => setTimeout(r, 2000));
    const plannerShot = await send('Page.captureScreenshot', { format: 'png' });
    const plannerBuf = Buffer.from(plannerShot.data, 'base64');
    
    const artifactPath = 'C:/Users/Dakshh Goel/.gemini/antigravity-ide/brain/cd0f2707-7818-43a8-8b4e-ecfe0cd04965/recomposed_voyage_planner_1440x900.png';
    fs.writeFileSync(artifactPath, plannerBuf);
    console.log('Recomposed screenshot saved, size:', plannerBuf.length);

    ws.close();
  } catch (err) {
    console.error('Error capturing:', err);
  } finally {
    proc.kill();
  }
}

capture();
