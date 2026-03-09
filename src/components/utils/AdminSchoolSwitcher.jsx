import React from 'react';
import { SCHOOL_CONFIG } from './schoolConfig';
import { ChevronDown } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

export default function AdminSchoolSwitcher({ currentSchool, onSchoolChange, tokens }) {
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors text-sm font-black text-slate-900 tracking-tight">
                    {SCHOOL_CONFIG[currentSchool]?.name || currentSchool || "Select School"}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-[100] w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={5}
                    align="start"
                >
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch School (Admin)
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {Object.entries(SCHOOL_CONFIG).map(([id, config]) => (
                            <button
                                key={id}
                                onClick={() => onSchoolChange(id)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50 ${currentSchool === id ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                                    }`}
                            >
                                {config.name}
                                {currentSchool === id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
