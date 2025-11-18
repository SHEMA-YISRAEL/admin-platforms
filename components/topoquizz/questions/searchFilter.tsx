import { Input } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ searchValue, onSearchChange }) => {
  return (
    <Input
      isClearable
      placeholder="Buscar pregunta..."
      startContent={<IoSearchOutline className="text-gray-400" size={20} />}
      value={searchValue}
      onValueChange={onSearchChange}
      onClear={() => onSearchChange("")}
      size="sm"
      className="w-64"
      classNames={{
        input: "text-sm",
        inputWrapper: "h-9"
      }}
    />
  );
}

export default SearchFilter;
