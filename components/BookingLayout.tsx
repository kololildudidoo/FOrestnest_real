import React, { ReactNode, useState } from 'react';
import { Tent, CalendarDays, Info, X, Key, Flame, FileText, Clock, PawPrint, Users, Compass, Edit2, MapPin } from 'lucide-react';
import { BookingState } from '../types';

interface BookingLayoutProps {
  children: ReactNode;
  state: BookingState;
  onBack?: () => void;
  onEditDates?: () => void;
  onReturnHome?: () => void;
}

const BookingLayout: React.FC<BookingLayoutProps> = ({ children, state, onEditDates, onReturnHome }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const showSidebar = state.step !== 'success';
  
  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-6 lg:p-8 bg-gray-50 relative">
      
      {/* Exit Button */}
      {onReturnHome && (
          <button 
            onClick={onReturnHome}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-500 hover:text-gray-900 hover:scale-105 transition-all"
            aria-label="Return to home"
          >
            <X size={20} />
          </button>
      )}

      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[600px] transition-all duration-300 relative z-0">
        
        {/* Sidebar Info */}
        {showSidebar && (
          <div className="w-full md:w-80 lg:w-96 bg-[#fffbf0] p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col gap-6 flex-shrink-0">
            
            <div className="flex flex-col gap-4 mt-2">
              <div className="w-12 h-12 rounded-xl bg-[#ffd166] flex items-center justify-center border border-[#e6bd5c]">
                <Tent className="text-gray-900" size={24} />
              </div>
              
              <div>
                <h2 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">Mökin vuokraus</h2>
                <h1 className="text-2xl font-bold text-gray-900">Forest Nest</h1>
              </div>

              <div className="space-y-4 text-gray-600 mt-2">
                <div className="flex items-start gap-3">
                   <CalendarDays className="w-5 h-5 text-gray-400 mt-0.5" />
                   <div>
                      <p className="font-medium text-gray-900">Joustava varaus</p>
                      <p className="text-sm text-gray-500">Valitse saapumis- ja lähtöpäivä</p>
                   </div>
                </div>
                
                <p className="text-sm text-gray-500 border-t border-gray-200 pt-4 leading-relaxed">
                   Forest Nest tarjoaa täydellisen irtioton arjesta. Nauti luonnon rauhasta, saunasta ja upeista ulkoilumahdollisuuksista.
                </p>

                {/* Instructions Button */}
                <button
                  onClick={() => setShowInstructions(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#cfa028] hover:text-[#b0871f] hover:bg-amber-50 py-2 px-3 -ml-3 rounded-lg transition-colors w-max"
                >
                  <Info size={18} />
                  <span>Ehdot ja lisäpalvelut</span>
                </button>
              </div>
            </div>

            <div className="mt-auto hidden md:block">
                {state.startDate && state.endDate && (
                   <div className="animate-fade-in-up p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative group">
                      <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-semibold text-[#cfa028] uppercase tracking-wide">Valittu aika</p>
                          {onEditDates && (
                              <button 
                                onClick={onEditDates}
                                className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1 transition-colors"
                              >
                                <Edit2 size={10} /> Muokkaa
                              </button>
                          )}
                      </div>
                      <p className="text-gray-900 font-medium">
                        {state.startDate.toLocaleDateString('fi-FI', { month: 'numeric', day: 'numeric' })}. - {state.endDate.toLocaleDateString('fi-FI', { month: 'numeric', day: 'numeric' })}.
                      </p>
                   </div>
                )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`w-full flex-1 relative overflow-hidden bg-white flex flex-col`}>
          <div className="flex-1 h-full overflow-hidden">
             {children}
          </div>
        </div>
      </div>

      {/* Instructions Modal / Lightbox */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Info className="text-[#ffd166]" size={24} />
                  Ehdot ja lisäpalvelut
              </h3>
              <button
                  onClick={() => setShowInstructions(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                  <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
              
              {/* Section 1: Terms */}
              <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <FileText size={20} />
                  </div>
                  <div className="space-y-3">
                      <p className="font-bold text-gray-900 text-lg">Varausehdot</p>
                      
                      <div>
                        <span className="font-semibold text-gray-800 text-sm block">Peruutusehdot</span>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Varaus voidaan perua 30 päivää ennen vuokra-ajan alkua (90% palautus). Peruutus tulee tehdä kirjallisesti verkkosivujen kautta.
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-800 text-sm block">Maksut ja Ohjeet</span>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Vuokra maksetaan 5 päivän kuluessa varauksesta. Maksulinkki toimitetaan sähköpostitse.
                        </p>
                      </div>

                       <div>
                        <span className="font-semibold text-gray-800 text-sm block">Vastuu ja säännöt</span>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Vuokralainen vastaa irtaimistosta. Tupakointi kielletty sisätiloissa.
                        </p>
                      </div>
                  </div>
              </div>

              {/* Section 2: Arrival */}
              <div className="flex gap-4">
                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                      <Key size={20} />
                  </div>
                  <div>
                      <p className="font-bold text-gray-900 text-lg mb-2">Saapuminen</p>
                       <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          Saat saapumisohjeet sähköpostitse. Avaimet löytyvät avainlaatikosta, koodi toimitetaan saapumispäivän aamuna.
                      </p>
                      <div className="flex gap-4 text-sm font-medium text-gray-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                          <div className="flex items-center gap-1.5">
                             <Clock size={16} className="text-amber-500"/> Sisään: 15.00
                          </div>
                           <div className="flex items-center gap-1.5">
                             <Clock size={16} className="text-amber-500"/> Ulos: 11.00
                          </div>
                      </div>
                  </div>
              </div>

              {/* Section 3: Add-ons */}
              <div className="flex gap-4">
                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                      <Flame size={20} />
                  </div>
                   <div className="w-full">
                      <p className="font-bold text-gray-900 text-lg mb-3">Lisäpalvelut</p>
                      <div className="grid gap-2">
                          <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                              <span className="text-gray-700 flex items-center gap-2"><Flame size={14} /> Lisäpolttopuut (2 saunavuoroa)</span>
                              <span className="font-semibold text-gray-900">10 €</span>
                          </div>
                          <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                              <span className="text-gray-700 flex items-center gap-2"><Clock size={14} /> Aikainen sisään / myöhäinen ulos (+2h)</span>
                              <span className="font-semibold text-gray-900">20 €</span>
                          </div>
                          <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                              <span className="text-gray-700 flex items-center gap-2"><PawPrint size={14} /> Lemmikkimaksu</span>
                              <span className="font-semibold text-gray-900">20 €</span>
                          </div>
                          <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                              <span className="text-gray-700 flex items-center gap-2"><Users size={14} /> Lisähenkilöt (3. vieraasta alk.)</span>
                              <span className="font-semibold text-gray-900">15 € / yö</span>
                          </div>
                      </div>
                  </div>
              </div>

               {/* Section 4: Attractions */}
              <div className="flex gap-4">
                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                      <Compass size={20} />
                  </div>
                  <div>
                      <p className="font-bold text-gray-900 text-lg mb-2">Lähialueen nähtävyydet</p>
                      <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                          <li><span className="font-medium text-gray-800">Torronsuon kansallispuisto</span></li>
                          <li><span className="font-medium text-gray-800">Somerniemen kesätori</span></li>
                          <li><span className="font-medium text-gray-800">Ämyrin tanssilava</span> – tanssit, luontopolut, hiihtoladut</li>
                          <li><span className="font-medium text-gray-800">Hiidenlinna & Sisumetsän seikkailupuisto</span></li>
                      </ul>
                      
                      <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5"><MapPin size={14} /> Lähijärvet</p>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Isovalkee, Jyrkälampi, Hirsjärvi. <br/>
                            <span className="text-gray-700">Oinasjärvi:</span> ranta, laiturit, sopii lapsille.<br/>
                            <span className="text-gray-700">Nurmijärvi:</span> ranta, hyppytorni, yleinen sauna.
                          </p>
                      </div>
                  </div>
              </div>

            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end flex-shrink-0">
              <button
                  onClick={() => setShowInstructions(false)}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
              >
                  Sulje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingLayout;