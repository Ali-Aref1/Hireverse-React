interface PercentageBarProps {
    color: string;
    percentage: number;
}

export const PercentageBar = ({color, percentage}: PercentageBarProps) => {
    console.log(color)
    return (
        <div className="flex items-center gap-2">
        <div className="w-32 h-2 rounded-full relative overflow-hidden" style={{backgroundColor: 'rgba(101, 101, 101, 0.31)'}}>
            <div 
                className={`h-full rounded-full transition-all duration-300 ease-out`}
                style={{
                    width: `${Math.min(Math.max(percentage, 0), 100)}%`
                    , backgroundColor: color
                }}
            />
        </div>
        <span style={{color:color}} className="font-bold">{percentage}%</span>
        </div>
    )
}
