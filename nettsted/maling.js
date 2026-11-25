// Trafikkmåling med Google Analytics, bare for besøkende som har sagt ja.
// Midlertidig ligger taggen i index.html og lastes for alle, uten informasjonskapsler, til den
// er verifisert hos Google. Informasjonskapsler settes først når den besøkende har godtatt.
// MALINGS_ID er Google-taggen for salonghuset.no. Den sender tallene til Google Analytics.
// Står den tom, er målingen slått av, og spørsmålet om samtykke vises ikke.
const MALINGS_ID = 'GTM-NJPCB22N';

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
  // Ligger taggen allerede i siden, holder det å melde fra at målingen er godtatt.
  if (window.gtag) {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  window.dataLayer = [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  // Samtykket gjelder bare måling av trafikk, ikke annonsering.
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  const skript = document.createElement('script');
  skript.async = true;
  skript.src = 'https://www.googletagmanager.com/gtm.js?id=' + MALINGS_ID;
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
    '<p>Vi bruker informasjonskapsler til å måle trafikken på siden. ' +
    '<a href="personvern.html">Les mer om personvern</a></p>' +
    '<div class="samtykke-valg">' +
    '<button type="button" class="knapp knapp-liten" data-valg="nei">Avslå</button>' +
    '<button type="button" class="knapp knapp-liten" data-valg="ja">Godta</button>' +
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
