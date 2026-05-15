/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Editorial dark palette (per DESIGN.md) ───────────────────────────
      colors: {
        // Surfaces — slightly warmer than pure black; do NOT use #000
        bg: {
          base:     '#0c0c0c', // page background
          'elev-1': '#131313', // cards, nav background
          'elev-2': '#1a1a1a', // hover surfaces
          'elev-3': '#242424', // input fields
        },
        // Foreground — never pure white except hero display
        fg: {
          primary:   '#ededed',
          secondary: '#a0a0a0',
          tertiary:  '#6a6a6a',
          disabled:  '#4a4a4a',
        },
        // Legacy 3-tone gold palette kept for compatibility
        // New default = #d4af37 (editorial gold)
        gold: {
          DEFAULT: '#d4af37',
          hover:   '#c9a431',
          tint:    'rgba(212,175,55,0.08)',
          line:    'rgba(212,175,55,0.25)',
          300: '#E8CA6A',
          400: '#D4A843',
          500: '#B8922A',
          600: '#9A7A22',
        },
        // Semantic — used sparingly
        success: '#4ade80',
        danger:  '#f87171',
        info:    '#60a5fa',
        // Legacy keys kept so existing references don't break
        cream:  { 50: '#FDFCF8', 100: '#F8F5EE', 200: '#EDE8DC', 300: '#DDD7C8' },
        forest: { 600: '#2E2E42', 700: '#1C1C2A', 800: '#13131E', 900: '#0C0C16' },
        warm:   { 300: '#B8B2A8', 400: '#9E9890', 500: '#857F77', 600: '#6E685F', 700: '#57524A' },
      },

      // ── Typography (per DESIGN.md type scale) ────────────────────────────
      fontFamily: {
        // Display — sparingly, hero only
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        // Body / UI default
        sans:  ['"Inter"', '-apple-system', 'system-ui', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        // Same family for numeric, but expected to be combined with tabular-nums
        mono:  ['"Inter"', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        overline:     ['11px',   { lineHeight: '1.4',  letterSpacing: '0.22em', fontWeight: '600' }],
        caption:      ['12px',   { lineHeight: '1.45', letterSpacing: '0.01em', fontWeight: '500' }],
        body:         ['14px',   { lineHeight: '1.65', fontWeight: '400' }],
        'body-lg':    ['16px',   { lineHeight: '1.6',  fontWeight: '400' }],
        'heading-md': ['18px',   { lineHeight: '1.4',  fontWeight: '600', letterSpacing: '-0.01em' }],
        'heading-lg': ['22px',   { lineHeight: '1.35', fontWeight: '600', letterSpacing: '-0.012em' }],
        'heading-xl': ['28px',   { lineHeight: '1.3',  fontWeight: '600', letterSpacing: '-0.015em' }],
        'display-lg': ['36px',   { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.02em' }],
        'display-xl': ['48px',   { lineHeight: '1.05', fontWeight: '600', letterSpacing: '-0.022em' }],
        'display-2xl':['64px',   { lineHeight: '1.02', fontWeight: '600', letterSpacing: '-0.025em' }],
      },

      // ── Spacing & container ─────────────────────────────────────────────
      maxWidth: {
        content: '1100px', // editorial narrower than the shadcn 1200 default
        prose:   '680px',
      },

      // ── Radius scale (per DESIGN.md) ─────────────────────────────────────
      borderRadius: {
        DEFAULT: '8px',
        sm:      '4px',
        md:      '8px',
        lg:      '12px',
        xl:      '16px',
        '2xl':   '24px',
        '3xl':   '32px',
        full:    '9999px',
      },

      // ── Motion timing (per DESIGN.md) ────────────────────────────────────
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.22, 1, 0.36, 1)', // default ease-out across site
        emphasis: 'cubic-bezier(0.16, 1, 0.3, 1)',  // hero reveal
        snap:     'cubic-bezier(0.4, 0, 0.2, 1)',   // tap feedback
      },
      transitionDuration: {
        fast:     '120ms',
        base:     '200ms',
        slow:     '320ms',
        emphasis: '480ms',
      },

      // ── Shadows — restraint by default ───────────────────────────────────
      boxShadow: {
        'focus-gold': '0 0 0 2px rgba(212,175,55,0.6)',
        card:         'none',
        'card-hover': '0 1px 24px rgba(0,0,0,0.4)',
        sticky:       '0 2px 24px rgba(0,0,0,0.35)',
      },

      // ── Background patterns kept for backward compatibility ─────────────
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
