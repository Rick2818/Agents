async function checkLive() {
  try {
    const res = await fetch('https://boltech-group.vercel.app');
    console.log('HTTP Status:', res.status);
    console.log('Server:', res.headers.get('server'));
    const html = await res.text();
    console.log('Production contains Video 1 (main-executive-video):', html.includes('id="main-executive-video"'));
    console.log('Production contains Video 2 (agent-solution-video):', html.includes('id="agent-solution-video"'));
    console.log('Production contains syncVideosLanguage:', html.includes('syncVideosLanguage'));
    console.log('Production contains Unblock_AI_Shield_Oficial.mp4:', html.includes('Unblock_AI_Shield_Oficial.mp4'));
    console.log('Production contains gerente_bottleneck_agente_es.mp4:', html.includes('gerente_bottleneck_agente_es.mp4'));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
checkLive();
