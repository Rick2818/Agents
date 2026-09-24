async function check() {
  const url = 'https://boltech-group.vercel.app?v=' + Date.now();
  const res = await fetch(url);
  const html = await res.text();
  console.log('Status:', res.status);
  console.log('Total length:', html.length);
  const stripeMatches = html.match(/Stripe/gi) || [];
  console.log('Stripe occurrences in live HTML:', stripeMatches.length);
  console.log('Contains tab-strike:', html.includes('id="tab-strike"'));
  console.log('Contains tab-wompi:', html.includes('id="tab-wompi"'));
  const m1 = html.match(/id="modal-tab-strike-sub"[^>]*>([^<]+)</);
  console.log('modal-tab-strike-sub:', m1 ? m1[1] : 'not found');
  const m2 = html.match(/id="modal-tab-wompi-sub"[^>]*>([^<]+)</);
  console.log('modal-tab-wompi-sub:', m2 ? m2[1] : 'not found');
}
check().catch(console.error);
