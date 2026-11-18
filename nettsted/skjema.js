// Sender skjemaet «Meld interesse» til skjematjenesten Formspree, som sender innholdet
// videre som e-post til Kribb. Adressen under er skjemaets egen adresse hos Formspree,
// og den er laget for å ligge synlig i en nettside.
const SKJEMAADRESSE = 'https://formspree.io/f/maeojdlz';

const skjema = document.getElementById('interesseskjema');
const tilbakemelding = document.getElementById('skjema-tilbakemelding');
const sendeknapp = skjema.querySelector('button[type="submit"]');

function visTilbakemelding(tekst, type) {
  tilbakemelding.textContent = tekst;
  tilbakemelding.className = 'skjema-tilbakemelding ' + type;
  tilbakemelding.hidden = false;
}

skjema.addEventListener('submit', async (hendelse) => {
  hendelse.preventDefault();
  tilbakemelding.hidden = true;

  const felt = new FormData(skjema);

  // Feltet «_gotcha» er skjult for mennesker. Er det fylt ut, er det en robot.
  if (felt.get('_gotcha')) {
    return;
  }

  const organisasjonsnummer = felt.get('organisasjonsnummer').replace(/\s/g, '');
  if (organisasjonsnummer !== '' && !/^[0-9]{9}$/.test(organisasjonsnummer)) {
    visTilbakemelding('Organisasjonsnummeret skal ha ni siffer.', 'feil');
    skjema.elements.organisasjonsnummer.focus();
    return;
  }

  // Feltet «email» gjør at mottakeren kan svare avsenderen direkte fra e-posten.
  const innsending = {
    _subject: 'Ny interesse for Kribb Beauty',
    navn: felt.get('navn').trim(),
    telefon: felt.get('telefon').trim(),
    email: felt.get('epost').trim(),
    salongnavn: felt.get('salongnavn').trim(),
    organisasjonsnummer: organisasjonsnummer,
    melding: felt.get('melding').trim(),
  };

  sendeknapp.disabled = true;
  sendeknapp.textContent = 'Sender ...';

  try {
    const svar = await fetch(SKJEMAADRESSE, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(innsending),
    });

    if (!svar.ok) {
      throw new Error('Skjematjenesten svarte med ' + svar.status);
    }

    skjema.reset();
    skjema.hidden = true;
    visTilbakemelding('Takk! Vi har mottatt henvendelsen din, og vi tar kontakt.', 'sendt');
  } catch (feil) {
    console.error(feil);
    visTilbakemelding(
      'Noe gikk galt, og henvendelsen ble ikke sendt. Prøv igjen, eller ring 975 91 548.',
      'feil'
    );
  } finally {
    sendeknapp.disabled = false;
    sendeknapp.textContent = 'Send inn';
  }
});
