const url = 'https://edikte.justiz.gv.at/edikte/ex/exedi3.nsf/alldoc/df4fd16b903e1cb3c1258da200331611!OpenDocument';
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'de' } });
const html = await res.text();

const idx = html.indexOf('Beschreibung (WE)');
if (idx > -1) {
  console.log(html.substring(idx, idx + 800));
}
