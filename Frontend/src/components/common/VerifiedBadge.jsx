import React from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const VerifiedBadge = ({ size = 'md', showText = false, className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    };

    return (
        <div className={`inline-flex items-center gap-1 text-blue-500 ${className}`} title="Verified Identity">
            <CheckBadgeIcon className={sizeClasses[size]} />
            {showText && <span className="text-sm font-medium">Verified</span>}
        </div>
    );
};

export default VerifiedBadge;
