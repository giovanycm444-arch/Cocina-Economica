import React, { useState } from 'react';
import { 
  Users, CheckCircle, Clock, AlertCircle, RefreshCw, 
  Receipt, DollarSign, LogOut, Sparkles 
} from 'lucide-react';
import { RestaurantTable, TableStatus } from '../types';
import { dataService } from '../services/dataService';
import { soundEffects } from '../utils/audio';

interface TableGridProps {
  tables: RestaurantTable[];
  onSelectTable?: (table: RestaurantTable) => void;
  showActions?: boolean;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  onSelectTable,
  showActions = true,
}) => {
  const [selectedTableDetails, setSelectedTableDetails] = useState<RestaurantTable | null>(null);

  const availableCount = tables.filter((t) => t.status === 'disponible').length;
  const occupiedCount = tables.filter((t) => t.status === 'ocupada').length;
  const billingCount = tables.filter((t) => t.status === 'cuenta').length;

  const handleFreeTable = (tableId: string) => {
    soundEffects.cashRegister();
    dataService.freeTable(tableId);
    setSelectedTableDetails(null);
  };

  const handleSetStatus = (tableId: string, status: TableStatus) => {
    soundEffects.tap();
    dataService.setTableStatus(tableId, status);
    if (selectedTableDetails && selectedTableDetails.id === tableId) {
      setSelectedTableDetails({ ...selectedTableDetails, status });
    }
  };

  return (
    <div className="space-y-3">
      {/* KPI Counters Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="block font-bold text-emerald-800 text-[11px]">Disponibles</span>
          <span className="text-xl font-black text-emerald-950">{availableCount} mesas</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200">
          <span className="block font-bold text-red-800 text-[11px]">Ocupadas</span>
          <span className="text-xl font-black text-red-950">{occupiedCount} mesas</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
          <span className="block font-bold text-amber-800 text-[11px]">En Cuenta</span>
          <span className="text-xl font-black text-amber-950">{billingCount} mesas</span>
        </div>
      </div>

      {/* Visual Table Floor Plan Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {tables.map((tbl) => {
          const isAvail = tbl.status === 'disponible';
          const isOccupied = tbl.status === 'ocupada';
          const isBilling = tbl.status === 'cuenta';

          return (
            <div
              key={tbl.id}
              onClick={() => {
                soundEffects.tap();
                setSelectedTableDetails(tbl);
                if (onSelectTable) onSelectTable(tbl);
              }}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer active:scale-98 relative text-left shadow-xs flex flex-col justify-between ${
                isAvail
                  ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500'
                  : isBilling
                  ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20'
                  : 'bg-red-50/80 border-red-400 ring-2 ring-red-400/20'
              }`}
              style={{ minHeight: '100px' }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-sm text-stone-900">{tbl.name}</h4>
                  <span className="text-[10px] text-stone-500 flex items-center gap-1 font-semibold">
                    <Users className="w-3 h-3 text-stone-400" />
                    <span>{tbl.capacity} personas</span>
                  </span>
                </div>

                <span
                  className={`w-3 h-3 rounded-full ${
                    isAvail
                      ? 'bg-emerald-500 animate-pulse'
                      : isBilling
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  title={tbl.status}
                />
              </div>

              {/* Status and occupied info */}
              <div className="mt-2 pt-2 border-t border-stone-200/60">
                {isAvail ? (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    ✓ LIBRE
                  </span>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-stone-900 truncate max-w-[85px]">
                        {tbl.customerName || tbl.currentOrderNumber || 'Comensal'}
                      </span>
                      {tbl.totalAmount && (
                        <span className="font-black text-stone-900">${tbl.totalAmount}</span>
                      )}
                    </div>
                    {tbl.occupiedSince && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        Desde {tbl.occupiedSince}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Table Action Drawer/Modal */}
      {selectedTableDetails && showActions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h3 className="font-black text-stone-900 text-base">{selectedTableDetails.name}</h3>
                <p className="text-xs text-stone-500">Capacidad para {selectedTableDetails.capacity} personas</p>
              </div>
              <button
                onClick={() => setSelectedTableDetails(null)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Current Table State */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-semibold">Estado actual:</span>
                <span className={`px-2 py-0.5 rounded-md font-black uppercase text-[11px] ${
                  selectedTableDetails.status === 'disponible'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedTableDetails.status === 'cuenta'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedTableDetails.status === 'disponible' ? 'Libre / Disponible' : selectedTableDetails.status === 'cuenta' ? 'Pidiendo Cuenta' : 'Ocupada con Comensales'}
                </span>
              </div>

              {selectedTableDetails.status !== 'disponible' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-semibold">Cliente:</span>
                    <span className="font-bold text-stone-900">{selectedTableDetails.customerName || 'Cliente en mesa'}</span>
                  </div>
                  {selectedTableDetails.currentOrderNumber && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Orden comanda:</span>
                      <span className="font-bold text-orange-600">{selectedTableDetails.currentOrderNumber}</span>
                    </div>
                  )}
                  {selectedTableDetails.totalAmount && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Consumo acumulado:</span>
                      <span className="font-black text-stone-900 text-sm">${selectedTableDetails.totalAmount} MXN</span>
                    </div>
                  )}
                  {selectedTableDetails.occupiedSince && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Hora de llegada:</span>
                      <span className="font-medium text-stone-700">{selectedTableDetails.occupiedSince}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action buttons for Owner / Cashier */}
            <div className="pt-2 space-y-2">
              {selectedTableDetails.status !== 'disponible' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleFreeTable(selectedTableDetails.id)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>LIBERAR MESA (MARCAR DISPONIBLE)</span>
                  </button>

                  {selectedTableDetails.status === 'ocupada' && (
                    <button
                      type="button"
                      onClick={() => handleSetStatus(selectedTableDetails.id, 'cuenta')}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition"
                    >
                      Marcar &quot;Pidiendo Cuenta&quot;
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetStatus(selectedTableDetails.id, 'ocupada')}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition"
                >
                  Ocupar Mesa Manualmente
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
