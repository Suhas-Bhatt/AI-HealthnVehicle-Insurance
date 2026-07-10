import React from 'react';
import { Hospital, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * InsuranceOptions Component
 * Displays two large selectable cards for Hospital and Vehicle insurance claims.
 */
const InsuranceOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Hospital Insurance Card */}
      <div
        className="flex items-center justify-center p-8 bg-primary/10 rounded-2xl border border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
        onClick={() => navigate('/hospital')}
      >
        <Hospital className="w-12 h-12 text-primary mr-4" />
        <span className="text-xl font-bold text-primary">Hospital Insurance</span>
      </div>

      {/* Vehicle Insurance Card */}
      <div
        className="flex items-center justify-center p-8 bg-secondary/10 rounded-2xl border border-secondary/20 hover:bg-secondary/20 cursor-pointer transition-colors"
        onClick={() => navigate('/vehicle')}
      >
        <Car className="w-12 h-12 text-secondary mr-4" />
        <span className="text-xl font-bold text-secondary">Vehicle Insurance</span>
      </div>
    </div>
  );
};

export default InsuranceOptions;
