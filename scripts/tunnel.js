const localtunnel = require('localtunnel');
const { spawn } = require('child_process');

// เริ่ม Next.js server
console.log('🚀 Starting Next.js development server...');
const nextServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// รอให้ server เริ่มทำงาน
setTimeout(() => {
  console.log('🌐 Creating LocalTunnel...');
  
  const tunnel = localtunnel({ 
    port: 3000,
    subdomain: 'wiseattitude' // เปลี่ยนเป็นชื่อที่ต้องการ
  });

  tunnel.on('url', (url) => {
    console.log('✅ Tunnel created successfully!');
    console.log(`🔗 Your app is available at: ${url}`);
    console.log('📱 Share this URL to access your app from anywhere!');
    console.log('\nPress Ctrl+C to stop both server and tunnel');
  });

  tunnel.on('error', (err) => {
    console.error('❌ Tunnel error:', err.message);
    console.log('💡 Try using a different subdomain or let LocalTunnel assign one automatically');
  });

  // จัดการการปิดโปรแกรม
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    tunnel.close();
    nextServer.kill();
    process.exit(0);
  });

}, 5000); // รอ 5 วินาทีให้ server เริ่มทำงาน
