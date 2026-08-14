// Register Service Worker and Manage Web App Badging for Trøjborg-appen
(function () {
  // Registrer Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('TrøjborgApp Service Worker registreret med succes:', reg.scope);
        })
        .catch(err => {
          console.warn('Kunne ikke registrere Service Worker:', err);
        });
    });
  }

  // Nulstil den røde prik på hjemskærmens ikon når appen åbnes/tjekkes
  function clearBadgeOnOpen() {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  }

  window.addEventListener('focus', clearBadgeOnOpen);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      clearBadgeOnOpen();
    }
  });

  // Global hjælpemetode til at anmode om notifikationstilladelse og teste den røde prik
  window.requestNotificationPermission = async function () {
    if (!('Notification' in window)) {
      alert('Din browser understøtter desværre ikke push-notifikationer.');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Test-badge for at verificere den røde prik på telefonens hjemskærm
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(1).catch(() => {});
        setTimeout(() => {
          navigator.clearAppBadge().catch(() => {});
        }, 4000);
      }
      return true;
    } else {
      alert('Push-notifikationer blev afvist. Du kan aktivere dem i telefonens browserindstillinger.');
      return false;
    }
  };
})();
