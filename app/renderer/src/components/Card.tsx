interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({ title, children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${
        onClick ? 'cursor-pointer hover:border-gray-600 transition-colors' : ''
      } ${className}`}
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default Card;
