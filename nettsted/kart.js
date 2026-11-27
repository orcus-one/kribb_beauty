// Kartet under «Finn oss». Det hentes fra Google Maps først når den besøkende trykker på
// «Vis kart», slik at Google ikke får vite om besøket og ikke setter informasjonskapsler
// før noen har bedt om kartet.
(function () {
  var KARTADRESSE = 'https://www.google.com/maps?q=Vestre+Gate+7,+Arendal,+Norge&z=17&hl=no&output=embed';

  var kart = document.querySelector('.kart');
  if (!kart) { return; }

  var knapp = kart.querySelector('.vis-kart');
  if (!knapp) { return; }

  knapp.addEventListener('click', function () {
    var ramme = document.createElement('iframe');
    ramme.src = KARTADRESSE;
    ramme.title = 'Kart som viser Vestre Gate 7 i Arendal';
    ramme.loading = 'lazy';
    ramme.referrerPolicy = 'no-referrer-when-downgrade';
    ramme.allowFullscreen = true;
    kart.querySelector('.kart-flate').replaceWith(ramme);
    kart.classList.add('kart-vist');
  });
})();
