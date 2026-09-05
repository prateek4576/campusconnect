import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setIsInstalled(standalone);
    };

    checkInstalled();

    // Check whether App.jsx already captured the install event
    if (window.deferredPwaPrompt) {
      setCanInstall(true);
    }

    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      window.deferredPwaPrompt = null;
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

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
    const promptEvent = window.deferredPwaPrompt;

    if (!promptEvent) {
      alert(
        "CampusConnect is not ready to install yet.\n\n" +
        "In Chrome, open the ⋮ menu and look for " +
        '"Install app" or "Add to Home screen".'
      );
      return;
    }

    promptEvent.prompt();

    const result = await promptEvent.userChoice;

    console.log("Install result:", result.outcome);

    window.deferredPwaPrompt = null;
    setCanInstall(false);
  };

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
            {canInstall
              ? "Install CampusConnect →"
              : "Add to Home Screen →"}
          </button>
        </div>
      </div>
    </section>
  );
}