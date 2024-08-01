import { useState, useEffect, useRef } from "react";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdSearch, MdClose } from 'react-icons/md';

type SelectItem = {
  value: string;
  label: string;
};

type CustomMultiSelectProps = {
  data: SelectItem[];
  label: string;
  placeholder: string;
  onChange: (selectedItems: string[]) => void;
  handleSearchChange: (term: string) => void;
};

const MultiSelect = ({ data, label, placeholder, onChange, handleSearchChange }: CustomMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectItem = (item: SelectItem) => {
    const isSelected = selectedItems.includes(item.value);
    const newSelectedItems = isSelected
      ? selectedItems.filter(i => i !== item.value)
      : [...selectedItems, item.value];
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    onChange(selectedItems);
  }, [selectedItems]);

  const handleRemoveItem = (value: string) => {
    const newSelectedItems = selectedItems.filter(i => i !== value);
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  useEffect(() => {
    handleSearchChange(searchTerm);
  }, [searchTerm, handleSearchChange]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {selectedItems.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selectedItems.map(value => {
            const item = data.find(item => item.value === value);
            return (
              <div key={value} className="flex items-center px-2 py-1 text-cyan-600 bg-gray-200 rounded-full">
                {item?.label}
                <MdClose className="ml-1 cursor-pointer" onClick={() => handleRemoveItem(value)} />
              </div>
            );
          })}
        </div>
      )}
      <div
        className="mt-1 flex items-center border border-gray-300 bg-white rounded-md shadow-sm cursor-pointer p-2"
        onClick={handleToggleDropdown}
      >
        <MdSearch className="mr-2" />
        <input
          type="text"
          placeholder={placeholder}
          className="flex-grow focus:outline-none bg-transparent text-gray-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full text-cyan-600 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {data.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
            <div
              key={item.value}
              className="cursor-pointer flex items-center p-2 hover:bg-gray-100"
              onClick={() => handleSelectItem(item)}
            >
              {selectedItems.includes(item.value) ? <MdCheckBox className="mr-2" /> : <MdCheckBoxOutlineBlank className="mr-2" />}
              {item.label}
            </div>
          ))}
          {data.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div className="p-2 text-gray-500 text-center">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
