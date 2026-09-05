import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check whether the app is already installed
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setIsInstalled(standalone);
    };

    checkInstalled();

    // Android / Chromium install prompt
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    // Detect successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    // Already installed
    if (isInstalled) {
      return;
    }

    // Android / Chrome / Edge etc.
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      console.log("PWA install choice:", outcome);

      setDeferredPrompt(null);
      return;
    }

    // iPhone / iPad fallback
    alert(
      'To add CampusConnect to your Home Screen on iPhone:\n\n' +
        '1. Open CampusConnect in Safari\n' +
        '2. Tap the Share button\n' +
        '3. Tap "Add to Home Screen"\n' +
        '4. Tap "Add"'
    );
  };

  // Don't show button after installation
  if (isInstalled) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="bg-[#0B2545] text-white border-2 border-black brutal-shadow-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-block bg-[#E9C46A] text-black border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-3">
              Install
            </div>

            <h2 className="font-display font-black text-2xl md:text-3xl uppercase">
              Install CampusConnect on phone
            </h2>

            <p className="mt-2 text-white/90 max-w-2xl">
              Add CampusConnect to your phone home screen for quick access.
            </p>
          </div>

          <button
            type="button"
            onClick={handleInstall}
            className="bg-[#E9C46A] text-black border-2 border-black px-6 py-4 brutal-shadow-sm brutal-press font-display font-black uppercase whitespace-nowrap"
          >
            Install CampusConnect →
          </button>
        </div>
      </div>
    </section>
  );
}