const items = [
  '🔒 256-bit SSL encrypted',
  'PCI DSS compliant',
  'Instant token delivery',
]

export const SecurityNote = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontSize: '12px',
        color: 'var(--text)',
        textAlign: 'center',
        flexWrap: 'wrap',
        lineHeight: '14px',
        fontFamily: 'var(--font-medium)',
      }}
    >
      {items.map((item, index) => (
        <span key={index}>
          {item}
          {index < items.length - 1 && ' · '}
        </span>
      ))}
    </div>
  )
}