import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
        setInputValue('');
      } else if (newTag && tags.includes(newTag)) {
        setInputValue('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-800 rounded-md border border-slate-700 min-h-[40px]">
      {tags.map(tag => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-sm rounded-full"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="text-indigo-200 hover:text-white focus:outline-none leading-none"
            aria-label={`Remove tag ${tag}`}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a tag..."
        className="flex-1 min-w-[120px] bg-transparent text-slate-200 placeholder-slate-500 text-sm focus:outline-none"
      />
    </div>
  );
};

export default TagInput;