import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface TeamMemberFilterProps {
  teamMembers: TeamMember[];
  selectedMembers: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const TeamMemberFilter: React.FC<TeamMemberFilterProps> = ({
  teamMembers,
  selectedMembers,
  onSelectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onSelectionChange(selectedMembers.filter(id => id !== memberId));
    } else {
      onSelectionChange([...selectedMembers, memberId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(teamMembers.map(m => m.id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getButtonText = () => {
    if (selectedMembers.length === 0) {
      return 'All Team';
    } else if (selectedMembers.length === teamMembers.length) {
      return 'All Team';
    } else {
      return `${selectedMembers.length} Selected`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-[#666666] hover:text-[#000000] border border-[#e5e5e5] hover:border-[#000000] transition-colors uppercase tracking-wide focus:outline-none"
      >
        {getButtonText()}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#e5e5e5] shadow-lg z-50 animate-slide-in">
          {/* Actions */}
          <div className="px-4 py-3 border-b border-[#e5e5e5] flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="text-xs text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide focus:outline-none"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-wide focus:outline-none"
            >
              Clear All
            </button>
          </div>

          {/* Team member list */}
          <div className="max-h-64 overflow-y-auto">
            {teamMembers.map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => handleToggleMember(member.id)}
                  className="w-4 h-4 text-[#000000] border-[#e5e5e5] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                />
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-6 h-6 bg-[#000000] text-white flex items-center justify-center text-xs font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-[#000000]">{member.name}</div>
                    <div className="text-xs text-[#999999] uppercase">{member.role}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
