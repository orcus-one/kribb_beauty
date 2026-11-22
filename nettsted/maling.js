// Trafikkmåling med Google Analytics, bare for besøkende som har sagt ja.
// Ingenting hentes fra Google, og ingen informasjonskapsler settes, før samtykket er gitt.
// Så lenge MALINGS_ID står tom, er målingen slått av, og spørsmålet om samtykke vises ikke.
const MALINGS_ID = '';

// Valget lagres i nettleseren til den besøkende, slik at vi ikke spør på nytt ved hvert besøk.
const NOKKEL = 'samtykke-maling';

function lesValg() {
  try {
    return localStorage.getItem(NOKKEL);
  } catch (feil) {
    return null;
  }
}

function lagreValg(valg) {
  try {
    localStorage.setItem(NOKKEL, valg);
  } catch (feil) {
    // Uten lagring spør vi igjen ved neste besøk.
  }
}

function startMaling() {
  if (window.dataLayer) return;
  window.dataLayer = [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MALINGS_ID);
  const skript = document.createElement('script');
  skript.async = true;
  skript.src = 'https://www.googletagmanager.com/gtag/js?id=' + MALINGS_ID;
  document.head.appendChild(skript);
}

// Fjerner informasjonskapslene fra Google Analytics når noen trekker samtykket.
function slettMalingskapsler() {
  document.cookie.split(';').forEach((kapsel) => {
    const navn = kapsel.split('=')[0].trim();
    if (!navn.startsWith('_ga')) return;
    const slett = navn + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = slett;
    document.cookie = slett + '; domain=' + location.hostname;
    document.cookie = slett + '; domain=.' + location.hostname.replace(/^www\./, '');
  });
}

function visSporsmal() {
  if (document.querySelector('.samtykke')) return;

  const boks = document.createElement('section');
  boks.className = 'samtykke';
  boks.setAttribute('aria-label', 'Samtykke til trafikkmåling');
  boks.innerHTML =
    '<div class="samtykke-innhold">' +
    '<p><strong>Er det greit at vi måler besøket ditt?</strong> ' +
    'Vi bruker Google Analytics for å se hvor mange som besøker siden, og hva de leser. ' +
    'Det setter informasjonskapsler i nettleseren din, og det gjør vi bare hvis du sier ja. ' +
    '<a href="personvern.html">Les mer om personvern</a></p>' +
    '<div class="samtykke-valg">' +
    '<button type="button" class="knapp knapp-liten" data-valg="ja">Ja, det er greit</button>' +
    '<button type="button" class="knapp knapp-liten" data-valg="nei">Nei takk</button>' +
    '</div></div>';

  boks.addEventListener('click', (hendelse) => {
    const valg = hendelse.target.dataset.valg;
    if (!valg) return;
    const forrige = lesValg();
    lagreValg(valg);
    boks.remove();
    if (valg === 'ja') {
      startMaling();
    } else if (forrige === 'ja') {
      // Målingen kjører allerede på denne siden. Sletter kapslene og laster siden uten måling.
      slettMalingskapsler();
      location.reload();
    }
  });

  document.body.appendChild(boks);
}

if (MALINGS_ID) {
  const valg = lesValg();
  if (valg === 'ja') {
    startMaling();
  } else if (valg !== 'nei') {
    visSporsmal();
  }

  // Lenken i bunnteksten henter spørsmålet fram igjen, slik at valget kan endres.
  document.querySelectorAll('.endre-samtykke').forEach((knapp) => {
    knapp.hidden = false;
    knapp.addEventListener('click', visSporsmal);
  });
}
