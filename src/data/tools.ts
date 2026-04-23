import { Category } from '../types/tools';

export const categories: Category[] = [
  {
  id: 'system-tester',
  name: 'System Tester',
  description: 'Quick tests for screen, input, audio/video, and network',
  color: 'bg-slate-600',
  tools: [
    { id: 'screen-dead-pixel', name: 'Screen Dead Pixel Test', description: 'Full-screen color cycling to spot stuck pixels', category: 'System Tester', path: '/tools/system/screen-dead-pixel', icon: 'Monitor' },
    { id: 'keyboard-test', name: 'Keyboard Test', description: 'Highlight pressed keys', category: 'System Tester', path: '/tools/system/keyboard-test', icon: 'Keyboard' },
    { id: 'storage-tests', name: 'HDD/SSD & RAM Tests', description: 'Guides and checklists for storage and memory', category: 'System Tester', path: '/tools/system/storage-tests', icon: 'HardDrive' },
    { id: 'audio-video-tests', name: 'Speaker/Camera/Mic Tests', description: 'Play tone, webcam preview, mic levels', category: 'System Tester', path: '/tools/system/av-tests', icon: 'Camera' },

    // ✅ New Tools
    { id: 'serial-number-test', name: 'Serial No. Check', description: 'Find laptop serial number', category: 'System Tester', path: '/tools/system/sn-tests', icon: 'Hash' },
    { id: 'battery-health', name: 'Battery Health Test', description: 'Battery Health check for your laptop', category: 'System Tester', path: '/tools/system/battery-tests', icon: 'Battery' },
    { id: 'fingerprint-lock-test', name: 'Fingerprint Lock Test', description: 'Fingerprint Lock test for your laptop', category: 'System Tester', path: '/tools/system/fingerprint-tests', icon: 'Fingerprint' }
  ]
 },
  {
    id: 'typing-zone',
    name: 'Typing Zone',
    description: 'Lessons, games, and practice for all skill levels',
    color: 'bg-teal-500',
    tools: [
      {
        id: 'typing-zone',
        name: 'Typing Learning & Fun Zone',
        description: 'Learn typing from basics to advanced with fun games',
        category: 'Typing Zone',
        path: '/tools/typing-zone?tab=learn',
        icon: 'Keyboard'
      },
      {
        id: 'typing-dictation',
        name: 'Dictation Room',
        description: 'Practice classroom dictation with clear sentence prompts',
        category: 'Typing Zone',
        path: '/tools/typing-zone?tab=dictation',
        icon: 'Target'
      },
      {
        id: 'typing-progress',
        name: 'Student Progress',
        description: 'Review saved typing sessions and growth over time',
        category: 'Typing Zone',
        path: '/tools/typing-zone?tab=progress',
        icon: 'BarChart3'
      },
      {
        id: 'typing-fun',
        name: 'Game Practice',
        description: 'Jump directly into balloon, cloud, and brick games',
        category: 'Typing Zone',
        path: '/tools/typing-zone?tab=fun',
        icon: 'Gamepad2'
      },
      {
        id: 'typing-test',
        name: 'Typing Speed Test',
        description: 'Test and improve your typing speed with certificate',
        category: 'Typing Zone',
        path: '/tools/typing-test',
        icon: 'Keyboard'
      }
    ]
  },
  {
    id: 'image-studio',
    name: 'Image Studio',
    description: 'Edit and transform your images in the browser',
    color: 'bg-fuchsia-500',
    tools: [
      { id: 'bg-remover', name: 'Background Remover', description: 'Remove background from images (demo)', category: 'Image Studio', path: '/tools/image/background-remover', icon: 'ImageMinus' },
      { id: 'enhance', name: 'Enhance Quality', description: 'Improve contrast and saturation', category: 'Image Studio', path: '/tools/image/enhance', icon: 'Sparkles' },
      { id: 'colorize', name: 'B/W to Color', description: 'Colorize black & white images (demo)', category: 'Image Studio', path: '/tools/image/colorize', icon: 'Palette' },
      { id: 'change-bg', name: 'Change Background', description: 'Replace background with solid color (demo)', category: 'Image Studio', path: '/tools/image/change-background', icon: 'Layers' },
      { id: 'image-extras', name: 'Extra Tools', description: 'Crop/Resize, Compress, Blur/Sharpen, Watermark, Sketch', category: 'Image Studio', path: '/tools/image/extra-tools', icon: 'Scissors' }
    ]
  },
 {
    id: 'unit-converters',
    name: 'Unit Converters',
    description: 'Convert between different units of measurement',
    color: 'bg-blue-500',
    tools: [
      {
        id: 'inches-to-cm',
        name: 'Inches to Centimeters',
        description: 'Convert inches to centimeters instantly',
        category: 'Unit Converters',
        path: '/tools/inches-to-cm',
        icon: 'Ruler'
      },
      {
        id: 'universal-unit-converter',
        name: 'Universal Unit Converter',
        description: 'Convert between any units across multiple categories',
        category: 'Unit Converters',
        path: '/tools/universal-unit-converter',
        icon: 'Calculator'
      }
    ]
  },
  {
    id: 'currency',
    name: 'Currency',
    description: 'Currency conversion and financial tools',
    color: 'bg-green-500',
    tools: [
      {
        id: 'currency-converter',
        name: 'Currency Converter',
        description: 'Convert between different currencies with live rates',
        category: 'Currency',
        path: '/tools/currency-converter',
        icon: 'DollarSign'
      }
    ]
  },
  {
    id: 'file',
    name: 'File',
    description: 'File conversion and processing tools',
    color: 'bg-purple-500',
    tools: [
      {
        id: 'jpg-to-png',
        name: 'JPG to PNG Converter',
        description: 'Convert JPG images to PNG format',
        category: 'File',
        path: '/tools/jpg-to-png',
        icon: 'Image'
      },
      {
        id: 'universal-file-converter',
        name: 'Universal File Converter',
        description: 'Convert between different file formats',
        category: 'File',
        path: '/tools/universal-file-converter',
        icon: 'FileText'
      }
    ]
  },
  {
    id: 'colors',
    name: 'Colors',
    description: 'Color conversion and manipulation tools',
    color: 'bg-pink-500',
    tools: [
      {
        id: 'hex-to-rgb',
        name: 'HEX to RGB Converter',
        description: 'Convert HEX color codes to RGB values',
        category: 'Colors',
        path: '/tools/hex-to-rgb',
        icon: 'Palette'
      }
    ]
  },
  {
    id: 'fun',
    name: 'Fun',
    description: 'Games and entertainment tools',
    color: 'bg-orange-500',
    tools: [
      {
        id: 'fun-arrow-shot',
        name: 'Arrow Shot',
        description: 'Time your shot to hit the moving target',
        category: 'Fun',
        path: '/tools/fun-zone',
        icon: 'Target'
      },
      {
        id: 'fun-bow-arrow',
        name: 'Bow & Arrow',
        description: 'Charge the bow and land a perfect shot',
        category: 'Fun',
        path: '/tools/fun-zone',
        icon: 'Crosshair'
      },
      {
        id: 'fun-puzzle-match',
        name: 'Puzzle Match',
        description: 'Repeat the colored tile sequence',
        category: 'Fun',
        path: '/tools/fun-zone',
        icon: 'Puzzle'
      },
      {
        id: 'fun-brick-smash',
        name: 'Brick Smash',
        description: 'Click falling bricks before they land',
        category: 'Fun',
        path: '/tools/fun-zone',
        icon: 'Blocks'
      },
      {
        id: 'fun-balloon-pop',
        name: 'Balloon Pop',
        description: 'Pop drifting balloons before they escape',
        category: 'Fun',
        path: '/tools/fun-zone',
        icon: 'Gamepad2'
      }
    ]
  }
];

export const allTools = categories.flatMap(category => category.tools);
