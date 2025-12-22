import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
    CalculatorIcon,
    InformationCircleIcon,
    UserGroupIcon,
    TruckIcon,
    HomeIcon,
    BoltIcon,
    ShieldCheckIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

const BUFFER_PERCENT = 10;

const Tooltip = ({ text }) => (
    <div className="group relative inline-block ml-1 cursor-help z-50">
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-[var(--color-accent)] transition-colors" />
        <div className="invisible group-hover:visible absolute z-50 w-64 p-2 mt-1 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none shadow-xl">
            {text}
            <div className="absolute top-100 left-1/2 -ml-1 border-4 border-transparent border-t-gray-800"></div>
        </div>
    </div>
);

const AccordionItem = ({ id, icon: Icon, title, total, children, isOpen, onToggle, currency }) => (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden mb-3 shadow-sm bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface)]">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center p-4 bg-[var(--color-bg)] hover:bg-[var(--color-bg-alt)] transition-colors text-left"
        >
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${isOpen ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' : 'text-[var(--color-text-soft)]'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-[var(--color-text)]">{title}</span>
            </div>
            <div className="flex items-center gap-3">
                {total !== undefined && (
                    <span className="text-sm font-medium text-[var(--color-text-soft)]">{currency} {Math.round(total)}</span>
                )}
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
        </button>
        <div className={`transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
                {children}
            </div>
        </div>
    </div>
);

const InputRow = ({ label, value, onChange, min = 0, tooltip, isCurrency = true, currency }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
            <span className="text-sm text-[var(--color-text-soft)]">{label}</span>
            {tooltip && <Tooltip text={tooltip} />}
        </div>
        <div className="w-24 relative">
            {isCurrency && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{currency}</span>}
            <input
                type="number"
                min={min}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full ${isCurrency ? 'pl-8' : 'pl-2'} pr-2 py-1 text-sm border border-[var(--color-border)] rounded bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all`}
            />
        </div>
    </div>
);

