import React, { useState } from "react";
import { Fingerprint } from "lucide-react";

const FingerprintTests = () => {
  const [status, setStatus] = useState("");
  const [anim, setAnim] = useState(false);

  const testFingerprint = async () => {
    if (!window.PublicKeyCredential) {
      setStatus("❌ WebAuthn not supported in this browser.");
      return;
    }

    try {
      setStatus("🔄 Waiting for fingerprint/biometric auth...");
      setAnim(true);

      const publicKey = {
        challenge: new Uint8Array([0x8C, 0x7F, 0x33, 0x21]).buffer,
        rp: { name: "System Tester" },
        user: {
          id: new Uint8Array([1, 2, 3, 4]),
          name: "test-user",
          displayName: "Test User"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: "platform" },
        timeout: 60000,
        attestation: "none"
      };

      await navigator.credentials.create({ publicKey });
      setStatus("✅ Fingerprint sensor works! Authentication success.");
      setAnim(false);
    } catch (err) {
      setStatus("❌ Authentication failed or cancelled.");
      setAnim(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Fingerprint Lock Test</h2>
        <p className="text-sm text-gray-600 mb-4">Test if your fingerprint/biometric sensor is working.</p>

        <div className="flex items-center gap-6">
          <button
            onClick={testFingerprint}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Start Fingerprint Test
          </button>

          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full transition-all ${anim ? 'animate-ping bg-blue-200' : ''}`}></div>
            <Fingerprint className={`w-16 h-16 ${anim ? 'text-blue-600 drop-shadow' : 'text-gray-500'}`} />
          </div>
        </div>

        {status && <p className="mt-4 text-sm text-gray-800">{status}</p>}
      </div>
    </div>
  );
};

export default FingerprintTests;
