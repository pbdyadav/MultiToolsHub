import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { InchesToCm } from './pages/tools/InchesToCm';
import { CurrencyConverter } from './pages/tools/CurrencyConverter';
import { JpgToPng } from './pages/tools/JpgToPng';
import { HexToRgb } from './pages/tools/HexToRgb';
import { TypingTest } from './pages/tools/TypingTest';
import { TypingZone } from './pages/tools/TypingZone';
import { FunZone } from './pages/FunZone';
import BackgroundRemover from './pages/tools/image/BackgroundRemover';
import EnhanceQuality from './pages/tools/image/EnhanceQuality';
import ColorizeBW from './pages/tools/image/ColorizeBW';
import ChangeBackground from './pages/tools/image/ChangeBackground';
import ExtraTools from './pages/tools/image/ExtraTools';
import { ScreenDeadPixelTest } from './pages/tools/system/ScreenDeadPixelTest';
import KeyboardTest from "./pages/tools/system/KeyboardTest";
import StorageRamTest from "./pages/tools/system/StorageRamTest";
import AudioVideoTests from './pages/tools/system/AudioVideoTests';
import { NetworkTests } from './pages/tools/system/NetworkTests';
import { UniversalUnitConverter } from './pages/tools/UniversalUnitConverter';
import { UniversalFileConverter } from './pages/tools/UniversalFileConverter';

// ✅ NEW IMPORTS
import SerialNumberTest from "./pages/tools/system/SnTests";
import BatteryHealthTest from "./pages/tools/system/BatteryTests";
import FingerprintLockTest from "./pages/tools/system/FingerprintTests";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools/inches-to-cm" element={<InchesToCm />} />
            <Route path="/tools/currency-converter" element={<CurrencyConverter />} />
            <Route path="/tools/jpg-to-png" element={<JpgToPng />} />
            <Route path="/tools/hex-to-rgb" element={<HexToRgb />} />
            <Route path="/tools/typing-test" element={<TypingTest />} />
            <Route path="/tools/typing-zone" element={<TypingZone />} />
            <Route path="/tools/fun-zone" element={<FunZone />} />

            {/* Image Studio */}
            <Route path="/tools/image/background-remover" element={<BackgroundRemover />} />
            <Route path="/tools/image/enhance" element={<EnhanceQuality />} />
            <Route path="/tools/image/colorize" element={<ColorizeBW />} />
            <Route path="/tools/image/change-background" element={<ChangeBackground />} />
            <Route path="/tools/image/extra-tools" element={<ExtraTools />} />

            {/* System Tester */}
            <Route path="/tools/system/screen-dead-pixel" element={<ScreenDeadPixelTest />} />
            <Route path="/tools/system/keyboard-test" element={<KeyboardTest />} />
            <Route path="/tools/system/storage-tests" element={<StorageRamTest />} />
            <Route path="/tools/system/av-tests" element={<AudioVideoTests />} />
            <Route path="/tools/system/network-tests" element={<NetworkTests />} />

            {/* ✅ NEW SYSTEM TOOLS */}
            <Route path="/tools/system/sn-tests" element={<SerialNumberTest />} />
            <Route path="/tools/system/battery-tests" element={<BatteryHealthTest />} />
            <Route path="/tools/system/fingerprint-tests" element={<FingerprintLockTest />} />

            <Route path="/tools/universal-unit-converter" element={<UniversalUnitConverter />} />
            <Route path="/tools/universal-file-converter" element={<UniversalFileConverter />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
