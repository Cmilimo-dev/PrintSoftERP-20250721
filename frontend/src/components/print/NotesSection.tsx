
import React from 'react';

interface NotesSectionProps {
  notes?: string;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes }) => {
  if (!notes) return null;

  return (
    <div className="notes-section mb-6 print:mb-5 relative z-10">
      <div className="section-title font-bold mb-2 text-xs text-gray-800">Additional Notes:</div>
      <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded border">
        {notes}
      </div>
    </div>
  );
};

export default NotesSection;
