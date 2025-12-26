import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Lock, Loader2, Info } from 'lucide-react';
import { getMonthDays, isDateInRange, formatDateRange, isDateBlocked, isSameDay } from '../utils/dateUtils';
import { DayInfo } from '../types';
import { fetchBlockedRanges } from '../services/bookingService';

interface DateTimeSelectionProps {
  selectedStart: Date | null;
  selectedEnd: Date | null;
  onWeekSelect: (start: Date, end: Date | null) => void;
  onContinue: () => void;
  variant?: 'full' | 'popover';
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedStart,
  selectedEnd,
  onWeekSelect,
  onContinue,
  variant = 'full',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<DayInfo[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [blockedRanges, setBlockedRanges] = useState<{start: Date, end: Date}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch blocked dates on mount (cache-first for fast UI, then refresh in background)
  useEffect(() => {
    const loadBookings = async () => {
	        setIsLoading(true);
	        const cachedRanges = await fetchBlockedRanges({ cache: 'cache-first' });
	        setBlockedRanges(cachedRanges);
	        setIsLoading(false);

	        fetchBlockedRanges({ cache: 'network-first' })
	          .then(setBlockedRanges)
	          .catch(() => {
	            // ignore, calendar stays usable with cached ranges
	          });
    };
    loadBookings();
  }, []);

  useEffect(() => {
    setDays(getMonthDays(currentDate.getFullYear(), currentDate.getMonth()));
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    if (isDateBlocked(date, blockedRanges)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start a new range selection
      onWeekSelect(date, null);
    } else {
      // Complete the range
      if (date < selectedStart) {
        // If clicked before start, make this new start
        onWeekSelect(date, null);
      } else if (isSameDay(date, selectedStart)) {
          // If clicked same day, do nothing or allow single day? 
          // Requirement: "at least 1 night", so let's enforce end > start
          // We'll treat clicking same day as deselecting/resetting to start
          onWeekSelect(date, null);
      } else {
        // Check if any blocked dates are in between
        const tempStart = new Date(selectedStart);
        let hasBlock = false;
        while(tempStart <= date) {
            if (isDateBlocked(tempStart, blockedRanges)) {
                hasBlock = true;
                break;
            }
            tempStart.setDate(tempStart.getDate() + 1);
        }

        if (hasBlock) {
             alert("Valitulla aikavälillä on varattuja päiviä. Valitse toinen ajankohta.");
             return;
        }

        onWeekSelect(selectedStart, date);
      }
    }
  };

  const handleMouseEnter = (date: Date) => {
    setHoveredDate(date);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const getDayDisplayInfo = (day: DayInfo) => {
    const isBlocked = isDateBlocked(day.date, blockedRanges);
    const disabled = day.isPast || isBlocked;

    let isSelected = false;
    let isRange = false;
    
    // Logic for selection visualization
    if (selectedStart && selectedEnd) {
        isSelected = isDateInRange(day.date, selectedStart, selectedEnd);
    } else if (selectedStart) {
        isSelected = isSameDay(day.date, selectedStart);
    }

    // Logic for hover visualization
    let isHoveredRange = false;
    if (selectedStart && !selectedEnd && hoveredDate && !disabled) {
        if (day.date >= selectedStart && day.date <= hoveredDate) {
            isHoveredRange = true;
        }
    }

    const isStart = selectedStart ? isSameDay(day.date, selectedStart) : false;
    const isEnd = selectedEnd ? isSameDay(day.date, selectedEnd) : false;

    // Check if it's Sunday (optional visual distinction, though now bookable)
    const isSunday = day.date.getDay() === 0;

    return { 
        isSelected, 
        isHoveredRange, 
        isBlocked, 
        disabled, 
        isStart, 
        isEnd, 
        isSunday 
    };
  };

  const currentMonthName = currentDate.toLocaleDateString('fi-FI', { month: 'long', year: 'numeric' });
  const formattedMonthName = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const selectedRangeText = selectedStart && selectedEnd 
    ? formatDateRange(selectedStart, selectedEnd)
    : selectedStart 
        ? "Valitse lopetuspäivä" 
        : "Valitse ajankohta";

  return (
    <div className={`h-full flex flex-col ${variant === 'full' ? 'animate-fade-in p-6 md:p-8' : 'p-4 sm:p-6'}`}>
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${variant === 'full' ? 'mb-6' : 'mb-4'}`}>
        {variant === 'full' && (
          <div>
             <h2 className="text-xl font-bold text-gray-900">Valitse varauksen kesto</h2>
             <p className="text-gray-500 text-sm">Valitse aloitus- ja lopetuspäivä.</p>
          </div>
        )}
        
        {/* Month Navigation */}
        <div className={`flex items-center bg-white rounded-lg p-1 border border-gray-100 shadow-sm w-full ${variant === 'full' ? 'sm:w-auto justify-between sm:justify-start' : 'justify-between'}`}>
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-md transition-all text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <span className="w-32 text-center text-sm font-semibold text-gray-900 select-none capitalize">
              {currentMonthName}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-md transition-all text-gray-600">
              <ChevronRight size={18} />
            </button>
        </div>
      </div>

      {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <Loader2 className="animate-spin text-[#ffd166]" size={32} />
          </div>
      ) : (
        <div className="flex-1 flex flex-col gap-8">
            {/* Calendar Grid */}
            <div className="flex-1 select-none">
            <div className="grid grid-cols-7 mb-2">
                {['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'].map(d => (
                <div key={d} className={`text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider py-2 ${d === 'Su' ? 'text-red-400' : 'text-gray-400'}`}>
                    {d}
                </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 sm:gap-y-2">
                {days.map((day, idx) => {
                const { isSelected, isHoveredRange, isBlocked, disabled, isStart, isEnd } = getDayDisplayInfo(day);
                
                let bgClass = '';
                let textClass = 'text-gray-700';
                let cursorClass = 'cursor-pointer';
                let roundedClass = 'rounded-full'; 
                let ringClass = '';

                if (disabled) {
                    cursorClass = 'cursor-not-allowed';
                    if (isBlocked) {
                        bgClass = 'bg-gray-100 relative overflow-hidden';
                        textClass = 'text-gray-300 line-through decoration-gray-300';
                    } else {
                        // Past dates
                        textClass = 'text-gray-300';
                    }
                } else {
                    if (isStart || isEnd) {
                        bgClass = 'bg-[#ffd166] shadow-md shadow-orange-100 z-10';
                        textClass = 'text-gray-900 font-bold'; // Dark text on yellow
                    } else if (isSelected || isHoveredRange) {
                        bgClass = 'bg-[#fff5d6]'; // Very light yellow
                        textClass = 'text-gray-900';
                        roundedClass = 'rounded-none'; // Connect the range
                        
                        // Handle edges of range visual
                        if (isStart) roundedClass = 'rounded-l-full';
                        if (isEnd) roundedClass = 'rounded-r-full';
                    }
                }

                // Range connectors
                if ((isSelected || isHoveredRange) && !isStart && !isEnd) {
                    // Middle of range
                } else if (isStart && (selectedEnd || isHoveredRange)) {
                    roundedClass = 'rounded-l-full rounded-r-none';
                } else if (isEnd) {
                    roundedClass = 'rounded-r-full rounded-l-none';
                }

                return (
                    <div key={idx} className="relative h-9 sm:h-12 p-0.5"> 
                    <button
                        onClick={() => handleDayClick(day.date)}
                        onMouseEnter={() => handleMouseEnter(day.date)}
                        onMouseLeave={handleMouseLeave}
                        disabled={disabled}
                        className={`
                        w-full h-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-150
                        ${bgClass} ${textClass} ${roundedClass} ${cursorClass} ${ringClass}
                        ${day.isToday && !isSelected && !disabled ? 'ring-2 ring-[#ffd166] text-gray-900 font-bold' : ''}
                        ${!day.isCurrentMonth && !isSelected && !isHoveredRange && !disabled ? 'opacity-30' : ''}
                        `}
                    >
                        {day.dayNumber}
                        {isBlocked && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 sm:hover:opacity-100 transition-opacity bg-white/80 rounded-inherit border border-gray-100">
                                <Lock size={12} className="text-gray-400" />
                            </div>
                        )}
                    </button>
                    </div>
                );
                })}
            </div>
            </div>

            {/* Action Panel */}
            {variant === 'full' ? (
              <div className="w-full flex flex-col animate-slide-in-right">
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex flex-col">
                              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Valittu aika</h3>
                              {selectedStart ? (
                                  <div>
                                      <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                                          {selectedRangeText}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                          <CalendarIcon className="text-[#e0b040]" size={16}/>
                                          <span className="font-semibold text-gray-600 text-sm">{selectedStart.getFullYear()}</span>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="text-gray-400 py-2 text-sm flex items-center gap-2">
                                      <Info size={16} />
                                      <p>Valitse aloituspäivä kalenterista</p>
                                  </div>
                              )}
                          </div>

                          <button
                              onClick={onContinue}
                              disabled={!selectedStart || !selectedEnd}
                              className={`
                                  w-full sm:w-auto py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all
                                  ${selectedStart && selectedEnd
                                      ? 'bg-[#ffd166] hover:bg-[#ffc642] text-gray-900 shadow-orange-100 hover:shadow-orange-200 transform active:scale-[0.98]' 
                                      : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}
                              `}
                          >
                              Jatka <Check size={18} />
                          </button>
                      </div>
                  </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedStart && selectedEnd ? selectedRangeText : 'Valitse ajankohta'}
                  </div>
                  <button
                    onClick={onContinue}
                    disabled={!selectedStart || !selectedEnd}
                    className={`w-full sm:w-auto py-2.5 px-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                      ${selectedStart && selectedEnd
                        ? 'bg-[#ffd166] hover:bg-[#ffc642] text-gray-900 shadow-orange-100 hover:shadow-orange-200 transform active:scale-[0.98]'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                  >
                    Valitse <Check size={16} />
                  </button>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
