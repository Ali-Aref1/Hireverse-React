interface HireverseTitleProps {
    size?: number;
    className?: string;
}
export const HireverseTitle = ({size,className}:HireverseTitleProps) => {
  return (
    <span style={{fontSize: `${size}px`}} className={className}><span className={`font-bold font-title text-tertiary`}>&lt;//</span><span className="font-bold font-title text-secondary">HIREVERSE</span><span className="font-bold font-title text-tertiary">//&gt;</span></span>
  )
}
