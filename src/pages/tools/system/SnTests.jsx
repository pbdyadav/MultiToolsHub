import React from "react";

const SerialNumberTest = () => {
  const getSystemInfo = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    return { ua, platform };
  };

  const { ua, platform } = getSystemInfo();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Serial Number Check</h2>
      <p className="mb-2">⚠️ For security reasons, browsers cannot directly access your laptop's serial number.</p>
      <p className="mb-4">But here are quick ways to find it:</p>

      <ul className="list-disc ml-6 space-y-2">
        <li><b>Windows:</b> Open <code>Command Prompt</code> and type: <code>wmic bios get serialnumber</code></li>
        <li><b>Mac:</b> Go to <code>About This Mac → Overview</code></li>
        <li><b>Linux:</b> Run: <code>sudo dmidecode -s system-serial-number</code></li>
      </ul>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Your Detected System Info:</h3>
        <p><b>Platform:</b> {platform}</p>
        <p><b>User Agent:</b> {ua}</p>
      </div>
    </div>
  );
};

export default SerialNumberTest;
