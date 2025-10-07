interface CategoryTagProps {
  name: string;
  color: string;
}

export const CategoryTag = ({ name, color }: CategoryTagProps) => {
  return (
    <span
      className="text-xs px-2 py-1 rounded-full font-medium"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {name}
    </span>
  );
};
