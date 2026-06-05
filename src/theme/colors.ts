export const colors = {
  bg: {
    base:     '#07080C',
    surface:  '#0F1018',
    elevated: '#181A26',
    overlay:  'rgba(7,8,12,0.85)',
  },
  accent: {
    default:  '#00FFD4',
    glow:     'rgba(0,255,212,0.22)',
    dim:      'rgba(0,255,212,0.12)',
    border:   'rgba(0,255,212,0.25)',
  },
  amber: {
    default:  '#F5C842',
    dim:      'rgba(245,200,66,0.12)',
    border:   'rgba(245,200,66,0.25)',
  },
  feedback: {
    success:  '#2DD4A4',
    danger:   '#FF4757',
    warning:  '#FF9F43',
    info:     '#4D9EFF',
  },
  text: {
    primary:   '#EEEEF5',
    secondary: '#7A7D96',
    tertiary:  '#3D4060',
    inverse:   '#07080C',
  },
  border: {
    default: 'rgba(255,255,255,0.06)',
    subtle:  'rgba(255,255,255,0.04)',
    strong:  'rgba(255,255,255,0.12)',
  },
} as const;
