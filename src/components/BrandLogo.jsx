import React, { useState } from 'react';
import { crmAssetUrl } from '../lib/api';

export default function BrandLogo({ compact = false, light = false }) {
    const [imageFailed, setImageFailed] = useState(false);

    if (!imageFailed) {
        return (
            <img
                src={crmAssetUrl('img/digi.png')}
                alt="DigiChefs"
                className={compact ? 'h-9 w-auto object-contain' : 'h-10 w-auto object-contain'}
                onError={() => setImageFailed(true)}
            />
        );
    }

    return (
        <div className={`font-black tracking-tight ${compact ? 'text-lg' : 'text-xl'} ${light ? 'text-white' : 'text-slate-950'}`}>
            DigiChefs
            {!compact && <span className={light ? 'text-emerald-300' : 'text-emerald-700'}> HR</span>}
        </div>
    );
}