const CostCalculator = ({ rent, currency = 'JOD' }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [openSection, setOpenSection] = useState('rent');

    // --- State ---
    const [monthlyRent, setMonthlyRent] = useState(parseFloat(rent) || 0);
    const [advanceRentMonths, setAdvanceRentMonths] = useState(1);

    const [roommateCount, setRoommateCount] = useState(0);

    const [utilities, setUtilities] = useState({
        electricity: 30, water: 10, internet: 20
    });
    const [shareUtilities, setShareUtilities] = useState(true);

    const [movingCosts, setMovingCosts] = useState({ transport: 50 });
    const [essentials, setEssentials] = useState({
        kitchen: 40, bedding: 30, internetSetup: 25
    });

    const [includeBuffer, setIncludeBuffer] = useState(true);

    // --- Calculations ---
    const totalPeople = roommateCount + 1;

    const upfrontRentCost = monthlyRent * advanceRentMonths;

    const totalMonthlyUtilities = Object.values(utilities).reduce((a, b) => a + b, 0);
    const myMonthlyUtilities = shareUtilities ? (totalMonthlyUtilities / totalPeople) : totalMonthlyUtilities;

    const totalMoving = Object.values(movingCosts).reduce((a, b) => a + b, 0);
    const totalEssentials = Object.values(essentials).reduce((a, b) => a + b, 0);

    const myEssentials = roommateCount > 0 ? (totalEssentials / totalPeople) : totalEssentials;
    const myMoving = totalMoving;

    const totalOneTime = myMoving + myEssentials;

    const totalUpfront = upfrontRentCost + totalOneTime;

    const myMonthlyRecurring = (monthlyRent / totalPeople) + myMonthlyUtilities;


    const baseTotalForBuffer = totalUpfront + myMonthlyUtilities;
    const bufferAmount = includeBuffer ? (baseTotalForBuffer * (BUFFER_PERCENT / 100)) : 0;

    const grandTotalMoveIn = totalUpfront + myMonthlyUtilities + bufferAmount;

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="themed-surface-alt rounded-2xl shadow-lg border border-[var(--color-border)] overflow-hidden transition-all duration-300">
            {/* Main Toggle Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg)] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <CalculatorIcon className="w-6 h-6 text-[var(--color-accent)]" />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-[var(--color-text)] text-lg">{t('smartCostCalculator')}</span>
                        <span className="text-xs text-[var(--color-text-soft)]">{t('planYourBudget')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[var(--color-accent)]">
                        {isOpen ? '' : `${currency} ${Math.round(grandTotalMoveIn).toLocaleString()}`}
                    </span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Expanded Content */}
            {isOpen && (
                <div className="p-5 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                    <div className="space-y-1">
                        {/* Rent Section */}
                        <AccordionItem
                            id="rent" icon={HomeIcon} title={t('rentAndContract')} total={upfrontRentCost}
                            isOpen={openSection === 'rent'} onToggle={() => toggleSection('rent')}
                            currency={currency}
                        >
                            <InputRow label={t('monthlyRent')} value={monthlyRent} onChange={setMonthlyRent} currency={currency} />
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center">
                                    <span className="text-sm text-[var(--color-text-soft)]">{t('advanceRent')}</span>
                                    <Tooltip text={t('advanceRentTooltip')} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range" min="0" max="12" value={advanceRentMonths}
                                        onChange={(e) => setAdvanceRentMonths(Number(e.target.value))}
                                        className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                                    />
                                    <span className="text-xs w-10 text-right font-mono text-[var(--color-text)]">{advanceRentMonths} {t('monthShort')}</span>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Roommates Section */}
                        <AccordionItem
                            id="roommates" icon={UserGroupIcon} title={t('roommates')}
                            isOpen={openSection === 'roommates'} onToggle={() => toggleSection('roommates')}
                            currency={currency}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--color-text-soft)]">{t('roommatesExcludingYou')}</span>
                                <div className="flex items-center gap-3 bg-[var(--color-bg)] rounded-lg p-1 border border-[var(--color-border)]">
                                    <button onClick={() => setRoommateCount(Math.max(0, roommateCount - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-bg-alt)] rounded text-lg">-</button>
                                    <span className="text-sm font-semibold w-6 text-center">{roommateCount}</span>
                                    <button onClick={() => setRoommateCount(roommateCount + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-bg-alt)] rounded text-lg">+</button>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Utilities Section */}
                        <AccordionItem
                            id="utilities" icon={BoltIcon} title={t('utilitiesMonthly')} total={myMonthlyUtilities}
                            isOpen={openSection === 'utilities'} onToggle={() => toggleSection('utilities')}
                            currency={currency}
                        >
                            <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                <input type="checkbox" checked={shareUtilities} onChange={(e) => setShareUtilities(e.target.checked)} className="rounded text-[var(--color-accent)]" />
                                <span className="text-xs text-[var(--color-text)]">{t('splitWith')} {roommateCount} {t('roommates')}</span>
                            </label>
                            <div className="space-y-1">
                                <InputRow label={t('electricity')} value={utilities.electricity} onChange={(v) => setUtilities({ ...utilities, electricity: v })} currency={currency} />
                                <InputRow label={t('water')} value={utilities.water} onChange={(v) => setUtilities({ ...utilities, water: v })} currency={currency} />
                                <InputRow label={t('internet')} value={utilities.internet} onChange={(v) => setUtilities({ ...utilities, internet: v })} currency={currency} />
                            </div>
                        </AccordionItem>

                        {/* Moving & Essentials Section */}
                        <AccordionItem
                            id="moving" icon={TruckIcon} title={t('movingAndEssentials')} total={myMoving + myEssentials}
                            isOpen={openSection === 'moving'} onToggle={() => toggleSection('moving')}
                            currency={currency}
                        >
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-[var(--color-text-soft)] uppercase tracking-wider mb-2">{t('transport')}</h4>
                                <InputRow label={t('movingTruck')} value={movingCosts.transport} onChange={(v) => setMovingCosts({ ...movingCosts, transport: v })} currency={currency} />
                                <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
                                    <h4 className="text-xs font-bold text-[var(--color-text-soft)] uppercase tracking-wider mb-2">{t('essentials')}</h4>
                                    <InputRow label={t('kitchen')} value={essentials.kitchen} onChange={(v) => setEssentials({ ...essentials, kitchen: v })} currency={currency} />
                                    <InputRow label={t('bedding')} value={essentials.bedding} onChange={(v) => setEssentials({ ...essentials, bedding: v })} currency={currency} />
                                    <InputRow label={t('internetSetup')} value={essentials.internetSetup} onChange={(v) => setEssentials({ ...essentials, internetSetup: v })} currency={currency} />
                                </div>
                            </div>
                        </AccordionItem>
                    </div>

                    {/* Buffer Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                            <span className="text-sm font-medium text-[var(--color-text)]">{t('emergencyBuffer')}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={includeBuffer} onChange={(e) => setIncludeBuffer(e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                        </label>
                    </div>

                    {/* Summary Footer */}
                    <div className="pt-4 mt-2 border-t-2 border-dashed border-[var(--color-border)]">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-[var(--color-text-soft)] uppercase">{t('totalMoveIn')}</span>
                            <span className="text-3xl font-extrabold text-[var(--color-accent)] leading-none">{currency} {Math.round(grandTotalMoveIn).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--color-text-soft)]">
                            <span>{t('upfrontRent')}: <strong>{currency}{upfrontRentCost}</strong></span>
                            <span>{t('monthly')}: <strong>{currency}{Math.round(myMonthlyRecurring)}</strong></span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostCalculator;

