/**
 * Firebase Seed Script — run in browser console
 *
 * Instructions:
 * 1. Open /admin/ page and sign in with Google
 * 2. Open browser DevTools console (F12)
 * 3. Paste this entire script and press Enter
 *
 * Seeds events and food/drink items into Firestore.
 */

(async function seedFirebase() {
  const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
  const db = window._firebaseDb;

  if (!db) {
    console.error('Firebase not connected. Sign in on /admin/ first.');
    return;
  }

  const events = [
    { id: 'evt-001', title: 'Degustace řemeslných piv', date: '2026-04-05', time: '18:00', category: 'degustace', description: 'Ochutnávka 6 speciálních piv z českých minipivovarů. Vstupné 199 Kč včetně ochutnávky.' },
    { id: 'evt-002', title: 'Tygří kvíz', date: '2026-04-12', time: '19:00', category: 'akce', description: 'Hospodský kvíz pro týmy 2–6 hráčů. Výhra: sud piva pro celý tým!' },
    { id: 'evt-003', title: 'Živá hudba — jazz večer', date: '2026-04-19', time: '20:00', category: 'hudba', description: 'Jazz trio z Brna. Vstup zdarma, rezervace doporučena.' },
    { id: 'evt-004', title: 'Pivní maraton — 10 čepů', date: '2026-05-03', time: '16:00', category: 'degustace', description: 'Celodenní akce: 10 speciálních piv rotujících na čepu. Sběratelský tácek pro každého účastníka.' },
    { id: 'evt-005', title: 'Grilování na zahrádce', date: '2026-05-17', time: '15:00', category: 'akce', description: 'Zahájení letní sezóny! Grilované speciality, koktejly a pivo za akční ceny.' },
    { id: 'evt-006', title: 'Zelené pivo — Zelený čtvrtek', date: '2026-04-02', time: '16:00', category: 'akce', description: 'Tradiční velikonoční speciál! Na Zelený čtvrtek čepujeme zelené pivo — speciálně barvený ležák s kopřivovým extraktem. K tomu velikonoční menu: špenátová polévka, nádivka a jidášky. Zelené pivo na čepu od 16:00 do vyprodání zásob. Přijďte v zeleném a dostanete první pivo za polovinu!' },
  ];

  const food = [
    // Studené
    { id: 'food-001', name: 'Nakládaný hermelín', desc: 'V oleji s cibulí, paprikou a kořením', weight: '150 g', price: 89, category: 'cold' },
    { id: 'food-002', name: 'Utopenec', desc: 'Klasický utopený buřt v pikantním nálevu', weight: '1 ks', price: 69, category: 'cold' },
    { id: 'food-003', name: 'Pivní sýr (obložený)', desc: 'Tvarůžky, hermelín, níva s pečivem', weight: '200 g', price: 129, category: 'cold' },
    { id: 'food-004', name: 'Tatarák z lososa', desc: 'S kapary, červenou cibulkou a topinkami', weight: '150 g', price: 159, category: 'cold' },
    { id: 'food-005', name: 'Masová prkénka', desc: 'Mix sušených mas, sýrů a okurek. Pro dva.', weight: '350 g', price: 219, category: 'cold' },
    { id: 'food-006', name: 'Škvarková pomazánka', desc: 'Domácí, s čerstvým chlebem', weight: '150 g', price: 79, category: 'cold' },
    { id: 'food-007', name: 'Tlačenka s cibulí', desc: 'S octem a chlebem', weight: '200 g', price: 79, category: 'cold' },
    { id: 'food-008', name: 'Chlebíčky', desc: 'Mix 3ks — šunka, sýr, vajíčko', weight: '250 g', price: 99, category: 'cold' },
    { id: 'food-009', name: 'Studená mísa', desc: 'Mix šunky, sýru, zeleniny', weight: '300 g', price: 159, category: 'cold' },
    // Teplé
    { id: 'food-010', name: 'Topinky s česnekem', desc: 'Klasika ke každému pivu. Se sýrem nebo bez.', weight: '3 ks', price: 69, category: 'warm' },
    { id: 'food-011', name: 'Pivní klobása', desc: 'Grilovaná klobása s hořčicí a chlebem', weight: '200 g', price: 99, category: 'warm' },
    { id: 'food-012', name: 'Smažený sýr v housce', desc: 'Eidam 30 %, tatarská omáčka', weight: '150 g', price: 109, category: 'warm' },
    { id: 'food-013', name: 'Kuřecí stripsy', desc: 'S česnekovým dipem a hranolkami', weight: '200 g', price: 129, category: 'warm' },
    { id: 'food-014', name: 'Nachos grande', desc: 'Se sýrovou omáčkou, jalapeños a salsou', weight: '300 g', price: 119, category: 'warm' },
    { id: 'food-015', name: 'Hovězí burger', desc: 'Domácí bulka, cheddar, slanina, BBQ', weight: '250 g', price: 179, category: 'warm' },
    { id: 'food-016', name: 'Bramborák', desc: 'Domácí, křupavý', weight: '200 g', price: 89, category: 'warm' },
    { id: 'food-017', name: 'Hovězí guláš', desc: 'S houskovým knedlíkem', weight: '300 g', price: 149, category: 'warm' },
    { id: 'food-018', name: 'Párek v rohlíku', desc: 'Klasika s hořčicí', weight: '150 g', price: 59, category: 'warm' },
    // Nápoje
    { id: 'drink-001', name: 'Kofola (0,3 l)', desc: 'Originál, čepovaná', weight: '0,3 l', price: 35, category: 'drinks' },
    { id: 'drink-002', name: 'Kofola (0,5 l)', desc: 'Originál, čepovaná', weight: '0,5 l', price: 45, category: 'drinks' },
    { id: 'drink-003', name: 'Coca-Cola', desc: '', weight: '0,33 l', price: 40, category: 'drinks' },
    { id: 'drink-004', name: 'Sprite', desc: '', weight: '0,33 l', price: 40, category: 'drinks' },
    { id: 'drink-005', name: 'Džus', desc: 'Pomeranč / Jablko', weight: '0,2 l', price: 35, category: 'drinks' },
    { id: 'drink-006', name: 'Minerální voda', desc: 'Perlivá / Neperlivá', weight: '0,33 l', price: 30, category: 'drinks' },
    { id: 'drink-007', name: 'Fernet Stock', desc: 'Hořký bylinný likér', weight: '0,04 l', price: 45, category: 'drinks' },
    { id: 'drink-008', name: 'Becherovka', desc: 'Originál', weight: '0,04 l', price: 45, category: 'drinks' },
    { id: 'drink-009', name: 'Slivovice', desc: 'Moravská', weight: '0,04 l', price: 50, category: 'drinks' },
    { id: 'drink-010', name: 'Víno bílé', desc: 'Dle aktuální nabídky', weight: '0,2 l', price: 50, category: 'drinks' },
    { id: 'drink-011', name: 'Víno červené', desc: 'Dle aktuální nabídky', weight: '0,2 l', price: 50, category: 'drinks' },
    { id: 'drink-012', name: 'Espresso', desc: '', weight: '', price: 45, category: 'drinks' },
    { id: 'drink-013', name: 'Čaj', desc: 'Výběr druhů', weight: '', price: 35, category: 'drinks' },
  ];

  console.log('Seeding events...');
  for (const evt of events) {
    await setDoc(doc(db, 'events', evt.id), evt);
    console.log('  + event:', evt.title);
  }

  console.log('Seeding food & drinks...');
  for (const item of food) {
    await setDoc(doc(db, 'food', item.id), item);
    console.log('  +', item.category + ':', item.name);
  }

  console.log('');
  console.log('Done! Seeded ' + events.length + ' events + ' + food.length + ' food/drink items.');
})();
