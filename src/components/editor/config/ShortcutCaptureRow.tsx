import React, { useState, useEffect, useRef } from 'react';

interface ShortcutCaptureRowProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export function ShortcutCaptureRow({ label, value, onChange }: ShortcutCaptureRowProps) {
    const [isListening, setIsListening] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isListening) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.key === 'Escape') {
                setIsListening(false);
                return;
            }

           
            let keyName = e.key;
            if (keyName === ' ') keyName = 'Space';

            onChange(keyName);
            setIsListening(false);
            buttonRef.current?.blur();
        };

        
        window.addEventListener('keydown', handleKeyDown);
        
        // Cleanup
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isListening, onChange]);

    return (
        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed #333', paddingBottom: '8px' }}>
            <span style={{ color: '#ccc', fontSize: '13px' }}>{label}</span>
            <button
                ref={buttonRef}
                onClick={() => setIsListening(true)}
                style={{
                    background: isListening ? '#4dabf7' : '#333',
                    color: isListening ? '#000' : '#fff',
                    border: '1px solid',
                    borderColor: isListening ? '#4dabf7' : '#444',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '120px',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    fontWeight: isListening ? 'bold' : 'normal'
                }}
            >
                {isListening ? 'Listening...' : value}
            </button>
        </li>
    );
}