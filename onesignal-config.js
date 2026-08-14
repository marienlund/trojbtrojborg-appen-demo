// OneSignal Web Push Configuration for Trøjborg-appen
window.ONESIGNAL_APP_ID = window.ONESIGNAL_APP_ID || "PASTE_YOUR_ONESIGNAL_APP_ID_HERE";

window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async function(OneSignal) {
  if (!window.ONESIGNAL_APP_ID || window.ONESIGNAL_APP_ID === "PASTE_YOUR_ONESIGNAL_APP_ID_HERE") {
    console.log("OneSignal: Indtast dit gratis OneSignal App ID i onesignal-config.js for at aktivere push til lukkede mobiler.");
    return;
  }

  await OneSignal.init({
    appId: window.ONESIGNAL_APP_ID,
    serviceWorkerParam: { scope: "/" },
    serviceWorkerPath: "OneSignalSDKWorker.js",
    notifyButton: {
      enable: true,
      size: "medium",
      position: "bottom-right",
      text: {
        'tip.state.unsubscribed': 'Modtag notifikationer om nye opgaver',
        'tip.state.subscribed': 'Du modtager notifikationer om opgaver',
        'tip.state.blocked': 'Du har blokeret notifikationer',
        'message.action.subscribed': 'Tak for tilmeldingen!',
        'dialog.main.title': 'Notifikationer for Trøjborg-appen',
        'dialog.main.button.subscribe': 'Tilmeld',
        'dialog.main.button.unsubscribe': 'Afmeld'
      }
    },
    promptOptions: {
      slidedown: {
        prompts: [
          {
            type: "push",
            autoPrompt: true,
            text: {
              actionMessage: "Vil du have besked og rød notifikationsprik på din mobil, når der oprettes nye opgaver på Trøjborg-appen?",
              acceptButton: "Ja tak, tillad",
              cancelButton: "Nej tak"
            }
          }
        ]
      }
    }
  });
});
